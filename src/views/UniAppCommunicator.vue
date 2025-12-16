<template>
  <div class="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
    <div class="text-white p-4">
      <h1 class="text-2xl font-bold text-center mb-2">H5与UniApp通信测试</h1>
      <div class="flex justify-center items-center mb-2">
        <span class="mr-2">环境状态:</span>
        <Badge
          :type="isInUniApp ? 'success' : 'info'"
          class="text-sm px-3 py-1 rounded-full"
        >
          {{ isInUniApp ? 'UniApp环境' : '浏览器环境' }}
        </Badge>
      </div>

      <!-- 通信状态显示 -->
      <div v-if="isInUniApp" class="flex justify-center gap-4 text-sm">
        <div class="flex items-center">
          <span class="mr-1">消息数:</span>
          <span class="font-bold">{{ communicationStatus.messageCount }}</span>
        </div>
        <div
          v-if="communicationStatus.lastMessageTime"
          class="flex items-center"
        >
          <span class="mr-1">最后通信:</span>
          <span class="font-bold">{{
            communicationStatus.lastMessageTime.toLocaleTimeString()
          }}</span>
        </div>
      </div>
    </div>

    <div class="p-4 space-y-6">
      <!-- 基本消息发送 -->
      <Card title="消息发送" class="shadow-sm">
        <div class="flex gap-2">
          <VanField
            v-model="message"
            placeholder="请输入消息内容"
            :disabled="loading"
            class="flex-1"
            @keyup.enter="sendTextMessage"
          />
          <VanButton
            type="primary"
            :disabled="loading"
            :loading="loading"
            @click="sendTextMessage"
          >
            发送消息
          </VanButton>
        </div>
      </Card>

      <!-- 自定义数据输入 -->
      <Card title="自定义数据 (JSON格式)" class="shadow-sm">
        <div class="space-y-2">
          <Textarea
            v-model="customData"
            placeholder="输入JSON格式数据，如: {'key':'value'}"
            rows="4"
            :disabled="loading"
          />
          <div class="flex justify-end">
            <Button
              type="primary"
              :disabled="loading"
              :loading="loading"
              @click="sendCustomMessage"
            >
              发送自定义数据
            </Button>
          </div>
        </div>
      </Card>

      <!-- 事件发送 -->
      <Card title="事件发送" class="shadow-sm">
        <div class="space-y-3">
          <Input
            v-model="eventName"
            placeholder="请输入事件名称"
            :disabled="loading"
          />
          <div class="flex gap-2">
            <Button
              type="primary"
              :disabled="loading || !eventName.trim()"
              :loading="loading"
              class="flex-1"
              @click="sendEvent(eventName)"
            >
              发送事件
            </Button>
            <Button
              type="success"
              :disabled="loading || !eventName.trim()"
              :loading="loading"
              class="flex-1"
              @click="sendEventWithParams()"
            >
              带参数发送
            </Button>
          </div>
        </div>
      </Card>

      <!-- 预设事件按钮 -->
      <Card title="预设事件" class="shadow-sm">
        <div class="grid grid-cols-2 gap-2">
          <Button
            type="default"
            :disabled="loading"
            :loading="loading"
            @click="sendEvent('pageLoaded')"
          >
            pageLoaded
          </Button>
          <Button
            type="default"
            :disabled="loading"
            :loading="loading"
            @click="sendEvent('dataUpdate')"
          >
            dataUpdate
          </Button>
          <Button
            type="default"
            :disabled="loading"
            :loading="loading"
            @click="sendEvent('refreshData')"
          >
            refreshData
          </Button>
        </div>
      </Card>

      <!-- 功能请求区域 -->
      <Card title="功能请求" class="shadow-sm">
        <div class="grid grid-cols-2 gap-2">
          <Button
            type="primary"
            :disabled="loading"
            :loading="loading"
            @click="requestUserInfo"
          >
            {{ loading ? '请求中...' : '请求用户信息' }}
          </Button>
          <Button
            type="success"
            :disabled="loading"
            :loading="loading"
            @click="testDownloadFile"
          >
            {{ loading ? '请求中...' : '测试文件下载' }}
          </Button>
          <Button
            type="warning"
            :disabled="loading"
            :loading="loading"
            @click="testPermissionRequest"
          >
            {{ loading ? '请求中...' : '请求权限' }}
          </Button>
          <Button
            :disabled="loading"
            :loading="loading"
            @click="testGetDeviceInfo"
          >
            {{ loading ? '请求中...' : '获取设备信息' }}
          </Button>
        </div>
      </Card>

      <!-- 响应数据显示 -->
      <Card title="响应数据" class="shadow-sm">
        <div v-if="responseReceived" class="space-y-2">
          <div class="bg-gray-50 p-3 rounded-md overflow-x-auto">
            <pre class="text-sm">{{
              JSON.stringify(responseData, null, 2)
            }}</pre>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-2">暂无响应数据</div>
      </Card>

      <!-- 用户信息显示 -->
      <Card title="用户信息" class="shadow-sm">
        <CellGroup>
          <Cell
            v-if="userInfo"
            title="用户名"
            :value="userInfo.userName || '未知'"
          />
          <Cell
            v-if="userInfo"
            title="用户ID"
            :value="userInfo.userId || '未知'"
          />
          <Cell v-if="userInfo" title="角色" :value="userInfo.role || '未知'" />
        </CellGroup>
        <div
          v-if="userInfo && typeof userInfo === 'object' && userInfo !== null"
          class="mt-3 bg-gray-50 p-3 rounded-md overflow-x-auto"
        >
          <pre class="text-sm">{{ JSON.stringify(userInfo, null, 2) }}</pre>
        </div>
        <div v-else class="text-center text-gray-500 py-2">未获取用户信息</div>
      </Card>

      <!-- URL参数显示 -->
      <Card title="URL参数" class="shadow-sm">
        <div class="bg-gray-50 p-3 rounded-md overflow-x-auto">
          <pre class="text-sm">{{ JSON.stringify(urlParams, null, 2) }}</pre>
        </div>
      </Card>

      <!-- 消息历史记录 -->
      <Card title="消息历史" class="shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span></span>
          <Badge :value="messages.length" type="primary" />
        </div>
        <div
          ref="messagesContainer"
          class="max-h-80 overflow-y-auto space-y-2 p-2 bg-gray-50 rounded-md"
        >
          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="[
              'p-3 rounded-lg',
              msg.sender === 'user'
                ? 'bg-blue-50 text-right ml-8'
                : msg.sender === 'app'
                  ? 'bg-green-50 text-left mr-8'
                  : 'bg-yellow-50 mx-auto max-w-[80%] text-center',
            ]"
          >
            <div class="font-bold mb-1">
              {{
                msg.sender === 'user'
                  ? '我'
                  : msg.sender === 'app'
                    ? 'App'
                    : '系统'
              }}
            </div>
            <div class="mb-1">
              <template v-if="isJson(msg.content)">
                <pre
                  class="text-sm bg-white p-2 rounded text-left inline-block"
                  >{{ formatJson(msg.content) }}</pre
                >
              </template>
              <template v-else>
                {{ msg.content }}
              </template>
            </div>
            <div class="text-xs text-gray-500">
              {{ msg.timestamp.toLocaleTimeString() }}
            </div>
          </div>
          <div
            v-if="messages.length === 0"
            class="text-center text-gray-500 py-4"
          >
            暂无消息历史
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMessageStore } from '../store/modules/message';

// 使用useUniApp Hook
const {
  isInUniApp,
  communicationStatus,
  sendMessage,
  sendEvent,
  sendRequest,
  addMessageHandler,
  removeMessageHandler,
  checkEnvironment,
  environment,
} = useUniApp();

// 组件特有状态
const urlParams = ref(environment.getUrlParams());
const message = ref('');
const eventName = ref('customEvent');
const customData = ref('{"test":"data"}');
const appData = ref<any>(null);
const loading = ref(false);
const userInfo = ref<any>(null);
const responseData = ref<any>(null);
const responseReceived = ref(false);

// Pinia store
const messageStore = useMessageStore();
const { messages } = messageStore;

// 发送文本消息
const sendTextMessage = () => {
  if (!message.value.trim()) {
    alert('请输入消息内容');
    return;
  }

  // 构建完整的消息对象
  const messageObj = {
    type: 'message',
    action: 'text',
    data: {
      content: message.value.trim(),
      timestamp: new Date().toISOString(),
      requestId: 'req_' + Date.now(),
    },
  };

  try {
    const success = sendMessage(messageObj);

    if (success) {
      addMessageToHistory('我', message.value.trim());
      message.value = '';
      showNotification('消息发送成功', 'success');
    } else {
      showNotification('消息发送失败，请检查环境', 'error');
    }
  } catch (error) {
    console.error('发送消息异常:', error);
    showNotification('发送消息时发生错误', 'error');
  }
};

// 发送带自定义数据的消息
const sendCustomMessage = () => {
  if (!customData.value.trim()) {
    alert('请输入自定义数据');
    return;
  }

  try {
    const parsedData = JSON.parse(customData.value.trim());

    const messageObj = {
      type: 'message',
      action: 'custom',
      data: parsedData,
      timestamp: new Date().toISOString(),
    };

    const success = sendMessage(messageObj);

    if (success) {
      addMessageToHistory('我', `自定义数据: ${customData.value.trim()}`);
      showNotification('自定义消息发送成功', 'success');
    } else {
      showNotification('消息发送失败', 'error');
    }
  } catch (error) {
    console.error('解析JSON数据错误:', error);
    alert('自定义数据格式错误，请输入有效的JSON');
  }
};

// 发送带参数的事件
const sendEventWithParams = () => {
  const event = eventName.value.trim();
  if (!event) {
    alert('请输入事件名称');
    return;
  }

  try {
    let params = {};
    if (customData.value.trim()) {
      params = JSON.parse(customData.value.trim());
    }

    // 使用useUniApp的sendEvent方法
    const success = sendEvent(event, {
      ...params,
      timestamp: new Date().toISOString(),
    });

    if (success) {
      addMessageToHistory('系统', `发送事件: ${event} (带参数)`);
      showNotification(`带参数的事件 ${event} 发送成功`, 'info');
    } else {
      showNotification('事件发送失败', 'error');
    }
  } catch (error) {
    console.error('发送带参事件异常:', error);
    if (error instanceof SyntaxError) {
      alert('自定义数据格式错误，请输入有效的JSON');
    } else {
      showNotification('发送事件时发生错误', 'error');
    }
  }
};

// 请求用户信息 (增强版)
const requestUserInfo = async () => {
  loading.value = true;
  responseReceived.value = false;
  responseData.value = null;

  try {
    addMessageToHistory('我', '请求用户信息');

    // 使用useUniApp的sendRequest方法
    const data = await sendRequest<any>('getUserInfo', {
      timestamp: new Date().toISOString(),
    });

    loading.value = false;
    responseReceived.value = true;
    responseData.value = data;
    userInfo.value = data;

    addMessageToHistory('App', `返回用户信息: ${data.userName || '用户信息'}`);
    showNotification('用户信息获取成功', 'success');
  } catch (error) {
    console.error('获取用户信息失败:', error);
    loading.value = false;
    addMessageToHistory('系统', '获取用户信息请求失败');
    showNotification('获取用户信息失败', 'error');
  }
};

// 测试文件下载 (增强版)
const testDownloadFile = () => {
  const fileInfo = {
    url: 'https://example.com/sample.pdf',
    filename: 'sample.pdf',
    type: 'pdf',
    size: '未知',
  };

  loading.value = true;
  responseReceived.value = false;
  responseData.value = null;

  try {
    const requestId = 'req_download_' + Date.now();

    const timeout = setTimeout(() => {
      if (!responseReceived.value) {
        loading.value = false;
        addMessageToHistory('系统', '文件下载请求超时');
        showNotification('下载请求超时', 'error');
      }
    }, 15000); // 下载请求给更长的超时时间

    const handleResponse = (data: any) => {
      clearTimeout(timeout);
      loading.value = false;
      responseReceived.value = true;
      responseData.value = data;

      addMessageToHistory(
        'App',
        `下载响应: ${data.status === 'success' ? '成功' : '失败'}`
      );
      showNotification(
        `文件下载${data.status === 'success' ? '任务已创建' : '失败'}`,
        data.status === 'success' ? 'success' : 'error'
      );
    };

    const requestData = {
      type: 'request',
      action: 'downloadFile',
      data: fileInfo,
      requestId,
      timestamp: new Date().toISOString(),
    };

    const success = sendMessage(requestData);

    if (success) {
      addMessageToHistory('我', `请求下载文件: ${fileInfo.filename}`);

      // 注册下载响应处理器
      addMessageHandler('download_response', handleResponse);

      setTimeout(() => {
        removeMessageHandler('download_response', handleResponse);
      }, 60000); // 下载响应监听器保留更长时间
    } else {
      clearTimeout(timeout);
      loading.value = false;
      showNotification('下载请求发送失败', 'error');
    }
  } catch (error) {
    console.error('文件下载请求失败:', error);
    loading.value = false;
    showNotification('文件下载请求失败', 'error');
  }
};

// 测试权限请求
const testPermissionRequest = () => {
  sendRequest('requestPermission', {
    permissions: ['camera', 'microphone'],
  });
};

// 测试设备信息获取
const testGetDeviceInfo = () => {
  sendRequest('getDeviceInfo');
};

// 添加消息到历史记录
const addMessageToHistory = (sender: string, content: string) => {
  let messageSender: 'user' | 'app' | 'system' = 'app';
  if (sender === '我') messageSender = 'user';
  else if (sender === '系统') messageSender = 'system';

  messageStore.addMessage(content, messageSender);

  // 滚动到底部
  setTimeout(() => {
    const container = document.querySelector('.messages');
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

// updateCommunicationStatus已由useUniApp Hook提供

// 显示通知
const showNotification = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info'
) => {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // 设置样式
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    color: 'white',
    zIndex: '10000',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    backgroundColor:
      type === 'success'
        ? '#4CAF50'
        : type === 'error'
          ? '#f44336'
          : type === 'warning'
            ? '#ff9800'
            : '#2196F3',
  });

  document.body.appendChild(notification);

  // 3秒后自动移除
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
};

// 暴露给UniApp直接调用的方法
window.testUniAppCall = function (message: string) {
  console.log('UniApp直接调用了H5方法:', message);
  addMessageToHistory('App', `直接调用: ${message}`);
  showNotification(`收到UniApp直接调用: ${message}`, 'info');

  // 返回响应数据
  return {
    success: true,
    message: `H5已处理: ${message}`,
    timestamp: new Date().toISOString(),
  };
};

// 直接接收App数据的方法
window.receiveAppData = function (data: any) {
  console.log('直接收到App数据:', data);

  // 根据数据类型分发到不同的处理器
  if (data.type) {
    switch (data.type) {
      case 'user_info':
        userInfo.value = data.data || data;
        break;
      case 'app_data':
        appData.value = data.data || data;
        break;
      case 'error_response':
        showNotification(`错误: ${data.errorMsg || '未知错误'}`, 'error');
        break;
    }
  }

  addMessageToHistory('App', `直接数据: ${JSON.stringify(data)}`);
};

// checkEnvironment已由useUniApp Hook提供

// 生命周期
onMounted(() => {
  // 注册全局接收器

  // 检测环境
  checkEnvironment();
  addMessageToHistory(
    '系统',
    `环境检测完成: ${isInUniApp.value ? 'UniApp环境' : '浏览器环境'}`
  );

  // 监听App数据消息
  addMessageHandler('app_data', (data) => {
    appData.value = data;
    addMessageToHistory('App', `收到应用数据: ${JSON.stringify(data)}`);
  });

  // 监听特定响应
  addMessageHandler('custom_event', (data) => {
    addMessageToHistory('App', `收到自定义事件: ${JSON.stringify(data)}`);
  });

  // 如果是在App环境中，发送页面加载完成事件
  if (isInUniApp.value) {
    setTimeout(() => {
      sendEvent('pageLoaded');
    }, 100);
  }
});
</script>

<style scoped>
/* UniApp通信测试页面样式 */
</style>
