import { defineStore } from 'pinia';

export type MessageSender = 'user' | 'app' | 'system';

export interface App {
  token: string | null;
}

export const useAppStore = defineStore('app', {
  state: (): App => ({
    token: null,
  }),

  getters: {},

  actions: {},

  // 添加持久化配置
  persist: {
    key: 'app', // 本地存储的 key
    pick: ['token'], // 只存储 token 字段
    storage: localStorage, // 存储位置：localStorage / sessionStorage
    omit: ['userInfo'], // 不存储 userInfo 字段
  },
});
