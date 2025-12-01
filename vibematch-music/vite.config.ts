// vite.config.ts をこの内容に書き換え
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // defineブロックは削除しました
});
