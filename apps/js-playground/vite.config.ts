import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    // workspace TS sources are transformed directly, never pre-bundled
    exclude: ['@visimer/core', '@visimer/dom', '@visimer/codemirror'],
    // pre-bundle deps up front so a mid-session discovery never invalidates
    // the dep cache under an open tab (pele is a dependency of @visimer/dom)
    include: ['@visimer/dom > pele', '@codemirror/state', '@codemirror/view', '@codemirror/commands', '@codemirror/language', '@lezer/highlight'],
  },
  server: {
    port: 5174,
    strictPort: true,
  },
})
