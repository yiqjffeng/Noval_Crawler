<template>
  <div class="loading-container" :class="containerClass">
    <div class="loading-spinner" :class="spinnerClass" :style="spinnerStyle">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    
    <div v-if="text" class="loading-text" :class="textClass">
      {{ text }}
    </div>
    
    <div v-if="showProgress && progress !== undefined" class="loading-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <div class="progress-text">{{ progress }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { gsap } from 'gsap';

interface Props {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
  fullscreen?: boolean;
  showProgress?: boolean;
  progress?: number;
  animated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  color: '#3b82f6',
  overlay: false,
  fullscreen: false,
  showProgress: false,
  animated: true
});

const loadingContainer = ref<HTMLElement>();

const containerClass = computed(() => ({
  'loading-overlay': props.overlay,
  'loading-fullscreen': props.fullscreen,
  'loading-inline': !props.overlay && !props.fullscreen
}));

const spinnerClass = computed(() => ({
  'spinner-small': props.size === 'small',
  'spinner-medium': props.size === 'medium',
  'spinner-large': props.size === 'large'
}));

const textClass = computed(() => ({
  'text-sm': props.size === 'small',
  'text-base': props.size === 'medium',
  'text-lg': props.size === 'large'
}));

const spinnerStyle = computed(() => ({
  '--spinner-color': props.color
}));

onMounted(() => {
  if (props.animated && loadingContainer.value) {
    gsap.fromTo(loadingContainer.value, 
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
    );
  }
});
</script>

<style scoped lang="scss">
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  &.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(4px);
    z-index: 1000;
  }
  
  &.loading-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(8px);
    z-index: 9999;
  }
  
  &.loading-inline {
    padding: 2rem;
  }
}

.loading-spinner {
  position: relative;
  
  &.spinner-small {
    width: 24px;
    height: 24px;
  }
  
  &.spinner-medium {
    width: 40px;
    height: 40px;
  }
  
  &.spinner-large {
    width: 56px;
    height: 56px;
  }
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid transparent;
  border-top-color: var(--spinner-color, #3b82f6);
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
  
  &:nth-child(1) {
    animation-delay: 0s;
    opacity: 1;
  }
  
  &:nth-child(2) {
    animation-delay: 0.1s;
    opacity: 0.8;
    transform: scale(0.8);
  }
  
  &:nth-child(3) {
    animation-delay: 0.2s;
    opacity: 0.6;
    transform: scale(0.6);
  }
  
  &:nth-child(4) {
    animation-delay: 0.3s;
    opacity: 0.4;
    transform: scale(0.4);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #cbd5e1;
  font-weight: 500;
  text-align: center;
  max-width: 200px;
}

.loading-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 200px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #334155;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--spinner-color, #3b82f6) 0%, #06b6d4 100%);
  border-radius: 2px;
  transition: width 0.3s ease-out;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    animation: shimmer 1.5s infinite;
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
}
</style>