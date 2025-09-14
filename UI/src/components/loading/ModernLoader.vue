<template>
  <div class="modern-loader" :class="[type, size, { 'full-screen': fullscreen }]" :style="customStyle">
    <!-- 旋转加载器 -->
    <div v-if="type === 'spinner'" class="spinner-container">
      <div class="spinner" :style="spinnerStyle">
        <div v-for="i in 4" :key="i" class="spinner-blade"></div>
      </div>
    </div>

    <!-- 脉冲加载器 -->
    <div v-else-if="type === 'pulse'" class="pulse-container">
      <div class="pulse-dot" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.15}s` }"></div>
    </div>

    <!-- 骨架屏加载器 -->
    <div v-else-if="type === 'skeleton'" class="skeleton-container">
      <div class="skeleton-line" v-for="i in skeletonLines" :key="i" :style="{ width: getSkeletonWidth(i) }"></div>
    </div>

    <!-- 点阵加载器 -->
    <div v-else-if="type === 'dots'" class="dots-container">
      <div class="loading-dot" v-for="i in 5" :key="i" :style="{ animationDelay: `${i * 0.1}s` }"></div>
    </div>

    <!-- 波浪加载器 -->
    <div v-else-if="type === 'wave'" class="wave-container">
      <div class="wave" :style="waveStyle"></div>
    </div>

    <!-- 轨道加载器 -->
    <div v-else-if="type === 'orbit'" class="orbit-container">
      <div class="orbit-center"></div>
      <div class="orbit-ring" v-for="i in 2" :key="i" :style="{ animationDelay: `${i * 0.5}s` }"></div>
    </div>

    <!-- 文本内容 -->
    <div v-if="text" class="loader-text" :class="textClass">
      {{ text }}
    </div>

    <!-- 进度条 -->
    <div v-if="showProgress" class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="progressStyle"></div>
      </div>
      <span v-if="progress !== undefined" class="progress-text">{{ progress }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'spinner' | 'pulse' | 'skeleton' | 'dots' | 'wave' | 'orbit'
  size?: 'small' | 'medium' | 'large'
  color?: string
  text?: string
  fullscreen?: boolean
  showProgress?: boolean
  progress?: number
  skeletonLines?: number
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'spinner',
  size: 'medium',
  color: '#3b82f6',
  fullscreen: false,
  showProgress: false,
  skeletonLines: 3,
  duration: 1.2
})

const customStyle = computed(() => ({
  '--loader-color': props.color,
  '--loader-duration': `${props.duration}s`
}))

const spinnerStyle = computed(() => ({
  width: getSize(),
  height: getSize()
}))

const waveStyle = computed(() => ({
  background: `linear-gradient(90deg, transparent, ${props.color}, transparent)`,
  animationDuration: `${props.duration}s`
}))

const progressStyle = computed(() => ({
  width: props.progress ? `${props.progress}%` : '0%',
  backgroundColor: props.color
}))

const textClass = computed(() => `text-${props.size}`)

function getSize() {
  const sizes = {
    small: '24px',
    medium: '40px',
    large: '60px'
  }
  return sizes[props.size]
}

function getSkeletonWidth(index: number) {
  const widths = ['100%', '80%', '60%', '90%', '75%']
  return widths[index % widths.length]
}
</script>

<style scoped lang="scss">
.modern-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  &.full-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(4px);
    z-index: 9999;
  }

  // 旋转加载器样式
  .spinner-container {
    .spinner {
      position: relative;
      
      .spinner-blade {
        position: absolute;
        left: 44.5%;
        top: 37%;
        width: 10%;
        height: 25%;
        border-radius: 50% / 20%;
        background-color: var(--loader-color);
        animation: spinner-fade var(--loader-duration) linear infinite;
        
        @for $i from 1 through 4 {
          &:nth-child(#{$i}) {
            animation-delay: #{($i - 1) * 0.15}s;
            transform: rotate(#{90 * ($i - 1)}deg) translate(0, -150%);
          }
        }
      }
    }
  }

  // 脉冲加载器样式
  .pulse-container {
    display: flex;
    gap: 0.5rem;
    
    .pulse-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: var(--loader-color);
      animation: pulse-scale var(--loader-duration) ease-in-out infinite;
    }
  }

  // 骨架屏样式
  .skeleton-container {
    width: 100%;
    max-width: 300px;
    
    .skeleton-line {
      height: 16px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 8px;
    }
  }

  // 点阵样式
  .dots-container {
    display: flex;
    gap: 4px;
    
    .loading-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--loader-color);
      animation: dot-bounce var(--loader-duration) ease-in-out infinite;
    }
  }

  // 波浪样式
  .wave-container {
    width: 100px;
    height: 4px;
    overflow: hidden;
    
    .wave {
      height: 100%;
      animation: wave-slide var(--loader-duration) linear infinite;
    }
  }

  // 轨道样式
  .orbit-container {
    position: relative;
    width: 60px;
    height: 60px;
    
    .orbit-center {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 12px;
      height: 12px;
      background-color: var(--loader-color);
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }
    
    .orbit-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 40px;
      height: 40px;
      margin: -20px 0 0 -20px;
      border: 2px solid transparent;
      border-top-color: var(--loader-color);
      border-radius: 50%;
      animation: orbit-spin var(--loader-duration) linear infinite;
    }
  }

  .loader-text {
    color: var(--loader-color);
    font-weight: 500;
    
    &.text-small { font-size: 0.875rem; }
    &.text-medium { font-size: 1rem; }
    &.text-large { font-size: 1.125rem; }
  }

  .progress-container {
    width: 100%;
    max-width: 200px;
    
    .progress-bar {
      width: 100%;
      height: 4px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
      
      .progress-fill {
        height: 100%;
        transition: width 0.3s ease;
      }
    }
    
    .progress-text {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: var(--loader-color);
    }
  }

  // 动画定义
  @keyframes spinner-fade {
    0% { opacity: 1; }
    100% { opacity: 0.15; }
  }

  @keyframes pulse-scale {
    0%, 100% { transform: scale(0.8); opacity: 0.5; }
    50% { transform: scale(1.2); opacity: 1; }
  }

  @keyframes skeleton-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes dot-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes wave-slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes orbit-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}
</style>