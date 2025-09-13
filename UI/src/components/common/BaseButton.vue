<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <LoadingSpinner
      v-if="loading"
      size="small"
      :color="loadingColor"
      class="mr-2"
    />
    
    <component
      v-if="icon && !loading"
      :is="icon"
      class="button-icon"
      :class="{ 'mr-2': $slots.default }"
    />
    
    <span v-if="$slots.default" class="button-text">
      <slot />
    </span>
    
    <component
      v-if="suffixIcon"
      :is="suffixIcon"
      class="button-icon ml-2"
    />
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { gsap } from 'gsap';
import LoadingSpinner from '../loading/LoadingSpinner.vue';
import type { Component } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  round?: boolean;
  icon?: Component;
  suffixIcon?: Component;
  gradient?: boolean;
  glow?: boolean;
}

interface Emits {
  (e: 'click', event: MouseEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
  block: false,
  round: false,
  gradient: true,
  glow: false
});

const emit = defineEmits<Emits>();

const buttonRef = ref<HTMLButtonElement>();

const buttonClasses = computed(() => [
  'base-button',
  `button-${props.variant}`,
  `button-${props.size}`,
  {
    'button-block': props.block,
    'button-round': props.round,
    'button-gradient': props.gradient && props.variant === 'primary',
    'button-glow': props.glow,
    'button-disabled': props.disabled || props.loading,
    'button-loading': props.loading
  }
]);

const loadingColor = computed(() => {
  switch (props.variant) {
    case 'primary':
      return '#ffffff';
    case 'secondary':
      return '#3b82f6';
    case 'danger':
      return '#ffffff';
    case 'success':
      return '#ffffff';
    case 'warning':
      return '#ffffff';
    case 'ghost':
      return '#94a3b8';
    default:
      return '#ffffff';
  }
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
    
    // 点击波纹效果
    createRipple(event);
  }
};

const onMouseEnter = () => {
  if (buttonRef.value && !props.disabled && !props.loading) {
    gsap.to(buttonRef.value, {
      scale: 1.05,
      duration: 0.2,
      ease: 'power2.out'
    });
  }
};

const onMouseLeave = () => {
  if (buttonRef.value && !props.disabled && !props.loading) {
    gsap.to(buttonRef.value, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.out'
    });
  }
};

const createRipple = (event: MouseEvent) => {
  if (!buttonRef.value) return;
  
  const button = buttonRef.value;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  const ripple = document.createElement('span');
  ripple.className = 'button-ripple';
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  
  button.appendChild(ripple);
  
  gsap.fromTo(ripple,
    { scale: 0, opacity: 0.6 },
    { 
      scale: 1, 
      opacity: 0, 
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => ripple.remove()
    }
  );
};
</script>

<style scoped lang="scss">
.base-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  outline: none;
  font-family: inherit;
  
  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
  
  // 尺寸变体
  &.button-small {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    border-radius: 0.375rem;
    min-height: 2rem;
    
    .button-icon {
      width: 1rem;
      height: 1rem;
    }
  }
  
  &.button-medium {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 0.5rem;
    min-height: 2.5rem;
    
    .button-icon {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
  
  &.button-large {
    padding: 1rem 2rem;
    font-size: 1.125rem;
    border-radius: 0.75rem;
    min-height: 3rem;
    
    .button-icon {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
  
  // 颜色变体
  &.button-primary {
    background: #3b82f6;
    color: white;
    
    &:hover:not(.button-disabled) {
      background: #2563eb;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    
    &.button-gradient {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      
      &:hover:not(.button-disabled) {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      }
    }
  }
  
  &.button-secondary {
    background: #64748b;
    color: white;
    
    &:hover:not(.button-disabled) {
      background: #475569;
      box-shadow: 0 4px 12px rgba(100, 116, 139, 0.4);
    }
  }
  
  &.button-ghost {
    background: transparent;
    color: #94a3b8;
    border: 1px solid #475569;
    
    &:hover:not(.button-disabled) {
      background: rgba(148, 163, 184, 0.1);
      color: #cbd5e1;
      border-color: #64748b;
    }
  }
  
  &.button-danger {
    background: #ef4444;
    color: white;
    
    &:hover:not(.button-disabled) {
      background: #dc2626;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    }
  }
  
  &.button-success {
    background: #10b981;
    color: white;
    
    &:hover:not(.button-disabled) {
      background: #059669;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
  }
  
  &.button-warning {
    background: #f59e0b;
    color: white;
    
    &:hover:not(.button-disabled) {
      background: #d97706;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    }
  }
  
  // 状态变体
  &.button-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  &.button-loading {
    cursor: wait;
  }
  
  // 布局变体
  &.button-block {
    width: 100%;
  }
  
  &.button-round {
    border-radius: 9999px;
  }
  
  &.button-glow {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    
    &:hover:not(.button-disabled) {
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
    }
  }
}

.button-text {
  display: inline-block;
}

.button-icon {
  flex-shrink: 0;
  transition: transform 0.2s ease-in-out;
}

:global(.button-ripple) {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  pointer-events: none;
  transform-origin: center;
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .base-button {
    &.button-ghost {
      border-color: #334155;
      
      &:hover:not(.button-disabled) {
        background: rgba(51, 65, 85, 0.5);
        border-color: #475569;
      }
    }
  }
}</style>