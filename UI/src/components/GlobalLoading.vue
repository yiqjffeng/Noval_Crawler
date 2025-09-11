<template>
  <transition name="fade">
    <div v-if="loadingStore.isLoading" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="glass-card p-8 flex flex-col items-center space-y-4">
        <div class="loading-spinner"></div>
        <p class="text-slate-300">{{ loadingStore.loadingText }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>