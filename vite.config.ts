import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dns from 'node:dns';

dns.setDefaultResultOrder('verbatim');

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
    hmr: {
      host: '127.0.0.1'
    }
  }
});