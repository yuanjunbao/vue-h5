// uni.webview.js (简化版) - 用于 H5 与小程序通信
(function() {
  window.uni = window.uni || {};
  window.uni.webView = {
    postMessage: function(data) {
      // 小程序环境下的通信实现
      if (window.WeixinJSBridge) {
        WeixinJSBridge.invoke('postMessage', data);
      } else if (window.AlipayJSBridge) {
        AlipayJSBridge.call('postMessage', data);
      } else {
        // H5 环境下的模拟
        console.log('H5 环境: 发送消息', data);
      }
    },
    getEnv: function(callback) {
      // 环境检测
      const env = {
        plus: !!window.plus,
        nvue: !!window.plus && !!window.plus.webview,
        miniprogram: !!window.WeixinJSBridge || !!window.AlipayJSBridge
      };
      callback(env);
    }
  };
})();
