import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const toPath = (relativeUrl) => fileURLToPath(new URL(relativeUrl, import.meta.url))

const createAliases = () => ({
  '@': toPath('./src'),
  '~': toPath('./src'),
  '@api': toPath('./src/shared/api'),
  '@store': toPath('./src/shared/store'),
  '@assets': toPath('./src/shared/assets'),
})

const createOpenInEditorPlugin = (openInEditor, editor = 'webstorm') => ({
  name: 'vite-plugin-open-in-editor',
  configureServer(server) {
    server.middlewares.use('/__open-in-editor', openInEditor(editor))
  },
})

const createPlugins = ({ mode, openInEditor }) =>
    [
      vue(),
      tailwindcss(),
      mode === 'development' ? VueDevTools() : null,
      createOpenInEditorPlugin(openInEditor),
    ].filter(Boolean)

const createBuildConfig = () => ({
  outDir: 'dist',
  chunkSizeWarningLimit: 1000,
  rollupOptions: {
    output: {
      manualChunks(id) {
        return id.includes('node_modules') ? 'vendor' : 'app'
      },
    },
  },
})

const createServerConfig = () => ({
  host: true,
  port: 5173,
})

const createDefineConfig = () => ({
  __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
})

const loadOpenInEditor = async () => {
  const { default: openInEditor } = await import('launch-editor-middleware')
  return openInEditor
}

export default defineConfig(async ({ mode }) => {
  const openInEditor = await loadOpenInEditor()

  return {
    plugins: createPlugins({ mode, openInEditor }),
    resolve: { alias: createAliases() },
    server: createServerConfig(),
    build: createBuildConfig(),
    define: createDefineConfig(),
  }
})
