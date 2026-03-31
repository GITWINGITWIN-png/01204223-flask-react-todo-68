import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,                          // ทำให้เรียกฟังก์ชันเกี่ยวกับการเทสได้โดยไม่ต้องประกาศ
    environment: 'jsdom',                   // รันเทสแบบไม่มี browser
    setupFiles: './src/setupTests.js',      // ระบุโค้ดสำหรับเตรียมต่าง ๆ
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000/',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../backend/frontend-static',
    emptyOutDir: true,
  },
})
