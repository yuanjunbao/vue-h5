<script setup lang="ts">
import { onMounted, ref } from 'vue'

// 获取全局window对象
const globalWindow = window as any

// 获取URL参数
const getQueryParams = () => {
  const urlParams = new URLSearchParams(globalWindow.location.search)
  return {
    timestamp: urlParams.get('timestamp'),
    // 其他参数
  }
}

// 发送消息给小程序
const sendMessageToUniapp = (data: any) => {
  if (typeof globalWindow.webUni !== 'undefined') {
    globalWindow.webUni.postMessage({ data })
    console.log('发送消息给小程序:', data)
  } else {
    console.error('uni.webview.js未加载')
  }
}

// 从小程序接收消息
const handleUniMessage = (e: any) => {
  console.log('收到小程序消息:', e)
  // 处理消息
}

// 显示的消息
const message = ref('')
// URL参数
const params = ref({})

onMounted(() => {
  // 初始化时获取参数
  params.value = getQueryParams()
  console.log('页面参数:', params.value)

  // 监听小程序消息
  globalWindow.addEventListener('message', handleUniMessage)
})</script>

<template>
  <div class="container">
    <h1>bq-vue-h5</h1>
    
    <div class="params-section">
      <h2>URL参数</h2>
      <pre>{{ JSON.stringify(params, null, 2) }}</pre>
    </div>
    
    <div class="message-section">
      <h2>消息通信</h2>
      <input 
        v-model="message" 
        placeholder="输入要发送的消息"
        class="message-input"
      />
      <button 
        @click="sendMessageToUniapp({ message: message, time: new Date().toISOString() })"
        class="send-btn"
      >
        发送消息给小程序
      </button>
    </div>
    
    <div class="env-section">
      <h2>环境检测</h2>
      <button 
        @click="() => {
          if (typeof globalWindow.webUni !== 'undefined') {
            globalWindow.webUni.getEnv((res: any) => {
              globalWindow.alert(JSON.stringify(res, null, 2))
            })
          }
        }"
        class="env-btn"
      >
        检测当前环境
      </button>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
  text-align: center;
}

h2 {
  color: #555;
  margin-top: 30px;
}

.params-section pre {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
}

.message-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.send-btn, .env-btn {
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.send-btn:hover, .env-btn:hover {
  background-color: #45a049;
}
</style>
