<script setup lang="ts">
import { onMounted, ref } from "vue";

// 获取全局window对象
const globalWindow = window as any;
const uni = globalWindow.uni;
// 获取URL参数
const getQueryParams = () => {
  const urlParams = new URLSearchParams(globalWindow.location.search);
  const params: Record<string, string> = {};

  // 解析所有URL参数
  for (const [key, value] of urlParams.entries()) {
    params[key] = value;
  }

  return params;
};

// 发送消息给小程序
const sendMessageToUniapp = (data: any) => {
  // alert("发送消息给小程序:" + JSON.stringify(Object.keys(globalWindow.uni)));
  if (typeof globalWindow.uni !== "undefined" && uni.postMessage) {
    alert("使用新版全局变量发送消息给小程序:" + JSON.stringify(data));
    uni.postMessage({ data });
    console.log("发送消息给小程序:", data);
  } else if (typeof globalWindow.webUni !== "undefined") {
    globalWindow.webUni.postMessage({ data });
    console.log("使用旧版全局变量发送消息给小程序:", data);
  } else {
    uni.webView.postMessage({ data });
    console.error("uni.webview.js未加载或未初始化完成");
  }
};

// 从小程序接收消息
const handleUniMessage = (e: any) => {
  console.log("收到小程序消息:", e);
  // 处理消息
};

// 显示的消息
const message = ref("");
// URL参数
const params = ref({});

onMounted(() => {
  // 初始化时获取参数
  params.value = getQueryParams();
  console.log("页面参数:", params.value);

  // 监听小程序消息
  document.addEventListener("message", handleUniMessage);
  document.addEventListener("UniAppJSBridgeReady", function () {
    uni.postMessage({
      data: {
        action: "message",
      },
    });
  });
});

const getEnv = () => {
  // 待触发 `UniAppJSBridgeReady` 事件后，即可调用 uni 的 API。
  uni.getEnv(function (res: any) {
    console.log("当前环境：" + JSON.stringify(res));
  });
  uni.webView.getEnv(function (res: any) {
    console.log("当前环境：" + JSON.stringify(res));
    alert("当前环境：----" + JSON.stringify(res));
  });
};
</script>

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
        @click="
          sendMessageToUniapp({
            message: message,
            time: new Date().toISOString(),
          })
        "
        class="send-btn"
      >
        发送消息给小程序
      </button>
    </div>

    <div class="env-section">
      <h2>环境检测</h2>
      <button @click="getEnv" class="env-btn">检测当前环境</button>
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

.send-btn,
.env-btn {
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.send-btn:hover,
.env-btn:hover {
  background-color: #45a049;
}
</style>
