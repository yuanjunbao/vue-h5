// UniApp通信工具类

import { envDetector } from './uniEnvDetector';

/**
 * 环境检测工具
 */
export const environment = {
  // 环境检测
  isInApp(): boolean {
    return envDetector.isUniapp();
  },
  // 系统信息
  async getSystemInfo(): Promise<any> {
    return new Promise((resolve, reject) => {
      window.uni?.getSystemInfo({
        success: (res: any) => resolve(res),
        fail: (err: any) => reject(err),
      });
    });
  },
  // 获取设备基础信息
  getDeviceInfo(): any {
    return window.uni?.getDeviceInfo();
  },
  // 获取URL参数
  getUrlParams(): Record<string, string> {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  },

  // 检查是否支持某些特性
  hasFeature(feature: string): boolean {
    const featureMap: Record<string, boolean> = {
      camera:
        'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      uniBridge: !!window.webUni,
    };
    return featureMap[feature] || false;
  },
};

/**
 * 消息处理器类型定义
 */
type MessageHandler = (data: any) => void;

/**
 * UniApp通信类
 */
export class UniAppCommunicator {
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private isInitialized: boolean = false;
  private webUni: any = null;
  private pendingMessages: any[] = [];

  constructor() {
    this.init();
  }

  /**
   * 初始化通信
   */
  private init(): void {
    // 等待UniApp JSBridge就绪
    if (environment.isInApp()) {
      const checkUniReady = () => {
        if (window.webUni) {
          this.webUni = window.webUni;
          this.isInitialized = true;
          console.log('UniApp通信初始化完成');
          // 处理待发送的消息
          this.flushPendingMessages();
          // 通知App页面已加载
          this.sendEvent('pageLoaded');
        } else {
          setTimeout(checkUniReady, 100);
        }
      };
      checkUniReady();
    }

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.sendEvent('pageVisible');
      }
    });
  }

  /**
   * 注册全局接收消息方法（供App调用）
   */
  public registerGlobalReceiver(): void {
    // 挂载到window对象，供UniApp调用
    (window as any).receiveAppData = (data: any) => {
      this.handleAppMessage(data);
    };

    (window as any).sendParentData = (data: any) => {
      this.postMessage(data);
    };
  }

  /**
   * 处理来自App的消息
   */
  private handleAppMessage(data: any): void {
    console.log('H5收到App消息:', data);

    const { type, action, data: payload } = data;

    // 根据消息类型分发
    if (type === 'response' && action) {
      // 处理响应类型消息
      this.notifyHandlers(`response:${action}`, payload);
    } else if (type === 'app_data') {
      // 处理应用数据消息
      this.notifyHandlers('app_data', payload);
    } else {
      // 处理其他类型消息
      this.notifyHandlers(type || 'unknown', payload || data);
    }
  }

  /**
   * 发送消息到App
   */
  public postMessage(message: any): boolean {
    const formattedMessage = {
      type: message.type || 'message',
      action: message.action,
      data: message.data || message,
      timestamp: Date.now(),
      version: '1.0',
    };

    // 如果还未初始化，将消息加入待发送队列
    if (!this.isInitialized || !this.webUni) {
      this.pendingMessages.push(formattedMessage);
      console.log('通信未初始化，消息已加入待发送队列');
      return false;
    }

    try {
      // 获取当前webview的父窗口
      // const parentWebview = window.plus?.webview.currentWebview()?.parent();

      // 发送消息
      // uniWeb.postMessage({
      //   data: formattedMessage
      // });
      window.uni?.postMessage({
        data: formattedMessage,
      });
      // window.postMessage({
      //   data: formattedMessage
      // });
      console.log('发送消息到App:', formattedMessage);
      return true;
    } catch (e) {
      console.error('发送消息失败:', e);
      return false;
    }
  }

  /**
   * 发送事件到App
   */
  public sendEvent(eventName: string, data?: any): boolean {
    return this.postMessage({
      type: 'event',
      action: eventName,
      data: data,
    });
  }

  /**
   * 向App发送请求并等待响应
   */
  public request(action: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = `req_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const timeoutId = setTimeout(() => {
        this.removeHandler(`response:${action}`, handler);
        reject(new Error(`请求${action}超时`));
      }, 30000); // 30秒超时

      const handler = (responseData: any) => {
        clearTimeout(timeoutId);
        this.removeHandler(`response:${action}`, handler);
        resolve(responseData);
      };

      this.addHandler(`response:${action}`, handler);

      const success = this.postMessage({
        type: 'request',
        action: action,
        data: { ...data, requestId },
      });

      if (!success) {
        clearTimeout(timeoutId);
        this.removeHandler(`response:${action}`, handler);
        reject(new Error('发送请求失败'));
      }
    });
  }

  /**
   * 添加消息处理器
   */
  public addHandler(messageType: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }

  /**
   * 移除消息处理器
   */
  public removeHandler(messageType: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 通知所有处理器
   */
  private notifyHandlers(messageType: string, data: any): void {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (e) {
          console.error(`消息处理器执行失败 [${messageType}]:`, e);
        }
      });
    }
  }

  /**
   * 发送待处理的消息
   */
  private flushPendingMessages(): void {
    while (this.pendingMessages.length > 0) {
      const message = this.pendingMessages.shift();
      this.postMessage(message);
    }
  }

  /**
   * 获取用户信息（示例方法）
   */
  public async getUserInfo(): Promise<any> {
    try {
      return await this.request('getUserInfo');
    } catch (e) {
      console.error('获取用户信息失败:', e);
      // 返回模拟数据或默认值
      return { userId: 'guest', userName: '游客' };
    }
  }

  /**
   * 下载文件（通过App）
   */
  public downloadFile(fileInfo: { url: string; filename: string }): boolean {
    return this.postMessage({
      type: 'request',
      action: 'downloadFile',
      data: fileInfo,
    });
  }
}

// 创建单例实例
export const uniAppCommunicator = new UniAppCommunicator();

// 导出工具函数
export const { isInApp } = environment;

export default uniAppCommunicator;
