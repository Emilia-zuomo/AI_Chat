export default async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' });
  }

  const API_KEY = process.env.SILICONFLOW_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: '后台未配置 SILICONFLOW_API_KEY' });
  }

  const { messages } = req.body;

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
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
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: `API 调用失败: ${JSON.stringify(errorData)}` });
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      return res.status(500).json({ error: '模型无返回内容' });
    }

    return res.status(200).json({ reply: data.choices[0].message.content });
  } catch (error) {
    return res.status(500).json({ error: `服务器错误: ${error.message}` });
  }
}
