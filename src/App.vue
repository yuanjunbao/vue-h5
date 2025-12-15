<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  uniAppCommunicator,
  isInApp,
  environment,
} from "./utils/uniAppCommunicator";

// 状态管理
const isInUniApp = ref(false);
const urlParams = ref(environment.getUrlParams());
const message = ref("");
const eventName = ref("customEvent");
const customData = ref('{"test":"data"}');
const receivedMessages = ref<any[]>([]);
const appData = ref<any>(null);
const loading = ref(false);
const userInfo = ref<any>(null);
const responseData = ref<any>(null);
const responseReceived = ref(false);
const requestTimeout = ref(3000);
const communicationStatus = ref({
  initialized: false,
  lastMessageTime: null as Date | null,
  messageCount: 0,
});

// 发送文本消息
const sendTextMessage = () => {
  if (!message.value.trim()) {
    alert("请输入消息内容");
    return;
  }

  // 构建完整的消息对象
  const messageObj = {
    type: "message",
    action: "text",
    data: {
      content: message.value.trim(),
      timestamp: new Date().toISOString(),
      requestId: "req_" + Date.now(),
    },
  };

  try {
    const success = uniAppCommunicator.postMessage(messageObj);

    if (success) {
      addMessageToHistory("我", message.value.trim());
      updateCommunicationStatus();
      message.value = "";
      showNotification("消息发送成功", "success");
    } else {
      showNotification("消息发送失败，请检查环境", "error");
    }
  } catch (error) {
    console.error("发送消息异常:", error);
    showNotification("发送消息时发生错误", "error");
  }
};

// 发送带自定义数据的消息
const sendCustomMessage = () => {
  if (!customData.value.trim()) {
    alert("请输入自定义数据");
    return;
  }

  try {
    const parsedData = JSON.parse(customData.value.trim());

    const messageObj = {
      type: "message",
      action: "custom",
      data: parsedData,
      timestamp: new Date().toISOString(),
    };

    const success = uniAppCommunicator.postMessage(messageObj);

    if (success) {
      addMessageToHistory("我", `自定义数据: ${customData.value.trim()}`);
      updateCommunicationStatus();
      showNotification("自定义消息发送成功", "success");
    } else {
      showNotification("消息发送失败", "error");
    }
  } catch (error) {
    console.error("解析JSON数据错误:", error);
    alert("自定义数据格式错误，请输入有效的JSON");
  }
};

// 发送事件
const sendEvent = (name?: string) => {
  const event = name || eventName.value.trim();

  if (!event) {
    alert("请输入事件名称");
    return;
  }

  try {
    // 构建标准事件对象
    const eventData = {
      type: "event",
      action: event,
      timestamp: new Date().toISOString(),
      source: "h5",
    };

    const success = uniAppCommunicator.postMessage(eventData);

    if (success) {
      console.log(`事件 ${event} 已发送`);
      addMessageToHistory("系统", `发送事件: ${event}`);
      updateCommunicationStatus();
      showNotification(`事件 ${event} 发送成功`, "info");
    } else {
      showNotification("事件发送失败", "error");
    }
  } catch (error) {
    console.error("发送事件异常:", error);
    showNotification("发送事件时发生错误", "error");
  }
};

// 发送带参数的事件
const sendEventWithParams = () => {
  const event = eventName.value.trim();
  if (!event) {
    alert("请输入事件名称");
    return;
  }

  try {
    let params = {};
    if (customData.value.trim()) {
      params = JSON.parse(customData.value.trim());
    }

    const eventData = {
      type: "event",
      action: event,
      data: params,
      timestamp: new Date().toISOString(),
    };

    const success = uniAppCommunicator.postMessage(eventData);

    if (success) {
      addMessageToHistory("系统", `发送事件: ${event} (带参数)`);
      updateCommunicationStatus();
      showNotification(`带参数的事件 ${event} 发送成功`, "info");
    } else {
      showNotification("事件发送失败", "error");
    }
  } catch (error) {
    console.error("发送带参事件异常:", error);
    if (error instanceof SyntaxError) {
      alert("自定义数据格式错误，请输入有效的JSON");
    } else {
      showNotification("发送事件时发生错误", "error");
    }
  }
};

// 请求用户信息 (增强版)
const requestUserInfo = async () => {
  loading.value = true;
  responseReceived.value = false;
  responseData.value = null;

  try {
    // 生成唯一请求ID
    const requestId = "req_userinfo_" + Date.now();

    // 设置超时处理
    const timeout = setTimeout(() => {
      if (!responseReceived.value) {
        loading.value = false;
        addMessageToHistory("系统", "获取用户信息请求超时");
        showNotification("请求超时，请稍后重试", "error");
      }
    }, requestTimeout.value);

    // 注册响应处理器
    const handleResponse = (data: any) => {
      clearTimeout(timeout);
      loading.value = false;
      responseReceived.value = true;
      responseData.value = data;
      userInfo.value = data;

      addMessageToHistory(
        "App",
        `返回用户信息: ${data.userName || "用户信息"}`
      );
      showNotification("用户信息获取成功", "success");
    };

    // 发送请求
    const requestData = {
      type: "request",
      action: "getUserInfo",
      requestId,
      timestamp: new Date().toISOString(),
    };

    const success = uniAppCommunicator.postMessage(requestData);

    if (success) {
      addMessageToHistory("我", "请求用户信息");
      updateCommunicationStatus();

      // 注册临时响应监听器
      uniAppCommunicator.addHandler("user_info", handleResponse);

      // 30秒后自动清理监听器
      setTimeout(() => {
        uniAppCommunicator.removeHandler("user_info", handleResponse);
      }, 30000);
    } else {
      clearTimeout(timeout);
      loading.value = false;
      showNotification("请求发送失败", "error");
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
    loading.value = false;
    showNotification("获取用户信息失败", "error");
  }
};

// 发送通用请求
const sendRequest = (action: string, data?: any) => {
  loading.value = true;
  responseReceived.value = false;
  responseData.value = null;

  try {
    const requestId = `req_${action}_${Date.now()}`;

    const timeout = setTimeout(() => {
      if (!responseReceived.value) {
        loading.value = false;
        addMessageToHistory("系统", `${action} 请求超时`);
        showNotification("请求超时", "error");
      }
    }, requestTimeout.value);

    const handleResponse = (data: any) => {
      clearTimeout(timeout);
      loading.value = false;
      responseReceived.value = true;
      responseData.value = data;

      addMessageToHistory("App", `返回${action}响应: ${JSON.stringify(data)}`);
      showNotification(`${action} 请求成功`, "success");
    };

    const requestData = {
      type: "request",
      action,
      data: data || {},
      requestId,
      timestamp: new Date().toISOString(),
    };

    const success = uniAppCommunicator.postMessage(requestData);

    if (success) {
      addMessageToHistory("我", `请求: ${action}`);
      updateCommunicationStatus();

      // 注册响应处理器
      uniAppCommunicator.addHandler(`${action}_response`, handleResponse);

      setTimeout(() => {
        uniAppCommunicator.removeHandler(`${action}_response`, handleResponse);
      }, 30000);
    } else {
      clearTimeout(timeout);
      loading.value = false;
      showNotification("请求发送失败", "error");
    }
  } catch (error) {
    console.error(`${action} 请求失败:`, error);
    loading.value = false;
    showNotification(`${action} 请求失败`, "error");
  }
};

// 测试文件下载 (增强版)
const testDownloadFile = () => {
  const fileInfo = {
    url: "https://example.com/sample.pdf",
    filename: "sample.pdf",
    type: "pdf",
    size: "未知",
  };

  loading.value = true;
  responseReceived.value = false;
  responseData.value = null;

  try {
    const requestId = "req_download_" + Date.now();

    const timeout = setTimeout(() => {
      if (!responseReceived.value) {
        loading.value = false;
        addMessageToHistory("系统", "文件下载请求超时");
        showNotification("下载请求超时", "error");
      }
    }, 15000); // 下载请求给更长的超时时间

    const handleResponse = (data: any) => {
      clearTimeout(timeout);
      loading.value = false;
      responseReceived.value = true;
      responseData.value = data;

      addMessageToHistory(
        "App",
        `下载响应: ${data.status === "success" ? "成功" : "失败"}`
      );
      showNotification(
        `文件下载${data.status === "success" ? "任务已创建" : "失败"}`,
        data.status === "success" ? "success" : "error"
      );
    };

    const requestData = {
      type: "request",
      action: "downloadFile",
      data: fileInfo,
      requestId,
      timestamp: new Date().toISOString(),
    };

    const success = uniAppCommunicator.postMessage(requestData);

    if (success) {
      addMessageToHistory("我", `请求下载文件: ${fileInfo.filename}`);
      updateCommunicationStatus();

      // 注册下载响应处理器
      uniAppCommunicator.addHandler("download_response", handleResponse);

      setTimeout(() => {
        uniAppCommunicator.removeHandler("download_response", handleResponse);
      }, 60000); // 下载响应监听器保留更长时间
    } else {
      clearTimeout(timeout);
      loading.value = false;
      showNotification("下载请求发送失败", "error");
    }
  } catch (error) {
    console.error("文件下载请求失败:", error);
    loading.value = false;
    showNotification("文件下载请求失败", "error");
  }
};

// 测试权限请求
const testPermissionRequest = () => {
  sendRequest("requestPermission", {
    permissions: ["camera", "microphone"],
  });
};

// 测试设备信息获取
const testGetDeviceInfo = () => {
  sendRequest("getDeviceInfo");
};

// 添加消息到历史记录
const addMessageToHistory = (sender: string, content: string) => {
  receivedMessages.value.unshift({
    sender,
    content,
    timestamp: new Date().toLocaleTimeString(),
  });

  // 限制历史记录数量
  if (receivedMessages.value.length > 30) {
    receivedMessages.value.pop();
  }

  // 滚动到底部
  setTimeout(() => {
    const container = document.querySelector(".messages");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, 0);
};

// 检查字符串是否为JSON格式
const isJson = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

// 格式化JSON字符串
const formatJson = (str: string): string => {
  try {
    const obj = JSON.parse(str);
    return JSON.stringify(obj, null, 2);
  } catch {
    return str;
  }
};

// 更新通信状态
const updateCommunicationStatus = () => {
  communicationStatus.value.lastMessageTime = new Date();
  communicationStatus.value.messageCount++;
};

// 显示通知
const showNotification = (
  message: string,
  type: "success" | "error" | "info" | "warning" = "info"
) => {
  // 创建通知元素
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // 设置样式
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 20px",
    borderRadius: "8px",
    color: "white",
    zIndex: "10000",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    backgroundColor:
      type === "success"
        ? "#4CAF50"
        : type === "error"
        ? "#f44336"
        : type === "warning"
        ? "#ff9800"
        : "#2196F3",
  });

  document.body.appendChild(notification);

  // 3秒后自动移除
  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
};

// 暴露给UniApp直接调用的方法
window.testUniAppCall = function (message: string) {
  console.log("UniApp直接调用了H5方法:", message);
  addMessageToHistory("App", `直接调用: ${message}`);
  showNotification(`收到UniApp直接调用: ${message}`, "info");

  // 返回响应数据
  return {
    success: true,
    message: `H5已处理: ${message}`,
    timestamp: new Date().toISOString(),
  };
};

// 直接接收App数据的方法
window.receiveAppData = function (data: any) {
  console.log("直接收到App数据:", data);

  // 根据数据类型分发到不同的处理器
  if (data.type) {
    switch (data.type) {
      case "user_info":
        userInfo.value = data.data || data;
        break;
      case "app_data":
        appData.value = data.data || data;
        break;
      case "error_response":
        showNotification(`错误: ${data.errorMsg || "未知错误"}`, "error");
        break;
    }
  }

  addMessageToHistory("App", `直接数据: ${JSON.stringify(data)}`);
  updateCommunicationStatus();
};

// 检测环境
const checkEnvironment = () => {
  isInUniApp.value = isInApp();
  const envInfo = {
    isInUniApp: isInUniApp.value,
    urlParams: urlParams.value,
    hasUniBridge: environment.hasFeature("uniBridge"),
    hasCamera: environment.hasFeature("camera"),
    userAgent: navigator.userAgent,
  };

  console.log("环境信息:", envInfo);
  return envInfo;
};

// 生命周期
onMounted(() => {
  // 注册全局接收器
  uniAppCommunicator.registerGlobalReceiver();

  // 检测环境
  checkEnvironment();
  addMessageToHistory(
    "系统",
    `环境检测完成: ${isInUniApp.value ? "UniApp环境" : "浏览器环境"}`
  );

  // 监听App数据消息
  uniAppCommunicator.addHandler("app_data", (data) => {
    appData.value = data;
    addMessageToHistory("App", `收到应用数据: ${JSON.stringify(data)}`);
  });

  // 监听特定响应
  uniAppCommunicator.addHandler("custom_event", (data) => {
    addMessageToHistory("App", `收到自定义事件: ${JSON.stringify(data)}`);
  });

  // 如果是在App环境中，发送页面加载完成事件
  if (isInUniApp.value) {
    setTimeout(() => {
      sendEvent("pageLoaded");
    }, 100);
  }
});

// 导出给调试使用
(window as any).uniAppCommunicator = uniAppCommunicator;
(window as any).checkEnvironment = checkEnvironment;
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>H5与UniApp通信测试</h1>
      <div class="env-info">
        环境状态:
        <span :class="['status', isInUniApp ? 'in-app' : 'browser']">
          {{ isInUniApp ? "UniApp环境" : "浏览器环境" }}
        </span>
      </div>

      <!-- 通信状态显示 -->
      <div v-if="isInUniApp" class="comm-status">
        <div class="status-item">
          <span class="label">消息数:</span>
          <span class="value">{{ communicationStatus.messageCount }}</span>
        </div>
        <div class="status-item" v-if="communicationStatus.lastMessageTime">
          <span class="label">最后通信:</span>
          <span class="value">{{
            communicationStatus.lastMessageTime.toLocaleTimeString()
          }}</span>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="left-panel">
        <!-- 基本消息发送 -->
        <div class="message-section">
          <h3>消息发送</h3>
          <div class="input-group">
            <input
              type="text"
              v-model="message"
              placeholder="请输入消息内容"
              @keyup.enter="sendTextMessage"
              :disabled="loading"
            />
            <button @click="sendTextMessage" :disabled="loading">
              发送消息
            </button>
          </div>
        </div>

        <!-- 自定义数据输入 -->
        <div class="custom-data-section">
          <h3>自定义数据 (JSON格式)</h3>
          <div class="textarea-group">
            <textarea
              v-model="customData"
              placeholder="输入JSON格式数据，如: {'key':'value'}"
              rows="4"
              :disabled="loading"
            ></textarea>
            <button @click="sendCustomMessage" :disabled="loading">
              发送自定义数据
            </button>
          </div>
        </div>

        <!-- 事件发送 -->
        <div class="event-section">
          <h3>事件发送</h3>
          <div class="input-group">
            <input
              type="text"
              v-model="eventName"
              placeholder="请输入事件名称"
              :disabled="loading"
            />
            <button
              @click="sendEvent()"
              :disabled="loading || !eventName.trim()"
            >
              发送事件
            </button>
            <button
              @click="sendEventWithParams()"
              :disabled="loading || !eventName.trim()"
            >
              带参数发送
            </button>
          </div>
        </div>

        <!-- 预设事件按钮 -->
        <div class="preset-events">
          <h4>预设事件</h4>
          <div class="button-group">
            <button @click="sendEvent('pageLoaded')" :disabled="loading">
              发送pageLoaded事件
            </button>
            <button @click="sendEvent('dataUpdate')" :disabled="loading">
              发送dataUpdate事件
            </button>
            <button @click="sendEvent('refreshData')" :disabled="loading">
              发送refreshData事件
            </button>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <!-- 功能请求区域 -->
        <div class="requests-section">
          <h3>功能请求</h3>
          <div class="request-buttons">
            <button @click="requestUserInfo" :disabled="loading">
              {{ loading ? "请求中..." : "请求用户信息" }}
            </button>
            <button @click="testDownloadFile" :disabled="loading">
              {{ loading ? "请求中..." : "测试文件下载" }}
            </button>
            <button @click="testPermissionRequest" :disabled="loading">
              {{ loading ? "请求中..." : "请求权限" }}
            </button>
            <button @click="testGetDeviceInfo" :disabled="loading">
              {{ loading ? "请求中..." : "获取设备信息" }}
            </button>
          </div>
        </div>

        <!-- 响应数据显示 -->
        <div v-if="responseReceived" class="response-section">
          <h3>响应数据</h3>
          <div class="response-data">
            <pre>{{ JSON.stringify(responseData, null, 2) }}</pre>
          </div>
        </div>

        <!-- 用户信息显示 -->
        <div class="user-info-section">
          <h3>用户信息</h3>
          <div v-if="userInfo" class="user-info">
            <p>用户名: {{ userInfo.userName || "未知" }}</p>
            <p>用户ID: {{ userInfo.userId || "未知" }}</p>
            <p>角色: {{ userInfo.role || "未知" }}</p>
            <pre v-if="typeof userInfo === 'object' && userInfo !== null">
              {{ JSON.stringify(userInfo, null, 2) }}
            </pre>
          </div>
          <div v-else class="empty-info">未获取用户信息</div>
        </div>

        <!-- URL参数显示 -->
        <div class="url-params">
          <h3>URL参数</h3>
          <pre>{{ JSON.stringify(urlParams, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- 消息历史记录 -->
    <div class="message-history">
      <h3>
        消息历史 <span class="count">({{ receivedMessages.length }})</span>
      </h3>
      <div class="messages" ref="messagesContainer">
        <div
          v-for="(msg, index) in receivedMessages"
          :key="index"
          :class="['message-item', msg.sender === '我' ? 'sent' : 'received']"
        >
          <div class="sender">{{ msg.sender }}</div>
          <div class="content">
            <template v-if="isJson(msg.content)">
              <pre class="json-content">{{ formatJson(msg.content) }}</pre>
            </template>
            <template v-else>
              {{ msg.content }}
            </template>
          </div>
          <div class="timestamp">{{ msg.timestamp }}</div>
        </div>
        <div v-if="receivedMessages.length === 0" class="empty-history">
          暂无消息历史
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #4caf50;
  --secondary-color: #2196f3;
  --danger-color: #f44336;
  --warning-color: #ff9800;
  --text-color: #333;
  --border-color: #ddd;
  --bg-color: #f5f5f5;
  --card-bg: #fff;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 适配安全区域 */
.container {
  /* 使用env()函数适配刘海屏 */
  padding-top: calc(20px + env(safe-area-inset-top, 0px));
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
}

h1 {
  color: var(--text-color);
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
}

.app-status {
  text-align: center;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
}

.app-status.in-app {
  background-color: #e8f5e9;
  color: var(--primary-color);
}

.app-status.browser {
  background-color: #e3f2fd;
  color: var(--secondary-color);
}

.section {
  background-color: var(--card-bg);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  color: var(--text-color);
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 20px;
  border-bottom: 2px solid var(--bg-color);
  padding-bottom: 8px;
}

/* 参数显示区域 */
.params-section pre {
  background-color: var(--bg-color);
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 14px;
  margin: 0;
}

/* 消息输入区域 */
.message-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-input {
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.message-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* 按钮样式 */
.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-primary {
  background-color: #45a049;
  color: white;
}

.btn-secondary {
  background-color: #1976d2;
  color: white;
}

.btn-secondary:hover {
  transform: translateY(-1px);
}

.btn-warning {
  background-color: #f57c00;
  color: white;
}

.btn-warning:hover {
  transform: translateY(-1px);
}

.btn-danger {
  background-color: #d32f2f;
  color: white;
}

.btn-danger:hover {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 按钮组 */
.btn-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

/* 消息历史记录 */
.message-history {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background-color: var(--bg-color);
  border-radius: 8px;
  margin-top: 16px;
}

.message-item {
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  font-size: 14px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.me {
  background-color: #e3f2fd;
  text-align: right;
  margin-left: 50px;
}

.message-item.app {
  background-color: #e8f5e9;
  margin-right: 50px;
}

.message-item.system {
  background-color: #fff3e0;
  text-align: center;
  margin-left: 20px;
  margin-right: 20px;
  font-style: italic;
}

.message-item .sender {
  font-weight: bold;
  margin-right: 8px;
}

.message-item .timestamp {
  font-size: 12px;
  color: #888;
  margin-left: 8px;
}

/* 用户信息显示 */
.user-info {
  background-color: var(--bg-color);
  padding: 15px;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 14px;
}

.user-info p {
  margin: 5px 0;
}

/* 加载状态 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading::after {
  content: "";
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .container {
    padding: 15px;
  }

  h1 {
    font-size: 24px;
  }

  .btn-group {
    grid-template-columns: 1fr;
  }

  .message-item.me,
  .message-item.app {
    margin-left: 20px;
    margin-right: 20px;
  }
}
</style>
