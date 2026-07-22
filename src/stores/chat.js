export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({msg:"only POST"})
  }

  const key = process.env.SILICONFLOW_API_KEY
  if (!key) return res.status(500).json({msg:"no key"})

  const { messages } = req.body

  const r = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
    method:"POST",
    headers:{
      "Authorization":"Bearer "+key,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      model:"deepseek-ai/DeepSeek-V3",
      messages
    })
  })

  const json = await r.json()
  res.json({reply:json.choices[0].message.content})
}

  function switchSession(id) {
    currentSessionId.value = id
  }

  function deleteSession(id) {
    sessions.value = sessions.value.filter(s => s.id !== id)
    if (currentSessionId.value === id) {
      currentSessionId.value = sessions.value[0]?.id || null
    }
    saveHistory()
  }

  function updateSessionTitle(id, title) {
    const session = sessions.value.find(s => s.id === id)
    if (session) { session.title = title; saveHistory() }
  }

  // ===== 消息操作 =====
  function addUserMessage(content) {
    const session = sessions.value.find(s => s.id === currentSessionId.value)
    if (!session) return
    session.messages.push({ role: 'user', content })
    // 自动用第一条用户消息作为标题
    if (session.messages.length === 2) {
      session.title = content.slice(0, 20) + (content.length > 20 ? '...' : '')
    }
    saveHistory()
  }

  function startAiMessage() {
    const session = sessions.value.find(s => s.id === currentSessionId.value)
    if (!session) return
    session.messages.push({ role: 'assistant', content: '' })
    saveHistory()
  }

  function appendAiMessage(chunk) {
    const session = sessions.value.find(s => s.id === currentSessionId.value)
    if (!session) return
    const lastMsg = session.messages[session.messages.length - 1]
    if (lastMsg && lastMsg.role === 'assistant') {
      lastMsg.content += chunk
    } else {
      session.messages.push({ role: 'assistant', content: chunk })
    }
    saveHistory()
  }

  // 🆕 删除最后 N 条非 system 消息（用于重新生成）
  function removeLastRound() {
    const session = sessions.value.find(s => s.id === currentSessionId.value)
    if (!session) return
    // 移除最后的 assistant 回复
    if (session.messages.at(-1)?.role === 'assistant') session.messages.pop()
    // 移除对应的 user 提问
    if (session.messages.at(-1)?.role === 'user') session.messages.pop()
    saveHistory()
  }

  function clearMessages() {
    const session = sessions.value.find(s => s.id === currentSessionId.value)
    if (!session) return
    session.messages = [session.messages[0]] // 保留 system prompt
    saveHistory()
  }

  // 初始化时如果没有会话，创建一个
  if (sessions.value.length === 0) createSession()

  return {
    sessions, currentSessionId, messages,
    createSession, switchSession, deleteSession, updateSessionTitle,
    addUserMessage, startAiMessage, appendAiMessage, removeLastRound, clearMessages
  }