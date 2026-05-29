<template>
  <view class="empty-state" :class="[`empty-state--${size}`]">
    <!-- 插画区域 -->
    <view class="empty-state__illustration">
      <view class="empty-state__icon" :style="{ background: iconBg }">
        <u-icon :name="icon" :size="iconSize" :color="iconColor" />
      </view>
      <!-- 装饰元素 -->
      <view class="empty-state__decor empty-state__decor--1" />
      <view class="empty-state__decor empty-state__decor--2" />
      <view class="empty-state__decor empty-state__decor--3" />
    </view>

    <!-- 文字区域 -->
    <view class="empty-state__content">
      <text class="empty-state__title">{{ title }}</text>
      <text v-if="description" class="empty-state__desc">{{ description }}</text>
    </view>

    <!-- 操作按钮 -->
    <view v-if="actionText" class="empty-state__action" @tap="$emit('action')">
      <u-icon v-if="actionIcon" :name="actionIcon" size="16" color="#FFFFFF" />
      <text>{{ actionText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  iconColor?: string
  iconBg?: string
  iconSize?: number
  title: string
  description?: string
  actionText?: string
  actionIcon?: string
  size?: 'small' | 'default' | 'large'
}

withDefaults(defineProps<Props>(), {
  icon: 'info-circle',
  iconColor: '#10B981',
  iconBg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
  iconSize: 48,
  size: 'default'
})

defineEmits<{
  action: []
}>()
</script>

<style lang="scss" scoped>
@import '../uni.scss';

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $space-12 $space-8;

  &--small {
    padding: $space-8 $space-6;

    .empty-state__icon {
      width: 120rpx;
      height: 120rpx;
    }

    .empty-state__title {
      font-size: $font-md;
    }

    .empty-state__desc {
      font-size: $font-sm;
    }
  }

  &--large {
    padding: $space-16 $space-8;

    .empty-state__icon {
      width: 200rpx;
      height: 200rpx;
    }

    .empty-state__title {
      font-size: $font-lg;
    }
  }

  &__illustration {
    position: relative;
    margin-bottom: $space-8;
  }

  &__icon {
    width: 160rpx;
    height: 160rpx;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
    box-shadow: $shadow-lg;
  }

  &__decor {
    position: absolute;
    border-radius: $radius-full;
    z-index: 1;

    &--1 {
      width: 32rpx;
      height: 32rpx;
      background: $primary-light;
      opacity: 0.3;
      top: -10rpx;
      right: -10rpx;
      animation: float 3s ease-in-out infinite;
    }

    &--2 {
      width: 24rpx;
      height: 24rpx;
      background: $warning;
      opacity: 0.3;
      bottom: 0;
      left: -10rpx;
      animation: float 3s ease-in-out infinite 0.5s;
    }

    &--3 {
      width: 20rpx;
      height: 20rpx;
      background: $info;
      opacity: 0.3;
      top: 20rpx;
      left: -20rpx;
      animation: float 3s ease-in-out infinite 1s;
    }
  }

  &__content {
    text-align: center;
    margin-bottom: $space-6;
  }

  &__title {
    font-size: $font-md;
    font-weight: $font-semibold;
    color: $text-primary;
    display: block;
    margin-bottom: $space-3;
  }

  &__desc {
    font-size: $font-sm;
    color: $text-tertiary;
    display: block;
    line-height: 1.6;
    max-width: 480rpx;
  }

  &__action {
    display: flex;
    align-items: center;
    gap: $space-2;
    background: $primary-gradient;
    color: $text-inverse;
    padding: $space-3 $space-8;
    border-radius: $radius-full;
    font-size: $font-base;
    font-weight: $font-medium;
    box-shadow: $shadow-primary;
    transition: all $transition-base;

    &:active {
      transform: scale(0.95);
      opacity: 0.9;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
}
</style>
