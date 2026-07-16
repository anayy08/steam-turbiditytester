import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      // In dev, forward /api/* to the local proxy server (server-dev.js).
      // In production on Vercel, /api/* is served directly by api/chat.js -
      // this block is dev-only and has no effect on the deployed build.
      '/api': {
        target: `http://localhost:${process.env.DEV_API_PORT || 8788}`,
        changeOrigin: true,
      },
    },
  },
});
