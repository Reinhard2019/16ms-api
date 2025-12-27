import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from '@solidjs/start/config';
import UnoCSS from 'unocss/vite';

// 获取 __dirname 的 ESM 写法
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  ssr: false,
  middleware: './src/middleware.ts',
  vite: {
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
      },
    },
    plugins: [UnoCSS()],
  },
});
