<template>
  <div
    ref="progressRef"
    :class="progressClasses"
    :style="progressStyle"
  >
    <!-- 进度条轨道 -->
    <div class="progress-track">
      <!-- 进度条填充 -->
      <div
        class="progress-fill"
        :style="fillStyle"
      >
        <!-- 闪光效果 -->
        <div v-if="shimmer" class="progress-shimmer"></div>
      </div>
    </div>
    
    <!-- 进度文本 -->
    <div v-if="showText" class="progress-text" :class="textClass">
      <slot name="text" :percentage="percentage" :value="value" :max="max">
        {{ displayText }}
      </slot>
    </div>
    
    <!-- 状态图标 -->
    <div v-if="showStatus && status" class="progress-status">
      <component
        :is="statusIcon"
        class="status-icon"
        :class="`status-${status}`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { gsap } from 'gsap';

// 状态图标映射
const statusIcons = {
  success: 'CheckCircleIcon',
  error: 'XCircleIcon',
  warning: 'ExclamationTriangleIcon',
  info: 'InformationCircleIcon'
};

interface Props {
  value?: number;
  max?: number;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  showText?: boolean;
  textInside?: boolean;
  format?: (percentage: number) => string;
  status?: 'success' | 'error' | 'warning' | 'info';
  showStatus?: boolean;
  striped?: boolean;
  animated?: boolean;
  shimmer?: boolean;
  indeterminate?: boolean;
  color?: string;
  trackColor?: string;
  rounded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  max: 100,
  size: 'medium',
  variant: 'primary',
  showText: true,
  textInside: false,
  showStatus: false,
  striped: false,
  animated: true,
  shimmer: false,
  indeterminate: false,
  rounded: true
});

const progressRef = ref<HTMLElement>();
const animatedValue = ref(0);

// 计算属性
const percentage = computed(() => {
  if (props.indeterminate) return 100;
  return Math.min(Math.max((props.value / props.max) * 100, 0), 100);
});

const displayText = computed(() => {
  if (props.format) {
    return props.format(percentage.value);
  }
  return `${Math.round(percentage.value)}%`;
});

const progressClasses = computed(() => [
  'base-progress',
  `progress-${props.size}`,
  `progress-${props.variant}`,
  {
    'progress-text-inside': props.textInside,
    'progress-striped': props.striped,
    'progress-animated': props.animated,
    'progress-indeterminate': props.indeterminate,
    'progress-rounded': props.rounded,
    'progress-with-status': props.showStatus && props.status
  }
]);

const textClass = computed(() => ({
  'text-inside': props.textInside,
  'text-outside': !props.textInside
}));

const progressStyle = computed(() => ({
  '--progress-color': props.color,
  '--track-color': props.trackColor
}));

const fillStyle = computed(() => ({
  width: props.indeterminate ? '100%' : `${animatedValue.value}%`,
  transition: props.indeterminate ? 'none' : 'width 0.3s ease-out'
}));

const statusIcon = computed(() => {
  return props.status ? statusIcons[props.status] : null;
});

// 动画效果
const animateProgress = (targetValue: number) => {
  if (!props.animated) {
    animatedValue.value = targetValue;
    return;
  }

  gsap.to(animatedValue, {
    value: targetValue,
    duration: 0.8,
    ease: 'power2.out'
  });
};

// 监听值变化
watch(() => percentage.value, (newValue) => {
  animateProgress(newValue);
}, { immediate: true });

onMounted(() => {
  if (props.animated && progressRef.value) {
    gsap.fromTo(progressRef.value,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
    );
  }
});
</script>

<style scoped lang="scss">
.base-progress {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  
  // 尺寸变体
  &.progress-small {
    height: 0.5rem;
    
    .progress-text {
      font-size: 0.75rem;
      margin-left: 0.5rem;
    }
    
    .status-icon {
      width: 1rem;
      height: 1rem;
      margin-left: 0.5rem;
    }
  }
  
  &.progress-medium {
    height: 0.75rem;
    
    .progress-text {
      font-size: 0.875rem;
      margin-left: 0.75rem;
    }
    
    .status-icon {
      width: 1.25rem;
      height: 1.25rem;
      margin-left: 0.75rem;
    }
  }
  
  &.progress-large {
    height: 1rem;
    
    .progress-text {
      font-size: 1rem;
      margin-left: 1rem;
    }
    
    .status-icon {
      width: 1.5rem;
      height: 1.5rem;
      margin-left: 1rem;
    }
  }
  
  // 文字在内部时的布局调整
  &.progress-text-inside {
    .progress-track {
      flex: 1;
    }
    
    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      margin: 0;
      font-weight: 600;
      font-size: 0.75rem;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      z-index: 2;
    }
  }
  
  // 圆角
  &.progress-rounded {
    .progress-track,
    .progress-fill {
      border-radius: 9999px;
    }
  }
}

.progress-track {
  flex: 1;
  height: 100%;
  background: var(--track-color, #334155);
  border-radius: inherit;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: var(--progress-color);
  border-radius: inherit;
  position: relative;
  transition: width 0.3s ease-out;
  
  // 颜色变体
  .progress-primary & {
    background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  }
  
  .progress-success & {
    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  }
  
  .progress-warning & {
    background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
  }
  
  .progress-error & {
    background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
  }
  
  .progress-info & {
    background: linear-gradient(90deg, #06b6d4 0%, #0891b2 100%);
  }
}

// 条纹效果
.progress-striped .progress-fill {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

// 动画条纹
.progress-animated.progress-striped .progress-fill {
  animation: progress-stripes 1s linear infinite;
}

@keyframes progress-stripes {
  0% {
    background-position-x: 1rem;
  }
}

// 闪光效果
.progress-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

// 不确定进度条
.progress-indeterminate .progress-fill {
  animation: indeterminate 1.5s ease-in-out infinite;
  transform-origin: left;
}

@keyframes indeterminate {
  0% {
    transform: scaleX(0);
    transform-origin: left;
  }
  50% {
    transform: scaleX(0.6);
    transform-origin: left;
  }
  100% {
    transform: scaleX(0);
    transform-origin: right;
  }
}

.progress-text {
  color: #94a3b8;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  
  &.text-inside {
    color: white;
  }
}

.progress-status {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.status-icon {
  &.status-success {
    color: #10b981;
  }
  
  &.status-error {
    color: #ef4444;
  }
  
  &.status-warning {
    color: #f59e0b;
  }
  
  &.status-info {
    color: #06b6d4;
  }
}

// 响应式设计
@media (max-width: 640px) {
  .base-progress {
    &.progress-large {
      height: 0.75rem;
    }
    
    .progress-text {
      font-size: 0.75rem;
    }
  }
}
</style>