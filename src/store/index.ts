import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import type { App } from 'vue';

export * from './modules/app';
export * from './modules/message';

export const store = createPinia();

// 使用持久化插件
store.use(piniaPluginPersistedstate);

export async function setupStore(app: App<Element>) {
  app.use(store);
}
