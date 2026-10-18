import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@kilauea/core', '@kilauea/dom', '@kilauea/codemirror', '@kilauea/react'],
    include: ['@kilauea/dom > pele', 'react', 'react-dom'],
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
