import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      // 开发环境通过 Vite 代理转发到后端，避免浏览器跨域
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
