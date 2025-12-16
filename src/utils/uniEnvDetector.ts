// 引入官方文件
// 方式1：通过CDN引入（推荐）
// <script src="https://doc.dcloud.net.cn/uni.webview.1.5.6.js"></script>
// <script src="https://unpkg.com/@dcloudio/uni-webview-js@0.0.1/index.js"></script>

// 方式2：通过npm安装
// npm install @dcloudio/uni-webview-js
// import '@dcloudio/uni-webview-js';

// 环境检测封装
class UniEnvDetector {
  private static instance: UniEnvDetector;
  private env: {
    // 设备类型
    deviceType: 'mobile' | 'tablet' | 'desktop';
    isMobile: boolean;
    isTablet: boolean;

    // 操作系统
    os: 'ios' | 'android' | 'windows' | 'mac' | 'unknown';

    // 嵌入环境
    isUniapp: boolean;
    isWeChatMiniProgram: boolean;
    isAlipayMiniProgram: boolean;
    isBaiduMiniProgram: boolean;
    isByteDanceMiniProgram: boolean;
    isKuaishouMiniProgram: boolean;

    // 浏览器类型
    browser: 'wechat' | 'qq' | 'safari' | 'chrome' | 'edge' | 'unknown';

    // 其他
    ua: string;
    screenWidth: number;
    screenHeight: number;
    pixelRatio: number;
  };

  private constructor() {
    this.env = {
      deviceType: 'desktop',
      isMobile: false,
      isTablet: false,
      os: 'unknown',
      isUniapp: false,
      isWeChatMiniProgram: false,
      isAlipayMiniProgram: false,
      isBaiduMiniProgram: false,
      isByteDanceMiniProgram: false,
      isKuaishouMiniProgram: false,
      browser: 'unknown',
      ua: navigator.userAgent.toLowerCase(),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
    };

    this.detectDevice();
    this.detectOS();
    this.detectBrowser();
    this.detectEmbeddedEnvironments();
  }

  public static getInstance(): UniEnvDetector {
    if (!UniEnvDetector.instance) {
      UniEnvDetector.instance = new UniEnvDetector();
    }
    return UniEnvDetector.instance;
  }

  private detectDevice(): void {
    // 检测移动设备
    const isMobile =
      /mobile|iphone|ipod|android|blackberry|windows ce|opera mobi/i.test(
        this.env.ua
      );

    if (isMobile) {
      this.env.deviceType = 'mobile';
      this.env.isMobile = true;

      // 检测平板
      const isTablet =
        /ipad|android|tablet/i.test(this.env.ua) ||
        (this.env.screenWidth >= 768 && this.env.screenWidth <= 1200);

      if (isTablet) {
        this.env.deviceType = 'tablet';
        this.env.isTablet = true;
      }
    }
  }

  private detectOS(): void {
    if (/iphone|ipad|ipod/i.test(this.env.ua)) {
      this.env.os = 'ios';
    } else if (/android/i.test(this.env.ua)) {
      this.env.os = 'android';
    } else if (/windows/i.test(this.env.ua)) {
      this.env.os = 'windows';
    } else if (/mac/i.test(this.env.ua)) {
      this.env.os = 'mac';
    }
  }

  private detectBrowser(): void {
    // 微信浏览器
    if (/micromessenger/i.test(this.env.ua)) {
      this.env.browser = 'wechat';
    }

    // QQ浏览器
    if (/qq/i.test(this.env.ua)) {
      this.env.browser = 'qq';
    }

    // Safari
    if (/safari/i.test(this.env.ua) && !/chrome/i.test(this.env.ua)) {
      this.env.browser = 'safari';
    }

    // Chrome
    if (/chrome/i.test(this.env.ua)) {
      this.env.browser = 'chrome';
    }

    // Edge
    if (/edg/i.test(this.env.ua)) {
      this.env.browser = 'edge';
    }
  }

  private detectEmbeddedEnvironments(): void {
    // 1. 检测uniapp环境（使用官方文件提供的方法）
    this.env.isUniapp = !!window.uni;

    // 2. 检测微信小程序内嵌（使用官方文件提供的方法）
    this.env.isWeChatMiniProgram = (this.env.isUniapp && window.wx) || false;

    // 3. 检测支付宝小程序
    this.env.isAlipayMiniProgram =
      !!window.alipay ||
      (this.env.ua.indexOf('alipayclient') > -1 &&
        this.env.ua.indexOf('miniprogram') > -1);

    // 4. 检测百度小程序
    this.env.isBaiduMiniProgram =
      !!window.BDAPP ||
      (this.env.ua.indexOf('baiduboxapp') > -1 &&
        this.env.ua.indexOf('miniprogram') > -1);

    // 5. 检测字节跳动小程序
    this.env.isByteDanceMiniProgram =
      !!window.tt ||
      (this.env.ua.indexOf('toutiao') > -1 &&
        this.env.ua.indexOf('miniprogram') > -1);

    // 6. 检测快手小程序
    this.env.isKuaishouMiniProgram =
      !!window.kuaishou ||
      (this.env.ua.indexOf('kuaishou') > -1 &&
        this.env.ua.indexOf('miniprogram') > -1);
  }

  public getEnv(): typeof this.env {
    return { ...this.env };
  }

  // 环境判断方法
  public isUniapp(): boolean {
    return this.env.isUniapp;
  }

  public isWeChatMiniProgram(): boolean {
    return this.env.isWeChatMiniProgram;
  }

  public isAlipayMiniProgram(): boolean {
    return this.env.isAlipayMiniProgram;
  }

  public isBaiduMiniProgram(): boolean {
    return this.env.isBaiduMiniProgram;
  }

  public isByteDanceMiniProgram(): boolean {
    return this.env.isByteDanceMiniProgram;
  }

  public isKuaishouMiniProgram(): boolean {
    return this.env.isKuaishouMiniProgram;
  }

  public isWeChatBrowser(): boolean {
    return this.env.browser === 'wechat';
  }

  public isMobile(): boolean {
    return this.env.isMobile;
  }

  public getOS(): 'ios' | 'android' | 'windows' | 'mac' | 'unknown' {
    return this.env.os;
  }
}

// 单例实例
export const envDetector = UniEnvDetector.getInstance();
