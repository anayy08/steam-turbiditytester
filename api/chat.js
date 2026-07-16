import { handleChat } from '../lib/chat-handler.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { messages } = req.body || {};
    const reply = await handleChat(messages, process.env.XAI_API_KEY, process.env.XAI_MODEL);
    return res.status(200).json({ reply });
  } catch (err) {
    const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
    return res.status(status).json({ error: err.message || 'Something went wrong.' });
  }
}
