
cat > vite.config.js << 'EOF'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    port: process.env.PORT || 3000
  }
})
EOF
