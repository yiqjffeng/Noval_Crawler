<template>
  <div class="skeleton-loader" :class="[type, { 'animated': animated }]">
    <!-- 卡片骨架 -->
    <div v-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-image" :style="getSkeletonStyle()"></div>
      <div class="skeleton-content">
        <div class="skeleton-line title" :style="getSkeletonStyle()"></div>
        <div class="skeleton-line text" :style="getSkeletonStyle(80)"></div>
        <div class="skeleton-line text" :style="getSkeletonStyle(60)"></div>
      </div>
    </div>

    <!-- 列表骨架 -->
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div v-for="i in lines" :key="i" class="skeleton-item">
        <div class="skeleton-avatar" :style="getSkeletonStyle()"></div>
        <div class="skeleton-lines">
          <div class="skeleton-line" :style="getSkeletonStyle()"></div>
          <div class="skeleton-line short" :style="getSkeletonStyle(70)"></div>
        </div>
      </div>
    </div>

    <!-- 文本骨架 -->
    <div v-else-if="type === 'text'" class="skeleton-text">
      <div v-for="i in lines" :key="i" 
           class="skeleton-line" 
           :style="getSkeletonStyle(getRandomWidth(i))">
      </div>
    </div>

    <!-- 图片骨架 -->
    <div v-else-if="type === 'image'" class="skeleton-image-container">
      <div class="skeleton-image" :style="getSkeletonStyle()"></div>
    </div>

    <!-- 自定义骨架 -->
    <div v-else class="skeleton-custom">
      <slot>
        <div class="skeleton-placeholder" :style="getSkeletonStyle()"></div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'card' | 'list' | 'text' | 'image' | 'custom'
  lines?: number
  animated?: boolean
  width?: string | number
  height?: string | number
  baseColor?: string
  highlightColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  lines: 3,
  animated: true,
  baseColor: '#f0f0f0',
  highlightColor: '#e0e0e0'
})

const getSkeletonStyle = (width?: number) => {
  const baseWidth = width || 100
  return {
    width: typeof props.width === 'string' ? props.width : `${baseWidth}%`,
    height: props.height ? (typeof props.height === 'string' ? props.height : `${props.height}px`) : '16px',
    backgroundColor: props.baseColor,
    '--highlight-color': props.highlightColor
  }
}

const getRandomWidth = (index: number) => {
  const widths = [100, 85, 90, 75, 95, 80]
  return widths[index % widths.length]
}
</script>

<style scoped lang="scss">
.skeleton-loader {
  &.animated {
    .skeleton-line,
    .skeleton-image,
    .skeleton-avatar {
      background: linear-gradient(
        90deg,
        var(--skeleton-base-color, #f0f0f0) 25%,
        var(--highlight-color, #e0e0e0) 50%,
        var(--skeleton-base-color, #f0f0f0) 75%
      );
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
    }
  }

  .skeleton-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .skeleton-image {
      width: 100%;
      height: 200px;
      border-radius: 4px;
    }

    .skeleton-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .skeleton-line.title {
        height: 20px;
        width: 60%;
      }

      .skeleton-line.text {
        height: 16px;
      }
    }
  }

  .skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .skeleton-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #eee;

      .skeleton-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .skeleton-lines {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .skeleton-line {
          height: 14px;
          border-radius: 2px;

          &.short {
            width: 70%;
          }
        }
      }
    }
  }

  .skeleton-text {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .skeleton-line {
      height: 16px;
      border-radius: 2px;
    }
  }

  .skeleton-image-container {
    .skeleton-image {
      width: 100%;
      border-radius: 4px;
    }
  }

  .skeleton-custom {
    .skeleton-placeholder {
      width: 100%;
      height: 100px;
      border-radius: 4px;
    }
  }

  .skeleton-line,
  .skeleton-image,
  .skeleton-avatar {
    border-radius: 4px;
    overflow: hidden;
  }

  @keyframes skeleton-loading {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .skeleton-loader {
    .skeleton-card {
      background: #1e293b;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .skeleton-line,
    .skeleton-image,
    .skeleton-avatar {
      background-color: #334155;
      --highlight-color: #475569;
    }
  }
}
</style>