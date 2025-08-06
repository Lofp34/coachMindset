import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      plugins: [
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['echo.png', 'manifest.json'],
          manifest: {
            name: 'Echo - Sparring Partner IA',
            short_name: 'Echo',
            description: 'Votre sparring-partner IA pour professionnels de la vente. Entraînement, coaching et débriefing avec transcription vocale avancée.',
            theme_color: '#2563eb',
            background_color: '#111827',
            display: 'standalone',
            orientation: 'portrait-primary',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: '/echo.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable any'
              },
              {
                src: '/echo.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'gemini-api-cache',
                  networkTimeoutSeconds: 10,
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              }
            ],
            skipWaiting: true,
            clientsClaim: true
          },
          devOptions: {
            enabled: true
          }
        })
      ]
    };
});
