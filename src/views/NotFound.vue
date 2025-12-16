<template>
  <div
    class="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-8 px-4"
  >
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
      <van-icon name="warning-o" size="64" color="#ff6b6b" class="mb-4" />
      <h1 class="text-3xl font-bold text-gray-800 mb-4">404</h1>
      <p class="text-gray-600 mb-8">抱歉，您访问的页面不存在</p>
      <van-button type="primary" block @click="$router.push('/')">
        返回首页
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404页面组件逻辑
</script>

<style scoped>
/* 404页面样式 */
</style>
