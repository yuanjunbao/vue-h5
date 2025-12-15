// uni.webview.js - 用于 H5 与小程序通信
(function() {
  window.uni = window.uni || {};
  
  // 检测是否在小程序环境中
  var inMiniProgram = function() {
    return !!(window.WeixinJSBridge || window.__wxjs_environment === 'miniprogram' || window.AlipayJSBridge);
  };
  
  // 等待 WeixinJSBridge 加载完成或直接执行
  var ready = function(callback) {
    // 立即执行回调，确保环境检测能够快速响应
    callback();
  };
  
  window.uni.webView = {
    /**
     * 向小程序发送消息
     * @param {Object} data 要发送的消息数据
     */
    postMessage: function(data) {
      var msg = {
        data: data.data || {}
      };
      
      // 微信小程序环境
      if (window.WeixinJSBridge) {
        WeixinJSBridge.invoke('invokeWebViewMethod', {
          method: 'postMessage',
          args: JSON.stringify(msg)
        }, function(res) {
          console.log('消息发送成功:', res);
        });
      } 
      // 支付宝小程序环境
      else if (window.AlipayJSBridge) {
        AlipayJSBridge.call('postMessage', msg);
      } 
      // React Native WebView 环境
      else if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      } 
      // 普通 H5 环境
      else {
        console.log('H5 环境: 发送消息', msg);
        // 触发自定义事件，方便测试
        var event = new CustomEvent('message', { detail: msg });
        window.dispatchEvent(event);
      }
    },
    
    /**
     * 获取当前环境信息
     * @param {Function} callback 回调函数
     */
    getEnv: function(callback) {
      if (typeof callback !== 'function') return;
      
      ready(function() {
        if (window.WeixinJSBridge) {
          WeixinJSBridge.invoke('getEnv', {}, function(res) {
            callback({
              plus: false,
              nvue: false,
              miniprogram: res.miniprogram,
              weixin: res.miniprogram
            });
          });
        } else {
          callback({
            plus: !!window.plus,
            nvue: !!window.plus && !!window.plus.webview,
            miniprogram: inMiniProgram(),
            weixin: window.__wxjs_environment === 'miniprogram',
            alipay: !!window.AlipayJSBridge
          });
        }
      });
    }
  };
  
  console.log('uni.webview.js 初始化完成');
})();
