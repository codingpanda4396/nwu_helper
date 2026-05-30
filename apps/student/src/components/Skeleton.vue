<template>
  <view class="skeleton" :class="[`skeleton-${type}`]">
    <!-- 卡片骨架屏 -->
    <template v-if="type === 'card'">
      <view v-for="i in count" :key="`card-${i}`" class="skeleton-card">
        <view class="skeleton-image shimmer" />
        <view class="skeleton-content">
          <view class="skeleton-title shimmer" />
          <view class="skeleton-text shimmer" />
          <view class="skeleton-text skeleton-text--short shimmer" />
        </view>
      </view>
    </template>

    <!-- 列表骨架屏 -->
    <template v-else-if="type === 'list'">
      <view v-for="i in count" :key="`list-${i}`" class="skeleton-list-item">
        <view class="skeleton-avatar shimmer" />
        <view class="skeleton-content">
          <view class="skeleton-title shimmer" />
          <view class="skeleton-text shimmer" />
        </view>
      </view>
    </template>

    <!-- 首页轮播骨架屏 -->
    <view v-else-if="type === 'banner'" class="skeleton-banner">
      <view class="skeleton-banner-img shimmer" />
    </view>

    <!-- 金刚区骨架屏 -->
    <view v-else-if="type === 'grid'" class="skeleton-grid">
      <view v-for="i in 4" :key="`grid-${i}`" class="skeleton-grid-item">
        <view class="skeleton-grid-icon shimmer" />
        <view class="skeleton-grid-text shimmer" />
      </view>
    </view>

    <!-- 商家卡片骨架屏 -->
    <template v-else-if="type === 'merchant'">
      <view v-for="i in count" :key="`merchant-${i}`" class="skeleton-merchant">
        <view class="skeleton-merchant-img shimmer" />
        <view class="skeleton-merchant-content">
          <view class="skeleton-title shimmer" />
          <view class="skeleton-text shimmer" />
          <view class="skeleton-meta">
            <view class="skeleton-meta-item shimmer" />
            <view class="skeleton-meta-item shimmer" />
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
interface Props {
  type?: 'card' | 'list' | 'banner' | 'grid' | 'merchant'
  count?: number
}

withDefaults(defineProps<Props>(), {
  type: 'card',
  count: 3
})
</script>

<style lang="scss" scoped>
@import '../uni.scss';

.skeleton {
  padding: $space-4;
}

.shimmer {
  background: linear-gradient(
    90deg,
    #F5F0E8 25%,
    #ECE4D8 50%,
    #F5F0E8 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: $radius-sm;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 卡片骨架屏 */
.skeleton-card {
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  margin-bottom: $space-4;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;

  .skeleton-image {
    height: 300rpx;
  }

  .skeleton-content {
    padding: $space-4;
  }

  .skeleton-title {
    height: 32rpx;
    width: 60%;
    margin-bottom: $space-3;
  }

  .skeleton-text {
    height: 24rpx;
    width: 100%;
    margin-bottom: $space-2;

    &--short {
      width: 40%;
    }
  }
}

/* 列表骨架屏 */
.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: $space-4;
  padding: $space-4;
  background: $bg-card;
  border-radius: $radius-md;
  margin-bottom: $space-3;
  border: 1rpx solid $border-light;

  .skeleton-avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: $radius-full;
    flex-shrink: 0;
  }

  .skeleton-content {
    flex: 1;
  }

  .skeleton-title {
    height: 28rpx;
    width: 50%;
    margin-bottom: $space-3;
  }

  .skeleton-text {
    height: 24rpx;
    width: 80%;
  }
}

/* 轮播骨架屏 */
.skeleton-banner {
  padding: 0 $space-4;
  margin-bottom: $space-4;

  .skeleton-banner-img {
    height: 320rpx;
    border-radius: $radius-lg;
  }
}

/* 金刚区骨架屏 */
.skeleton-grid {
  display: flex;
  justify-content: space-around;
  padding: $space-6;
  background: $bg-card;
  border-radius: $radius-lg;
  margin: 0 $space-4 $space-4;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;

  .skeleton-grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-3;
  }

  .skeleton-grid-icon {
    width: 96rpx;
    height: 96rpx;
    border-radius: $radius-lg;
  }

  .skeleton-grid-text {
    width: 80rpx;
    height: 24rpx;
  }
}

/* 商家卡片骨架屏 */
.skeleton-merchant {
  display: flex;
  gap: $space-4;
  padding: $space-4;
  background: $bg-card;
  border-radius: $radius-lg;
  margin-bottom: $space-4;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;

  .skeleton-merchant-img {
    width: 200rpx;
    height: 200rpx;
    border-radius: $radius-md;
    flex-shrink: 0;
  }

  .skeleton-merchant-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .skeleton-title {
    height: 32rpx;
    width: 70%;
    margin-bottom: $space-3;
  }

  .skeleton-text {
    height: 24rpx;
    width: 90%;
    margin-bottom: $space-4;
  }

  .skeleton-meta {
    display: flex;
    gap: $space-4;
  }

  .skeleton-meta-item {
    height: 20rpx;
    width: 100rpx;
  }
}
</style>
