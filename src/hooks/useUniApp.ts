import { ref, onMounted, onUnmounted } from 'vue';
import { UniAppCommunicator, environment } from '../utils/uniAppCommunicator';

/**
 * UniApp通信Hook
 * 提供与UniApp环境通信的能力
 */
export function useUniApp() {
  // 状态
  const isInUniApp = ref(false);
  const isInitialized = ref(false);
  const pendingMessages = ref<any[]>([]);
  const communicationStatus = ref({
    initialized: false,
    lastMessageTime: null as Date | null,
    messageCount: 0,
  });

  // 通信器实例
  const communicator = new UniAppCommunicator();

  // 初始化检测
  const checkEnvironment = () => {
    isInUniApp.value = environment.isInApp();
    isInitialized.value = isInUniApp.value;
  };

  // 发送消息
  const sendMessage = (message: any): boolean => {
    const success = communicator.postMessage(message);
    if (success) {
      updateCommunicationStatus();
    }
    return success;
  };

  // 发送事件
  const sendEvent = (eventName: string, data?: any): boolean => {
    return sendMessage({
      type: 'event',
      action: eventName,
      data: data,
    });
  };

  // 发送请求
  const sendRequest = <T = any>(action: string, data?: any): Promise<T> => {
    return new Promise((resolve, reject) => {
      communicator
        .request(action, data)
        .then((res) => {
          updateCommunicationStatus();
          resolve(res as T);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      return await communicator.getUserInfo();
    } catch (e) {
      console.error('获取用户信息失败:', e);
      return { userId: 'guest', userName: '游客' };
    }
  };

  // 下载文件
  const downloadFile = (fileInfo: {
    url: string;
    filename: string;
  }): boolean => {
    return communicator.downloadFile(fileInfo);
  };

  // 请求权限
  const requestPermission = (permissions: string[]): Promise<any> => {
    return sendRequest('requestPermission', { permissions });
  };

  // 获取设备信息
  const getDeviceInfo = (): Promise<any> => {
    return sendRequest('getDeviceInfo');
  };

  // 添加消息处理器
  const addMessageHandler = (
    messageType: string,
    handler: (data: any) => void
  ) => {
    communicator.addHandler(messageType, handler);
  };

  // 移除消息处理器
  const removeMessageHandler = (
    messageType: string,
    handler: (data: any) => void
  ) => {
    communicator.removeHandler(messageType, handler);
  };

  // 更新通信状态
  const updateCommunicationStatus = () => {
    communicationStatus.value.lastMessageTime = new Date();
    communicationStatus.value.messageCount++;
  };

  // 注册全局接收者
  const registerGlobalReceiver = () => {
    communicator.registerGlobalReceiver();
  };
  const navigateBack = (opt = {}) => {
    window.uni?.navigateBack({ delta: 1, ...opt });
  };
  const navigateTo = (url: string, opt = {}) => {
    window.uni?.navigateTo({ url, ...opt });
  };
  const redirectTo = (url: string, opt = {}) => {
    window.uni?.redirectTo({ url, ...opt });
  };
  const switchTab = (url: string, opt = {}) => {
    window.uni?.switchTab({ url, ...opt });
  };
  const reLaunch = (url: string, opt = {}) => {
    window.uni?.reLaunch({ url, ...opt });
  };
  const showToast = (opt: {
    title: string;
    icon?: 'success' | 'loading' | 'none';
    duration?: number;
  }) => {
    window.uni?.showToast(opt);
  };
  // 生命周期钩子
  onMounted(() => {
    checkEnvironment();
    registerGlobalReceiver();

    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (!document.hidden && isInUniApp.value) {
        sendEvent('pageVisible');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    onUnmounted(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    });
  });

  return {
    // 状态
    isInUniApp,
    isInitialized,
    communicationStatus,
    pendingMessages,

    // 方法
    sendMessage,
    sendEvent,
    sendRequest,
    getUserInfo,
    downloadFile,
    requestPermission,
    getDeviceInfo,
    addMessageHandler,
    removeMessageHandler,
    checkEnvironment,
    navigateBack,
    navigateTo,
    redirectTo,
    switchTab,
    reLaunch,
    showToast,
    // 工具
    environment,
    communicator,
  };
}

// 导出便捷方法
export default useUniApp;
