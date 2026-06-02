<template>
  <view class="section-header">
    <view class="section-header__left">
      <text class="section-title">{{ title }}</text>
      <text v-if="desc" class="section-desc">{{ desc }}</text>
    </view>
    <view v-if="showMore" class="section-header__more" @click="$emit('more')">
      <text>更多</text>
      <u-icon name="arrow-right" size="14" color="#9AA1AA" />
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{ title: string; desc?: string; showMore?: boolean }>()
defineEmits<{ (e: 'more'): void }>()
</script>

<style lang="scss" scoped>
@import '../uni.scss';
.section-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: $space-5; }
.section-header__left { display: flex; flex-direction: column; }
.section-title { font-size: $font-base; font-weight: $font-bold; color: $text-primary; display: block; }
.section-desc { font-size: $font-xs; color: $text-tertiary; margin-top: $space-1; display: block; }
.section-header__more { display: flex; align-items: center; gap: $space-1; }
.section-header__more text { font-size: $font-sm; color: $text-tertiary; }
</style>
