<template>
  <view class="empty-state" :class="[`empty-state--${size}`]">
    <view class="empty-state__illustration">
      <view class="empty-state__icon" :style="{ background: iconBg }">
        <u-icon :name="icon" :size="iconSize" :color="iconColor" />
      </view>
    </view>

    <view class="empty-state__content">
      <text class="empty-state__title">{{ title }}</text>
      <text v-if="description" class="empty-state__desc">{{ description }}</text>
    </view>

    <view v-if="actionText" class="empty-state__action" @tap="$emit('action')">
      <u-icon v-if="actionIcon" :name="actionIcon" size="16" color="#16A873" />
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
  iconBg: 'linear-gradient(135deg, #F2FBF6 0%, #DFF8EC 100%)',
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
      width: 112rpx;
      height: 112rpx;
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
      width: 184rpx;
      height: 184rpx;
    }

    .empty-state__title {
      font-size: $font-lg;
    }
  }

  &__illustration {
    position: relative;
    margin-bottom: $space-6;
  }

  &__icon {
    width: 144rpx;
    height: 144rpx;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
    border: 1rpx solid $border-light;
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
    background: $primary-bg;
    color: $primary;
    padding: $space-3 $space-8;
    border-radius: $radius-full;
    font-size: $font-base;
    font-weight: $font-medium;
    border: 1rpx solid rgba(22, 168, 115, 0.18);
    transition: all $transition-base;

    &:active {
      transform: scale(0.95);
      opacity: 0.9;
    }
  }
}

</style>
