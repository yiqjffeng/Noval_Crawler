import { gsap } from 'gsap';

/**
 * 页面进入动画
 * @param element 目标元素
 * @param options 动画选项
 */
export const pageEnterAnimation = (
  element: Element | string,
  options: {
    duration?: number;
    delay?: number;
    from?: gsap.TweenVars;
    to?: gsap.TweenVars;
  } = {}
) => {
  const {
    duration = 0.5,
    delay = 0,
    from = { opacity: 0, y: 30 },
    to = { opacity: 1, y: 0 }
  } = options;

  return gsap.fromTo(element, from, {
    ...to,
    duration,
    delay,
    ease: 'power2.out'
  });
};

/**
 * 页面离开动画
 * @param element 目标元素
 * @param options 动画选项
 */
export const pageLeaveAnimation = (
  element: Element | string,
  options: {
    duration?: number;
    to?: gsap.TweenVars;
  } = {}
) => {
  const {
    duration = 0.3,
    to = { opacity: 0, y: -20 }
  } = options;

  return gsap.to(element, {
    ...to,
    duration,
    ease: 'power2.in'
  });
};

/**
 * 列表项依次出现动画
 * @param elements 元素列表
 * @param options 动画选项
 */
export const staggerAnimation = (
  elements: Element[] | NodeList | string,
  options: {
    duration?: number;
    stagger?: number;
    from?: gsap.TweenVars;
    to?: gsap.TweenVars;
  } = {}
) => {
  const {
    duration = 0.6,
    stagger = 0.1,
    from = { opacity: 0, y: 50, scale: 0.9 },
    to = { opacity: 1, y: 0, scale: 1 }
  } = options;

  return gsap.fromTo(elements, from, {
    ...to,
    duration,
    stagger,
    ease: 'power2.out'
  });
};

/**
 * 搜索框聚焦动画
 * @param element 搜索框元素
 */
export const searchFocusAnimation = (element: Element | string) => {
  const tl = gsap.timeline();
  
  tl.to(element, {
    scale: 1.02,
    boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
    duration: 0.3,
    ease: 'power2.out'
  });
  
  return tl;
};

/**
 * 搜索框失焦动画
 * @param element 搜索框元素
 */
export const searchBlurAnimation = (element: Element | string) => {
  return gsap.to(element, {
    scale: 1,
    boxShadow: '0 0 0px rgba(59, 130, 246, 0)',
    duration: 0.3,
    ease: 'power2.out'
  });
};

/**
 * 按钮悬停动画
 * @param element 按钮元素
 */
export const buttonHoverAnimation = (element: Element | string) => {
  return gsap.to(element, {
    scale: 1.05,
    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
    duration: 0.3,
    ease: 'power2.out'
  });
};

/**
 * 按钮取消悬停动画
 * @param element 按钮元素
 */
export const buttonUnhoverAnimation = (element: Element | string) => {
  return gsap.to(element, {
    scale: 1,
    boxShadow: '0 0 0px rgba(59, 130, 246, 0)',
    duration: 0.3,
    ease: 'power2.out'
  });
};

/**
 * 卡片悬停动画
 * @param element 卡片元素
 */
export const cardHoverAnimation = (element: Element | string) => {
  const tl = gsap.timeline();
  
  tl.to(element, {
    y: -8,
    scale: 1.02,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    duration: 0.3,
    ease: 'power2.out'
  });
  
  return tl;
};

/**
 * 卡片取消悬停动画
 * @param element 卡片元素
 */
export const cardUnhoverAnimation = (element: Element | string) => {
  return gsap.to(element, {
    y: 0,
    scale: 1,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    duration: 0.3,
    ease: 'power2.out'
  });
};

/**
 * 进度条动画
 * @param element 进度条元素
 * @param percentage 目标百分比
 */
export const progressAnimation = (
  element: Element | string,
  percentage: number,
  options: {
    duration?: number;
    ease?: string;
  } = {}
) => {
  const { duration = 1, ease = 'power2.out' } = options;
  
  return gsap.to(element, {
    width: `${percentage}%`,
    duration,
    ease
  });
};

/**
 * 数字递增动画
 * @param element 数字元素
 * @param targetValue 目标值
 * @param options 动画选项
 */
export const countUpAnimation = (
  element: Element | string,
  targetValue: number,
  options: {
    duration?: number;
    ease?: string;
    formatter?: (value: number) => string;
  } = {}
) => {
  const {
    duration = 1,
    ease = 'power2.out',
    formatter = (value: number) => Math.floor(value).toString()
  } = options;

  const obj = { value: 0 };
  
  return gsap.to(obj, {
    value: targetValue,
    duration,
    ease,
    onUpdate: () => {
      const el = typeof element === 'string' ? document.querySelector(element) : element;
      if (el) {
        el.textContent = formatter(obj.value);
      }
    }
  });
};

/**
 * 脉冲动画
 * @param element 目标元素
 * @param options 动画选项
 */
export const pulseAnimation = (
  element: Element | string,
  options: {
    scale?: number;
    duration?: number;
    repeat?: number;
  } = {}
) => {
  const {
    scale = 1.1,
    duration = 1,
    repeat = -1
  } = options;

  return gsap.to(element, {
    scale,
    duration,
    repeat,
    yoyo: true,
    ease: 'power2.inOut'
  });
};

/**
 * 摇摆动画
 * @param element 目标元素
 * @param options 动画选项
 */
export const shakeAnimation = (
  element: Element | string,
  options: {
    intensity?: number;
    duration?: number;
  } = {}
) => {
  const {
    intensity = 10,
    duration = 0.5
  } = options;

  return gsap.to(element, {
    x: `+=${intensity}`,
    duration: duration / 8,
    repeat: 7,
    yoyo: true,
    ease: 'power2.inOut'
  });
};

/**
 * 弹跳动画
 * @param element 目标元素
 * @param options 动画选项
 */
export const bounceAnimation = (
  element: Element | string,
  options: {
    height?: number;
    duration?: number;
  } = {}
) => {
  const {
    height = 20,
    duration = 0.6
  } = options;

  const tl = gsap.timeline();
  
  tl.to(element, {
    y: -height,
    duration: duration / 2,
    ease: 'power2.out'
  })
  .to(element, {
    y: 0,
    duration: duration / 2,
    ease: 'bounce.out'
  });
  
  return tl;
};

/**
 * 加载动画工具类
 */
export class LoadingAnimation {
  private tl: gsap.core.Timeline;
  
  constructor(element: Element | string) {
    this.tl = gsap.timeline({ repeat: -1 });
    this.setupAnimation(element);
  }
  
  private setupAnimation(element: Element | string) {
    this.tl
      .to(element, {
        rotation: 360,
        duration: 1,
        ease: 'none'
      })
      .set(element, { rotation: 0 });
  }
  
  start() {
    this.tl.play();
  }
  
  stop() {
    this.tl.pause();
  }
  
  destroy() {
    this.tl.kill();
  }
}

/**
 * 创建时间轴动画
 * @param animations 动画配置列表
 */
export const createTimeline = (
  animations: Array<{
    element: Element | string;
    from?: gsap.TweenVars;
    to: gsap.TweenVars;
    position?: string | number;
  }>
) => {
  const tl = gsap.timeline();
  
  animations.forEach(({ element, from, to, position }) => {
    if (from) {
      tl.fromTo(element, from, to, position);
    } else {
      tl.to(element, to, position);
    }
  });
  
  return tl;
};

/**
 * 路由切换动画配置
 */
export const routeTransitions = {
  // 淡入淡出
  fade: {
    enter: (el: Element) => pageEnterAnimation(el, { from: { opacity: 0 }, to: { opacity: 1 } }),
    leave: (el: Element) => pageLeaveAnimation(el, { to: { opacity: 0 } })
  },
  
  // 从右侧滑入
  slideLeft: {
    enter: (el: Element) => pageEnterAnimation(el, { from: { opacity: 0, x: 100 }, to: { opacity: 1, x: 0 } }),
    leave: (el: Element) => pageLeaveAnimation(el, { to: { opacity: 0, x: -100 } })
  },
  
  // 从左侧滑入
  slideRight: {
    enter: (el: Element) => pageEnterAnimation(el, { from: { opacity: 0, x: -100 }, to: { opacity: 1, x: 0 } }),
    leave: (el: Element) => pageLeaveAnimation(el, { to: { opacity: 0, x: 100 } })
  },
  
  // 缩放进入
  scale: {
    enter: (el: Element) => pageEnterAnimation(el, { from: { opacity: 0, scale: 0.8 }, to: { opacity: 1, scale: 1 } }),
    leave: (el: Element) => pageLeaveAnimation(el, { to: { opacity: 0, scale: 1.2 } })
  }
};