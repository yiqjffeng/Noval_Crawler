/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 格式化时间
 * @param date 日期对象或时间戳
 * @returns 格式化后的时间字符串
 */
export const formatTime = (date: Date | string | number): string => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return '无效时间';
  }
  
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}分钟前`;
  }
  
  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}小时前`;
  }
  
  // 大于24小时，显示具体日期
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 格式化持续时间
 * @param seconds 秒数
 * @returns 格式化后的持续时间
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.floor(seconds)}秒`;
  }
  
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}分${remainingSeconds}秒`;
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}小时${minutes}分钟`;
};

/**
 * 格式化百分比
 * @param value 数值
 * @param total 总数
 * @param decimals 小数位数
 * @returns 格式化后的百分比字符串
 */
export const formatPercentage = (value: number, total: number, decimals: number = 1): string => {
  if (total === 0) return '0%';
  
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * 格式化数字
 * @param num 数字
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (num: number): string => {
  if (num < 1000) {
    return num.toString();
  }
  
  if (num < 1000000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  if (num < 1000000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  
  return (num / 1000000000).toFixed(1) + 'B';
};

/**
 * 截取文本
 * @param text 文本
 * @param length 最大长度
 * @param ellipsis 省略符
 * @returns 截取后的文本
 */
export const truncateText = (text: string, length: number, ellipsis: string = '...'): string => {
  if (text.length <= length) {
    return text;
  }
  
  return text.slice(0, length - ellipsis.length) + ellipsis;
};

/**
 * 清理HTML标签
 * @param html HTML字符串
 * @returns 纯文本
 */
export const stripHtml = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

/**
 * 验证章节范围
 * @param start 起始章节
 * @param end 结束章节
 * @param total 总章节数
 * @returns 验证结果
 */
export const validateChapterRange = (
  start: number, 
  end: number, 
  total: number
): { valid: boolean; message?: string } => {
  if (start < 1) {
    return { valid: false, message: '起始章节不能小于1' };
  }
  
  if (end > total) {
    return { valid: false, message: `结束章节不能大于总章节数(${total})` };
  }
  
  if (start > end) {
    return { valid: false, message: '起始章节不能大于结束章节' };
  }
  
  return { valid: true };
};

/**
 * 生成文件名
 * @param bookName 书名
 * @param format 格式
 * @param timestamp 是否添加时间戳
 * @returns 文件名
 */
export const generateFileName = (
  bookName: string, 
  format: string = 'txt', 
  timestamp: boolean = false
): string => {
  // 清理书名中的特殊字符
  const cleanName = bookName
    .replace(/[<>:"/\\|?*]/g, '') // 移除Windows不允许的字符
    .replace(/\s+/g, '_') // 空格替换为下划线
    .trim();
  
  let fileName = cleanName;
  
  if (timestamp) {
    const now = new Date();
    const timeStr = now.toISOString().slice(0, -5).replace(/[:-]/g, '');
    fileName += `_${timeStr}`;
  }
  
  return `${fileName}.${format}`;
};

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
};

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 延迟时间
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 时间限制
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};