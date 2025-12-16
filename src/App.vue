<script setup lang="ts">
import type { ConfigProviderTheme } from 'vant';
import { ref } from 'vue';

const theme = ref<ConfigProviderTheme>('dark');
</script>

<template>
  <VanConfigProvider :theme="theme">
    <router-view />
  </VanConfigProvider>
</template>

<style scoped>
/* 可以在这里添加全局样式 */
</style>
