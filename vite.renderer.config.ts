import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { DEFAULT_API_URL, getApiDomain } from './config.shared';

// https://vitejs.dev/config
export default defineConfig(({ mode }) => {
  // Загружаем переменные окружения из .env файла (если есть)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      {
        name: 'inject-csp',
        transformIndexHtml(html) {
          // Читаем URL API: из .env или из config.shared.ts
          const apiBaseUrl = env.VITE_API_BASE_URL || DEFAULT_API_URL;
          // Извлекаем базовый домен (без /api)
          const apiDomain = getApiDomain(apiBaseUrl);
          // Заменяем плейсхолдер на реальный URL
          return html.replace('__API_DOMAIN__', apiDomain);
        },
      },
    ],
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
    },
  };
});
