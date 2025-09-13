// 导出所有工具函数
export * from './format';
export * from './animation';

// 本地存储工具
export const storage = {
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('存储数据失败:', error);
    }
  },
  
  get: <T = any>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('读取数据失败:', error);
      return defaultValue || null;
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('删除数据失败:', error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('清空数据失败:', error);
    }
  }
};

// 会话存储工具
export const sessionStorage = {
  set: (key: string, value: any): void => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('存储会话数据失败:', error);
    }
  },
  
  get: <T = any>(key: string, defaultValue?: T): T | null => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('读取会话数据失败:', error);
      return defaultValue || null;
    }
  },
  
  remove: (key: string): void => {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error('删除会话数据失败:', error);
    }
  },
  
  clear: (): void => {
    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.error('清空会话数据失败:', error);
    }
  }
};

// URL 工具
export const url = {
  /**
   * 获取URL参数
   * @param name 参数名
   * @param url URL字符串，默认为当前页面URL
   * @returns 参数值
   */
  getQuery: (name: string, url?: string): string | null => {
    const urlObj = new URL(url || window.location.href);
    return urlObj.searchParams.get(name);
  },
  
  /**
   * 设置URL参数
   * @param params 参数对象
   * @param url URL字符串，默认为当前页面URL
   * @returns 新的URL字符串
   */
  setQuery: (params: Record<string, string>, url?: string): string => {
    const urlObj = new URL(url || window.location.href);
    
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
    
    return urlObj.toString();
  },
  
  /**
   * 删除URL参数
   * @param names 参数名列表
   * @param url URL字符串，默认为当前页面URL
   * @returns 新的URL字符串
   */
  removeQuery: (names: string[], url?: string): string => {
    const urlObj = new URL(url || window.location.href);
    
    names.forEach(name => {
      urlObj.searchParams.delete(name);
    });
    
    return urlObj.toString();
  }
};

// 设备检测工具
export const device = {
  /**
   * 是否为移动设备
   */
  isMobile: (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  /**
   * 是否为平板设备
   */
  isTablet: (): boolean => {
    return /iPad|Android|Tablet/i.test(navigator.userAgent) && !window.matchMedia('(max-width: 768px)').matches;
  },
  
  /**
   * 是否为桌面设备
   */
  isDesktop: (): boolean => {
    return !device.isMobile() && !device.isTablet();
  },
  
  /**
   * 获取屏幕尺寸类型
   */
  getScreenSize: (): 'sm' | 'md' | 'lg' | 'xl' | '2xl' => {
    const width = window.innerWidth;
    
    if (width < 640) return 'sm';
    if (width < 768) return 'md';
    if (width < 1024) return 'lg';
    if (width < 1280) return 'xl';
    return '2xl';
  }
};

// 颜色工具
export const color = {
  /**
   * 十六进制转RGB
   * @param hex 十六进制颜色值
   * @returns RGB颜色对象
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  /**
   * RGB转十六进制
   * @param r 红色值
   * @param g 绿色值
   * @param b 蓝色值
   * @returns 十六进制颜色值
   */
  rgbToHex: (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  },
  
  /**
   * 生成随机颜色
   * @returns 随机十六进制颜色值
   */
  random: (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }
};

// 文件工具
export const file = {
  /**
   * 下载文件
   * @param url 文件URL
   * @param filename 文件名
   */
  download: (url: string, filename?: string): void => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  
  /**
   * 下载文本文件
   * @param content 文本内容
   * @param filename 文件名
   * @param mimeType MIME类型
   */
  downloadText: (content: string, filename: string, mimeType: string = 'text/plain'): void => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    file.download(url, filename);
    URL.revokeObjectURL(url);
  },
  
  /**
   * 读取文件内容
   * @param file 文件对象
   * @returns Promise<string>
   */
  readAsText: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
};

// 通用工具函数
export const utils = {
  /**
   * 生成UUID
   * @returns UUID字符串
   */
  generateUUID: (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  
  /**
   * 睡眠函数
   * @param ms 毫秒数
   * @returns Promise
   */
  sleep: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  /**
   * 重试函数
   * @param fn 要重试的函数
   * @param retries 重试次数
   * @param delay 重试延迟
   * @returns Promise
   */
  retry: async <T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await utils.sleep(delay);
        return utils.retry(fn, retries - 1, delay);
      }
      throw error;
    }
  }
};