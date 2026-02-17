// vite.config.mjs
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react({
        include: '**/*.{js,jsx}',
        babel: {
          presets: [
            ['@babel/preset-react', { runtime: 'automatic' }]
          ]
        }
      })
    ],
    server: {
      port: 3000,
      open: true,
      host: true,
      hmr: {
        overlay: false
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: true
        }
      }
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'import.meta.env.NODE_ENV': JSON.stringify(mode)
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'firebase', 'firebase/auth', 'firebase/firestore'],
      exclude: ['js-big-decimal']
    }
  }
})