<template>
  <div class="gif-animation" :class="{ 'fullscreen': fullscreen, 'enhanced': enhanced }">
    <div class="gif-container" :class="containerClass">
      <img 
        :src="gifSrc" 
        :alt="altText"
        :style="imageStyle"
        class="gif-image"
      />
      <div v-if="showPulse" class="pulse-ring"></div>
    </div>
    <p v-if="text" class="animation-text" :class="textClass">{{ text }}</p>
    <div v-if="showDots" class="loading-dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  type: 'search' | 'loading';
  size?: string;
  text?: string;
  fullscreen?: boolean;
  enhanced?: boolean;
  showPulse?: boolean;
  showDots?: boolean;
  animation?: 'float' | 'pulse' | 'rotate' | 'none';
}

const props = withDefaults(defineProps<Props>(), {
  size: '64px',
  fullscreen: false,
  enhanced: true,
  showPulse: false,
  showDots: false,
  animation: 'float'
});

const gifSrc = computed(() => {
  return props.type === 'search' ? '/search.gif' : '/loading.gif';
});

const altText = computed(() => {
  return props.type === 'search' ? '搜索动画' : '加载动画';
});

const containerClass = computed(() => ({
  'gif-search': props.type === 'search',
  'gif-loading': props.type === 'loading',
  'with-pulse': props.showPulse
}));

const imageStyle = computed(() => ({
  width: props.size,
  height: 'auto'
}));

const textClass = computed(() => ({
  'text-large': props.enhanced && props.type === 'loading',
  'text-small': props.type === 'search'
}));
</script>

<style scoped lang="scss">
.gif-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(8px);
    z-index: 9999;
  }

  &.enhanced {
    gap: 1.5rem;
    padding: 3rem 2rem;
    background: rgba(30, 41, 59, 0.8);
    border-radius: 0.75rem;
    border: 1px solid rgba(51, 65, 85, 0.5);
    backdrop-filter: blur(8px);
  }
}

.gif-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &.with-pulse {
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 120%;
      height: 120%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
      animation: pulse-ring 2s ease-in-out infinite;
    }
  }
}

.gif-image {
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  z-index: 1;
  position: relative;
  
  .gif-search & {
    animation: gentle-bounce 2s ease-in-out infinite;
  }
  
  .gif-loading & {
    animation: float-smooth 3s ease-in-out infinite;
  }
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150%;
  height: 150%;
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  animation: pulse-expand 2s ease-in-out infinite;
}

.animation-text {
  color: #cbd5e1;
  font-weight: 500;
  text-align: center;
  margin: 0;
  
  &.text-large {
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  
  &.text-small {
    font-size: 0.875rem;
  }
}

.loading-dots {
  display: flex;
  gap: 0.5rem;
  
  .dot {
    width: 8px;
    height: 8px;
    background: #3b82f6;
    border-radius: 50%;
    animation: dots-wave 1.4s infinite;
    
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

// Animations
@keyframes gentle-bounce {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.02);
  }
}

@keyframes float-smooth {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-8px) rotate(1deg);
  }
  66% {
    transform: translateY(-4px) rotate(-1deg);
  }
}

@keyframes pulse-ring {
  0% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.3);
  }
}

@keyframes pulse-expand {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.1;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

@keyframes dots-wave {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}
</style>