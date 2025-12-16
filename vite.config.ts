import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import AutoImport from 'unplugin-auto-import/vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      dts: 'src/types/components.d.ts',
      dirs: ['src/components'],
      resolvers: [VantResolver()],
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        {
          pinia: ['defineStore', 'storeToRefs'],
        },
      ],
      dirs: ['src/hooks/**', 'src/store/modules/**'],
      dts: 'src/types/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
    }),
  ],
  server: {
    port: 5174,
    host: true, // 允许外部访问
  },
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      '@': resolve(__dirname, 'src'),
    },
  },
});
