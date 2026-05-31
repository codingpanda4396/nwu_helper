<template>
  <view class="custom-tabbar">
    <view class="custom-tabbar__inner">
      <view
        v-for="(tab, index) in tabs"
        :key="tab.key"
        :class="['tab-item', { 'tab-item--active': activeIndex === index }]"
        @click="switchTab(tab.pagePath)"
      >
        <view class="tab-icon-wrap">
          <image
            class="tab-icon"
            :src="activeIndex === index ? tab.activeIcon : tab.icon"
            mode="aspectFit"
          />
        </view>
        <text class="tab-label">{{ tab.label }}</text>
        <view v-if="activeIndex === index" class="tab-indicator" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TabItem {
  key: string
  label: string
  icon: string
  activeIcon: string
  pagePath: string
}

const tabs: TabItem[] = [
  {
    key: 'home',
    label: '首页',
    icon: '/static/icons/home-inactive.svg',
    activeIcon: '/static/icons/home-active.svg',
    pagePath: 'pages/index/index'
  },
  {
    key: 'food',
    label: '美食',
    icon: '/static/icons/food-inactive.svg',
    activeIcon: '/static/icons/food-active.svg',
    pagePath: 'pages/food/food'
  },
  {
    key: 'driving',
    label: '驾校',
    icon: '/static/icons/car-inactive.svg',
    activeIcon: '/static/icons/car-active.svg',
    pagePath: 'pages/driving/driving'
  },
  {
    key: 'community',
    label: '社区',
    icon: '/static/icons/chat-inactive.svg',
    activeIcon: '/static/icons/chat-active.svg',
    pagePath: 'pages/community/community'
  },
  {
    key: 'service',
    label: '生活服务',
    icon: '/static/icons/service-inactive.svg',
    activeIcon: '/static/icons/service-active.svg',
    pagePath: 'pages/service/service'
  }
]

const activeIndex = computed(() => {
  const pages = getCurrentPages()
  if (pages.length === 0) return 0
  const currentPage = pages[pages.length - 1]
  const route = currentPage?.route || ''
  const index = tabs.findIndex(tab => route.includes(tab.pagePath))
  return index >= 0 ? index : 0
})

function switchTab(pagePath: string) {
  uni.switchTab({ url: '/' + pagePath })
}
</script>

<style lang="scss" scoped>
@import '../uni.scss';

.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: $bg-card;
  border-top: 1rpx solid $border-light;
  box-shadow: 0 -4rpx 20rpx rgba(46, 36, 22, 0.06);
  padding-bottom: env(safe-area-inset-bottom);
}

.custom-tabbar__inner {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 110rpx;
  padding: 0 $space-2;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  position: relative;
  transition: all $transition-fast;

  &:active {
    transform: scale(0.92);
    opacity: 0.7;
  }
}

.tab-icon-wrap {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rpx;
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  transition: transform $transition-fast;
}

.tab-item--active .tab-icon {
  transform: scale(1.12);
}

.tab-label {
  font-size: 20rpx;
  color: $text-tertiary;
  font-weight: $font-medium;
  line-height: 1.2;
  transition: all $transition-fast;
}

.tab-item--active .tab-label {
  color: $primary;
  font-weight: $font-semibold;
}

.tab-indicator {
  position: absolute;
  bottom: 8rpx;
  width: 32rpx;
  height: 4rpx;
  border-radius: $radius-full;
  background: $primary-gradient;
  animation: indicatorFadeIn 0.2s ease-out;
}

@keyframes indicatorFadeIn {
  from {
    opacity: 0;
    transform: scaleX(0.5);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}
</style>
