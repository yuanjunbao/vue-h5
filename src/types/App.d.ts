// 扩展全局 Window 接口
declare global {
  interface Window {
    // uni 对象声明
    uni?: {
      webView: {
        // 获取当前环境
        getEnv: (callback: (env: UniEnv) => void) => void;
      };
      // 发送消息到小程序
      postMessage: (data: { data: any }) => void;
      navigateBack: (options: { delta: number }) => void;
      navigateTo: (options: { url: string }) => void;
      redirectTo: (options: { url: string }) => void;
      switchTab: (options: { url: string }) => void;
      reLaunch: (options: { url: string }) => void;
      showToast: (options: {
        title: string;
        icon?: 'success' | 'loading' | 'none';
        duration?: number;
      }) => void;
      getSystemInfo: ({
        success,
      }: {
        success: (systemInfo: UniSystemInfo) => void;
        fail: (err: any) => void;
      }) => void;
      getDeviceInfo: () => any;
    };
    // wx 对象声明
    wx?: any;
    qq?: any;
    tt?: any;
    ks?: any;
    alipay: any;
    BDAPP: any;
    tt: any;
    kuaishou: any;
    // 简化的通信对象声明
    webUni?: {
      postMessage: (data: { data: any }) => void;
      getEnv: (callback: (env: UniEnv) => void) => void;
      navigateBack: () => void;
    };
    receiveAppData: (data: any) => void;
    sendParentData: (data: any) => void;
    testUniAppCall: (data: any) => void;
  }
  interface IObjectBase {
    [key: string]: any;
  }
}

// 环境类型接口
export interface UniEnv {
  // 是否为 5+ App 环境
  plus: boolean;
  // 是否为 nvue 环境
  nvue: boolean;
  // 是否为小程序环境
  miniprogram: boolean;
}

// 确保模块声明
export {};
