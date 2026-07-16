// Local-only dev proxy so the chat widget has something to talk to when
// running `npm run dev`. Mirrors api/chat.js (the real Vercel function) so
// the two never drift apart. Never deployed - Vercel uses api/chat.js directly.
import { createServer } from 'node:http';
import { handleChat } from './lib/chat-handler.js';

const PORT = process.env.DEV_API_PORT || 8788;

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== 'POST' || req.url !== '/api/chat') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not found.' }));
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1e6) req.destroy();
  });
  req.on('end', async () => {
    try {
      const { messages } = body ? JSON.parse(body) : {};
      const reply = await handleChat(messages, process.env.GROQ_API_KEY, process.env.GROQ_MODEL);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ reply }));
    } catch (err) {
      const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Something went wrong.' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[dev-api] chat proxy listening on http://localhost:${PORT}`);
  if (!process.env.GROQ_API_KEY) {
    console.warn('[dev-api] WARNING: GROQ_API_KEY is not set. Run with: node --env-file=.env.local server-dev.js');
  }
});
