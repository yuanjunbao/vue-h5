// 扩展全局 Window 接口
declare global {
  interface Window {
    // uni 对象声明
    uni?: {
      webView: {
        // 发送消息到小程序
        postMessage: (data: { data: any }) => void;
        // 获取当前环境
        getEnv: (callback: (env: UniEnv) => void) => void;
      };
    };
    
    // 简化的通信对象声明
    webUni?: {
      postMessage: (data: { data: any }) => void;
      getEnv: (callback: (env: UniEnv) => void) => void;
    };
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
