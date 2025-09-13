<template>
  <div
    ref="cardRef"
    :class="cardClasses"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="handleClick"
  >
    <!-- 卡片头部 -->
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
      </slot>
      
      <div v-if="$slots.actions" class="card-actions">
        <slot name="actions" />
      </div>
    </div>
    
    <!-- 卡片主体 -->
    <div class="card-body" :class="bodyClass">
      <slot />
    </div>
    
    <!-- 卡片底部 -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
    
    <!-- 加载遮罩 -->
    <div v-if="loading" class="card-loading">
      <LoadingSpinner size="medium" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { gsap } from 'gsap';
import LoadingSpinner from '../loading/LoadingSpinner.vue';

interface Props {
  title?: string;
  hoverable?: boolean;
  clickable?: boolean;
  loading?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  bordered?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'glass' | 'gradient' | 'solid';
  animated?: boolean;
  glow?: boolean;
}

interface Emits {
  (e: 'click', event: MouseEvent): void;
  (e: 'hover', isHovered: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  hoverable: false,
  clickable: false,
  loading: false,
  shadow: 'md',
  bordered: true,
  rounded: 'lg',
  padding: 'md',
  background: 'default',
  animated: true,
  glow: false
});

const emit = defineEmits<Emits>();

const cardRef = ref<HTMLElement>();
const isHovered = ref(false);

const cardClasses = computed(() => [
  'base-card',
  `card-shadow-${props.shadow}`,
  `card-rounded-${props.rounded}`,
  `card-padding-${props.padding}`,
  `card-background-${props.background}`,
  {
    'card-hoverable': props.hoverable,
    'card-clickable': props.clickable,
    'card-bordered': props.bordered,
    'card-loading-state': props.loading,
    'card-glow': props.glow,
    'card-hovered': isHovered.value
  }
]);

const bodyClass = computed(() => ({
  'card-body-no-padding': props.padding === 'none'
}));

const handleClick = (event: MouseEvent) => {
  if (props.clickable && !props.loading) {
    emit('click', event);
  }
};

const onMouseEnter = () => {
  if (!props.loading) {
    isHovered.value = true;
    emit('hover', true);
    
    if (props.hoverable && props.animated && cardRef.value) {
      gsap.to(cardRef.value, {
        y: -8,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }
};

const onMouseLeave = () => {
  isHovered.value = false;
  emit('hover', false);
  
  if (props.hoverable && props.animated && cardRef.value) {
    gsap.to(cardRef.value, {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  }
};

onMounted(() => {
  if (props.animated && cardRef.value) {
    gsap.fromTo(cardRef.value,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }
});
</script>

<style scoped lang="scss">
.base-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #1e293b;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  
  // 阴影变体
  &.card-shadow-none {
    box-shadow: none;
  }
  
  &.card-shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  }
  
  &.card-shadow-md {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  }
  
  &.card-shadow-lg {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
  }
  
  &.card-shadow-xl {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  }
  
  // 圆角变体
  &.card-rounded-sm {
    border-radius: 0.25rem;
  }
  
  &.card-rounded-md {
    border-radius: 0.5rem;
  }
  
  &.card-rounded-lg {
    border-radius: 0.75rem;
  }
  
  &.card-rounded-xl {
    border-radius: 1rem;
  }
  
  &.card-rounded-2xl {
    border-radius: 1.5rem;
  }
  
  &.card-rounded-full {
    border-radius: 9999px;
  }
  
  // 内边距变体
  &.card-padding-none {
    padding: 0;
  }
  
  &.card-padding-sm {
    padding: 0.75rem;
  }
  
  &.card-padding-md {
    padding: 1.5rem;
  }
  
  &.card-padding-lg {
    padding: 2rem;
  }
  
  &.card-padding-xl {
    padding: 2.5rem;
  }
  
  // 背景变体
  &.card-background-default {
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(8px);
  }
  
  &.card-background-glass {
    background: rgba(248, 250, 252, 0.05);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(248, 250, 252, 0.1);
  }
  
  &.card-background-gradient {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%);
    backdrop-filter: blur(8px);
  }
  
  &.card-background-solid {
    background: #334155;
  }
  
  // 边框
  &.card-bordered {
    border: 1px solid rgba(51, 65, 85, 0.5);
  }
  
  // 交互状态
  &.card-hoverable {
    cursor: pointer;
    
    &:hover {
      border-color: rgba(71, 85, 105, 0.7);
      
      &.card-background-default {
        background: rgba(51, 65, 85, 0.8);
      }
      
      &.card-background-glass {
        background: rgba(248, 250, 252, 0.08);
        border-color: rgba(248, 250, 252, 0.15);
      }
      
      &.card-shadow-md {
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      }
    }
  }
  
  &.card-clickable {
    cursor: pointer;
    user-select: none;
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  &.card-glow {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
    
    &:hover {
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
    }
  }
  
  &.card-loading-state {
    pointer-events: none;
    opacity: 0.8;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(51, 65, 85, 0.3);
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #f8fafc;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-body {
  flex: 1;
  color: #cbd5e1;
  line-height: 1.6;
  
  &.card-body-no-padding {
    margin: -1.5rem;
    margin-top: 0;
    margin-bottom: 0;
  }
}

.card-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(51, 65, 85, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

// 响应式设计
@media (max-width: 768px) {
  .base-card {
    &.card-padding-md {
      padding: 1rem;
    }
    
    &.card-padding-lg {
      padding: 1.25rem;
    }
    
    &.card-padding-xl {
      padding: 1.5rem;
    }
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .card-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .card-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
}

// 动画增强
@media (prefers-reduced-motion: no-preference) {
  .base-card {
    &.card-hoverable {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
}
</style>