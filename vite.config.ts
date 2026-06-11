import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // three.js 단일 번들(~1MB)이 의도된 구성 — 초기 1회 로드, 코드 분할 이득 없음 (M6-3)
    chunkSizeWarningLimit: 1300,
  },
})
