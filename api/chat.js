export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持POST' })
  }

  // 从Vercel后台读取密钥
  const API_KEY = process.env.SILICONFLOW_API_KEY
  if (!API_KEY) {
    return res.status(500).json({ error: '后台未配置AI密钥' })
  }

  const { messages } = req.body

  try {
    const result = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: messages,
        stream: false
      })
    })

    const json = await result.json()
    return res.json({ reply: json.choices[0].message.content })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}