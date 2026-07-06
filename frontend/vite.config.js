import { defineConfig, loadEnv } from 'vite'
import { cwd } from 'process'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files for the current mode and make VITE_API_URL available
  const env = loadEnv(mode, cwd())
  const apiUrl = env.VITE_API_URL || 'https://smartskill-ai-3.onrender.com/api'

  return {
    plugins: [react()],
    define: {
      // Ensure environment variables are accessible in the client bundle
      __API_URL__: JSON.stringify(apiUrl),
    },
    optimizeDeps: {
      include: ["lucide-react", "framer-motion", "axios", "react-router-dom"],
    },
    server: {
      hmr: {
        overlay: true,
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  }
})
