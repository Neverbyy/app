import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['electron'],
      output: {
        format: 'cjs',
        entryFileNames: (chunkInfo) => {
          // Сохраняем структуру папок для preload скриптов
          const entryPath = chunkInfo.facadeModuleId || '';
          const relativePath = path.relative(path.join(process.cwd(), 'src'), entryPath);
          return path.dirname(relativePath) + '/' + path.basename(relativePath, '.ts') + '.js';
        },
      },
    },
  },
});
