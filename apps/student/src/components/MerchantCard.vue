<template>
  <view class="merchant-card tap-active" @click="$emit('click')">
    <image class="merchant-image" :src="merchant.image || '/static/images/banner-campus.jpg'" mode="aspectFill" />
    <view class="merchant-content">
      <view class="merchant-header">
        <text class="merchant-name">{{ merchant.name }}</text>
        <view v-if="merchant.tags?.length" class="merchant-tags">
          <text v-for="tag in merchant.tags.slice(0, 2)" :key="tag" class="tag">{{ tag }}</text>
        </view>
      </view>
      <text class="merchant-desc">{{ merchant.summary || '优质商家' }}</text>
      <view class="merchant-footer">
        <view class="meta-item">
          <u-icon name="map-fill" size="12" color="#16A873" />
          <text>{{ merchant.distance || '校边' }}</text>
        </view>
        <view v-if="merchant.avgPrice" class="merchant-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ merchant.avgPrice }}</text>
          <text class="price-unit">/人</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Merchant {
  id: string; name: string; image?: string; summary?: string
  distance?: string; avgPrice?: number; tags?: string[]; defaultChannelId?: string
}
defineProps<{ merchant: Merchant }>()
defineEmits<{ (e: 'click'): void }>()
</script>

<style lang="scss" scoped>
@import '../uni.scss';

.merchant-card {
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
  display: flex;
  flex-direction: column;
  transition: all $transition-base;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-sm;
  }
}

.merchant-image {
  width: 100%;
  height: 230rpx;
}

.merchant-content {
  flex: 1;
  padding: $space-4;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.merchant-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $space-3;
  margin-bottom: $space-2;
}

.merchant-name {
  font-size: $font-base;
  font-weight: $font-bold;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.merchant-tags {
  display: flex;
  gap: $space-2;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.tag {
  padding: $space-1 $space-2;
  background: $primary-bg;
  border-radius: $radius-full;
  font-size: $font-xs;
  color: $primary;
  font-weight: $font-medium;
}

.merchant-desc {
  font-size: $font-xs;
  color: $text-secondary;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: $space-3;
  line-height: 1.5;
}

.merchant-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-2;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: $space-1;

  text {
    font-size: $font-xs;
    color: $text-tertiary;
  }
}

.merchant-price {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
}

.price-symbol {
  font-size: $font-xs;
  color: $error;
  font-weight: $font-medium;
}

.price-value {
  font-size: $font-base;
  color: $error;
  font-weight: $font-bold;
}

.price-unit {
  font-size: $font-xs;
  color: $text-tertiary;
}
</style>
