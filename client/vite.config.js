import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import { fileURLToPath, URL } from 'node:url'

const resolveAlias = (path) => fileURLToPath(new URL(path, import.meta.url))

const createOpenInEditorPlugin = (openInEditor) => ({
  name: 'vite-plugin-open-in-editor',
  configureServer(server) {
    server.middlewares.use('/__open-in-editor', openInEditor('webstorm'))
  },
})

export default defineConfig(async ({ mode }) => {
  const { default: openInEditor } = await import('launch-editor-middleware')

  return {
    plugins: [
      vue(),
      mode === 'development' ? VueDevTools() : null,
      createOpenInEditorPlugin(openInEditor),
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': resolveAlias('./src'),
        '~': resolveAlias('./src'),
        '@api': resolveAlias('./src/shared/api'),
        '@store': resolveAlias('./src/shared/store'),
        '@assets': resolveAlias('./src/shared/assets'),
      },
    },

    server: {
      host: true,
      port: 5173,
    },

    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            return id.includes('node_modules') ? 'vendor' : 'app'
          },
        },
      },
    },

    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },
  }
})
