import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import { createHtmlPlugin } from 'vite-plugin-html';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  // Filter out false values from plugins array
  const plugins = [
    react(),
  ];

  // Add PWA only in production
  // PWA plugin disabled due to vite-plugin-pwa dependency resolution issues
  // if (isProduction) {
  //   plugins.push(
  //     VitePWA({...})
  //   );
  // }

  // Add compression plugins
  plugins.push(
    viteCompression({
      algorithm: 'gzip',
      threshold: 10240,
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      threshold: 10240,
    })
  );

  // Add HTML plugin
  plugins.push(
    createHtmlPlugin({
      minify: isProduction,
      inject: {
        data: {
          title: env.VITE_APP_NAME || 'Career Connect Lesotho',
          description: 'Bridging youth, education, and employment opportunities in Lesotho',
        },
      },
    })
  );

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDevelopment,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
            ui: ['react-bootstrap', 'bootstrap', 'framer-motion'],
            charts: ['chart.js', 'react-chartjs-2', 'recharts'],
            forms: ['formik', 'yup', 'react-hook-form'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      port: 5173,
      host: true,
      open: true,
      cors: true,
      strictPort: true,
    },
    preview: {
      port: 4173,
      host: true,
      strictPort: true,
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/auth'],
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
  };
});
