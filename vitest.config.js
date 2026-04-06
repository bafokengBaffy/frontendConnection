import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import { createHtmlPlugin } from 'vite-plugin-html';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  return {
    plugins: [
      react({
        babel: {
          plugins: [
            isProduction && ['transform-remove-console', { exclude: ['error', 'warn'] }],
          ].filter(Boolean),
        },
      }),

      // PWA configuration for production
      isProduction &&
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'robots.txt', 'vite.svg'],
          manifest: {
            name: env.VITE_APP_NAME || 'Career Connect Lesotho',
            short_name: 'Career Connect',
            description: 'Bridging youth, education, and employment opportunities in Lesotho',
            theme_color: '#0d6efd',
            background_color: '#ffffff',
            display: 'standalone',
            icons: [
              {
                src: '/logo192.png',
                sizes: '192x192',
                type: 'image/png',
              },
              {
                src: '/logo512.png',
                sizes: '512x512',
                type: 'image/png',
              },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                  },
                },
              },
              {
                urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'firebase-storage-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                  },
                },
              },
            ],
          },
        }),

      // Gzip compression
      viteCompression({
        algorithm: 'gzip',
        threshold: 10240, // 10kb
      }),

      // Brotli compression
      viteCompression({
        algorithm: 'brotliCompress',
        threshold: 10240,
      }),

      // HTML plugin for environment variables
      createHtmlPlugin({
        minify: isProduction,
        inject: {
          data: {
            title: env.VITE_APP_NAME,
            description: 'Bridging youth, education, and employment opportunities in Lesotho',
          },
        },
      }),
    ],

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
