import { computed, nextTick, onMounted, ref, watch } from 'vue'

const STORAGE_KEY = 'chat-frontend-sessions-v1'

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const defaultSessions = [
  {
    id: makeId(),
    title: '欢迎使用 AI 助手',
    pinned: false,
    updatedAt: Date.now(),
    messages: [
      {
        role: 'assistant',
        content: '你好！我是你的 AI 助手，有什么可以帮你的吗？\n\n我可以帮你写代码、解答问题、翻译文本等。试试发送一条包含代码的消息，体验代码块复制功能吧！'
      }
    ]
  }
]

export function useChatApp({ scrollToBottom = () => {} } = {}) {
  const sidebarOpen = ref(false)
  const currentSessionId = ref('')
  const inputText = ref('')
  const loading = ref(false)
  const sessionSearch = ref('')
  const sessionMenuId = ref('')
  const readonlyMode = ref(false)
  const longPressTimer = ref(0)

  const sessions = ref([])
  const messages = ref([])

  const activeSession = computed(() => sessions.value.find((session) => session.id === currentSessionId.value))
  const filteredSessions = computed(() => {
    const query = sessionSearch.value.trim().toLowerCase()
    const list = [...sessions.value].sort((a, b) => {
      if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned)
      return (b.updatedAt || 0) - (a.updatedAt || 0)
    })

    if (!query) return list

    return list.filter((session) => {
      const titleMatch = session.title.toLowerCase().includes(query)
      const messageMatch = (session.messages || []).some((msg) =>
        (msg.content || '').toLowerCase().includes(query)
      )

      return titleMatch || messageMatch
    })
  })

  const persistSessions = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value))
  }

  const updateSessionMeta = () => {
    const session = activeSession.value
    if (session) session.updatedAt = Date.now()
  }

  const simulateAssistantReply = (text) => {
    return `收到你的消息："${text}"\n\n这是一个模拟回复，包含一段代码示例：\n\n\`\`\`javascript\nfunction greet(name) {\n  console.log(\`Hello, \${name}!\`)\n}\n\ngreet('World')\n\`\`\`\n\n以及一段行内代码 \`const x = 42\`，你可以测试代码块的独立复制功能。`
  }

  const createNewChat = () => {
    const session = {
      id: makeId(),
      title: `新对话${sessions.value.length + 1}`,
      pinned: false,
      updatedAt: Date.now(),
      messages: []
    }

    sessions.value.unshift(session)
    currentSessionId.value = session.id
    messages.value = session.messages
    sidebarOpen.value = false
    persistSessions()
    nextTick(() => scrollToBottom(false))
  }

  const switchSession = (sessionId) => {
    const target = sessions.value.find((session) => session.id === sessionId)
    if (!target) return

    currentSessionId.value = sessionId
    messages.value = target.messages
    sidebarOpen.value = false
    nextTick(() => scrollToBottom(false))
  }

  const showSessionMenu = (sessionId) => {
    sessionMenuId.value = sessionId
  }

  const startLongPress = (sessionId) => {
    longPressTimer.value = window.setTimeout(() => {
      sessionMenuId.value = sessionId
    }, 500)
  }

  const clearLongPress = () => {
    if (longPressTimer.value) {
      window.clearTimeout(longPressTimer.value)
      longPressTimer.value = 0
    }
  }

  const renameSession = (sessionId) => {
    const target = sessions.value.find((session) => session.id === sessionId)
    if (!target) return

    const inputTitle = window.prompt('请输入新会话标题', target.title)
    if (!inputTitle) return

    target.title = inputTitle.trim() || target.title
    target.updatedAt = Date.now()
    sessionMenuId.value = ''
    persistSessions()
  }

  const togglePin = (sessionId) => {
    const target = sessions.value.find((session) => session.id === sessionId)
    if (!target) return

    target.pinned = !target.pinned
    target.updatedAt = Date.now()
    sessionMenuId.value = ''
    persistSessions()
  }

  const deleteSession = (sessionId) => {
    const target = sessions.value.find((session) => session.id === sessionId)
    if (!target) return

    const confirmed = window.confirm(`是否删除此对话？\n\n${target.title}`)
    if (!confirmed) return

    const remainingSessions = sessions.value.filter((session) => session.id !== sessionId)
    sessions.value = remainingSessions

    if (currentSessionId.value === sessionId) {
      currentSessionId.value = remainingSessions[0]?.id || ''
      messages.value = remainingSessions[0]?.messages || []
    }

    sessionMenuId.value = ''
    persistSessions()
  }

  const exportMarkdown = () => {
    const session = activeSession.value
    if (!session) return

    const lines = session.messages.map((msg) => {
      const role = msg.role === 'user' ? '用户' : '助手'
      return `## ${role}\n${msg.content}\n`
    })

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${session.title}.md`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const exportPdf = () => {
    window.print()
  }

  const encodeSharePayload = (data) => {
    const text = JSON.stringify(data)
    const encoded = encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(Number(`0x${hex}`)))
    return btoa(encoded)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')
  }

  const decodeSharePayload = (payload) => {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const decoded = decodeURIComponent(
      Array.from(atob(padded), (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')
    )
    return JSON.parse(decoded)
  }

  const copyShareLink = async () => {
    const session = activeSession.value
    if (!session) return

    const payload = encodeSharePayload({
      title: session.title,
      messages: session.messages
    })

    const url = `${window.location.origin}${window.location.pathname}?share=${payload}`
    try {
      await navigator.clipboard.writeText(url)
      window.alert('分享链接已复制到剪贴板')
    } catch {
      window.prompt('复制失败，请手动复制分享链接', url)
    }
  }

  const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || loading.value || readonlyMode.value) return

  const userMessage = { role: 'user', content: text }
  messages.value.push(userMessage)
  const assistantMessage = { role: 'assistant', content: '' }
  messages.value.push(assistantMessage)

  inputText.value = ''
  loading.value = true
  updateSessionMeta()
  persistSessions()
  scrollToBottom(true)

  try {
    // 只请求本地后端接口，不写任何AI密钥
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: messages.value.slice(0, -1)
      })
    })

    const data = await res.json()
    if (data.error) throw new Error(data.error)

    // 打字机效果不变
    const reply = data.reply
    let cursor = 0
    const stream = () => {
      if (cursor >= reply.length) {
        loading.value = false
        activeSession.value && (activeSession.value.updatedAt = Date.now())
        persistSessions()
        scrollToBottom(true)
        return
      }
      assistantMessage.content += reply[cursor]
      cursor++
      scrollToBottom(true)
      setTimeout(stream, 16)
    }
    stream()

  } catch (e) {
    assistantMessage.content = '出错：' + e.message
    loading.value = false
  }
}

  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        sessions.value = JSON.parse(saved)
      } catch {
        sessions.value = defaultSessions
      }
    } else {
      sessions.value = defaultSessions
    }

    const sharePayload = new URLSearchParams(window.location.search).get('share')
    if (sharePayload) {
      try {
        const payload = decodeSharePayload(sharePayload)
        readonlyMode.value = true
        sessions.value = [
          {
            id: makeId(),
            title: payload.title || '分享会话',
            pinned: false,
            updatedAt: Date.now(),
            messages: payload.messages || []
          }
        ]
      } catch {
        readonlyMode.value = false
      }
    }

    if (!currentSessionId.value && sessions.value.length) {
      currentSessionId.value = sessions.value[0].id
      messages.value = sessions.value[0].messages
    }

    nextTick(() => scrollToBottom(false))
  })

  watch(sessions, () => {
    persistSessions()
  }, { deep: true })

  return {
    sidebarOpen,
    currentSessionId,
    inputText,
    loading,
    sessionSearch,
    sessionMenuId,
    readonlyMode,
    longPressTimer,
    sessions,
    messages,
    activeSession,
    filteredSessions,
    createNewChat,
    switchSession,
    showSessionMenu,
    startLongPress,
    clearLongPress,
    renameSession,
    togglePin,
    deleteSession,
    exportMarkdown,
    exportPdf,
    copyShareLink,
    sendMessage,
    persistSessions,
    updateSessionMeta
  }
}
