import { createApp } from 'vue';
import { setupStore } from '@/store';
import router from '@/router';
import './style.css';
import App from './App.vue';

async function bootstrap() {
  const app = createApp(App);
  app.use(router);
  // app.use(i18n);
  setupStore(app);

  // https://github.com/tusen-ai/naive-ui/blob/main/demo/pages/docs/style-conflict/zhCN/index.md
  const meta = document.createElement('meta');
  meta.name = 'naive-ui-style';
  document.head.appendChild(meta);

  app.mount('#app');
}

bootstrap();
