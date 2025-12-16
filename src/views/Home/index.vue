<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">首页</h1>
      <div class="space-y-4">
        <p class="text-gray-600 text-center">欢迎访问我们的H5应用</p>
        <div class="mt-4">
          <van-button
            type="warning"
            block
            @click="$router.push('/uniapp-communicator')"
          >
            UniApp调用能力
          </van-button>
        </div>
        <div class="mt-4">
          <van-button type="warning" block @click="onBackToUniApp">
            返回UniApp
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { navigateBack } = useUniApp();
// 首页组件逻辑
const onBackToUniApp = () => {
  navigateBack();
};
</script>

<style scoped>
/* 首页样式 */
</style>
