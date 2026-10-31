import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Long-lived vendor chunks: they change rarely, so browsers keep them cached across deploys
const VENDOR_CHUNKS = {
  'react-vendor': ['react', 'react-dom', 'react-router', 'react-router-dom'],
  charts: ['recharts'],
  maps: ['leaflet', 'react-leaflet'],
}

const vendorChunk = (id) => {
  if (!id.includes('node_modules')) return undefined
  for (const [chunk, packages] of Object.entries(VENDOR_CHUNKS)) {
    if (packages.some(pkg => id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`))) {
      return chunk
    }
  }
  return undefined
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: vendorChunk,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
