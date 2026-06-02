<template>
  <view class="search-header" @click="$emit('click')">
    <view class="search-bar">
      <u-icon name="search" size="18" color="#9AA1AA" />
      <text class="search-placeholder">{{ placeholder }}</text>
    </view>
    <slot name="extra" />
  </view>
</template>

<script setup lang="ts">
defineProps<{ placeholder?: string }>()
defineEmits<{ (e: 'click'): void }>()
</script>

<style lang="scss" scoped>
@import '../uni.scss';
.search-header {
  display: flex;
  align-items: center;
  gap: $space-4;
  background: $bg-card-soft;
  padding: $space-4 $space-5;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid $border-light;
}
.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $space-3;
  background: $bg-page;
  border-radius: $radius-full;
  padding: $space-3 $space-5;
  border: 1rpx solid $border;
}
.search-placeholder { font-size: $font-sm; color: $text-placeholder; }
</style>
