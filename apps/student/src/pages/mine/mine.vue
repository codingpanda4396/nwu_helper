<template>
  <view class="page">
    <!-- 用户头部 -->
    <view class="user-header">
      <view class="user-header__bg" />
      <view class="user-header__content">
        <view class="avatar-wrap">
          <view class="avatar-wrap__inner">
            <u-icon name="account-fill" size="52" color="#FFFFFF" />
          </view>
          <view class="avatar-badge">
            <u-icon name="star-fill" size="12" color="#FFFFFF" />
          </view>
        </view>
        <view class="user-info">
          <text class="user-name">竹影同学</text>
          <view class="user-desc">
            <u-icon name="map-fill" size="12" color="rgba(255,255,255,0.8)" />
            <text>探索校园好店</text>
          </view>
        </view>
        <view class="user-action tap-active" @click="goTo('/pages/feedback/feedback')">
          <u-icon name="edit-pen-fill" size="16" color="#10B981" />
          <text>反馈</text>
        </view>
      </view>

      <!-- 统计卡片 -->
      <view class="stats-card">
        <view class="stat-item tap-active" @click="goTo('/pages/favorite/favorite')">
          <text class="stat-value">{{ favoriteCount }}</text>
          <text class="stat-label">收藏</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item tap-active" @click="goTo('/pages/history/history')">
          <text class="stat-value">{{ historyCount }}</text>
          <text class="stat-label">足迹</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item tap-active">
          <text class="stat-value">0</text>
          <text class="stat-label">点赞</text>
        </view>
      </view>
    </view>

    <!-- 菜单区块 -->
    <view class="menu-section slide-up stagger-1">
      <view class="menu-section__title">
        <text>常用功能</text>
      </view>
      <view class="menu-item tap-active" @click="goTo('/pages/favorite/favorite')">
        <view class="menu-left">
          <view class="menu-icon menu-icon--heart">
            <u-icon name="heart-fill" size="18" color="#FFFFFF" />
          </view>
          <text>我的收藏</text>
        </view>
        <view class="menu-right">
          <u-icon name="arrow-right" size="16" color="#D1D5DB" />
        </view>
      </view>
      <view class="menu-item tap-active" @click="goTo('/pages/history/history')">
        <view class="menu-left">
          <view class="menu-icon menu-icon--clock">
            <u-icon name="clock-fill" size="18" color="#FFFFFF" />
          </view>
          <text>浏览历史</text>
        </view>
        <view class="menu-right">
          <u-icon name="arrow-right" size="16" color="#D1D5DB" />
        </view>
      </view>
    </view>

    <view class="menu-section slide-up stagger-2">
      <view class="menu-section__title">
        <text>其他</text>
      </view>
      <view class="menu-item tap-active" @click="contactPlatform">
        <view class="menu-left">
          <view class="menu-icon menu-icon--service">
            <u-icon name="kefu-ermai" size="18" color="#FFFFFF" />
          </view>
          <text>联系平台</text>
        </view>
        <view class="menu-right">
          <u-icon name="arrow-right" size="16" color="#D1D5DB" />
        </view>
      </view>
      <view class="menu-item tap-active" @click="showAbout">
        <view class="menu-left">
          <view class="menu-icon menu-icon--info">
            <u-icon name="info-circle-fill" size="18" color="#FFFFFF" />
          </view>
          <text>关于平台</text>
        </view>
        <view class="menu-right">
          <u-icon name="arrow-right" size="16" color="#D1D5DB" />
        </view>
      </view>
    </view>

    <!-- 底部 -->
    <view class="footer slide-up stagger-3">
      <view class="footer-logo">
        <u-icon name="star-fill" size="24" color="#10B981" />
      </view>
      <text class="footer-text">竹影校园 v1.0.0</text>
      <text class="footer-desc">校园本地生活增长平台</text>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const uToast = ref<any>(null)
const favoriteCount = ref(0)
const historyCount = ref(0)

onMounted(() => {
  try {
    const fav = uni.getStorageSync('favorites')
    if (fav) favoriteCount.value = JSON.parse(fav).length || 0
  } catch {}
  try {
    const hist = uni.getStorageSync('viewHistory')
    if (hist) historyCount.value = JSON.parse(hist).length || 0
  } catch {}
})

function goTo(url: string) {
  uni.navigateTo({ url })
}

function contactPlatform() {
  uToast.value.show({
    title: '请添加竹影校园微信',
    type: 'info'
  })
}

function showAbout() {
  uToast.value.show({
    title: '竹影校园 - 校园本地生活增长平台',
    type: 'info'
  })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  min-height: 100vh;
  background: $bg-page;
}

/* ========== 用户头部 ========== */
.user-header {
  position: relative;
  padding-bottom: $space-8;

  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 380rpx;
    background: $primary-gradient;
    border-radius: 0 0 48rpx 48rpx;
  }

  &__content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: $space-5;
    padding: 80rpx $space-6 0;
  }
}

.avatar-wrap {
  position: relative;

  &__inner {
    width: 120rpx;
    height: 120rpx;
    border-radius: $radius-full;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
  }
}

.avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36rpx;
  height: 36rpx;
  border-radius: $radius-full;
  background: $warning;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid $bg-card;
}

.user-info {
  flex: 1;
}

.user-name {
  display: block;
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $text-inverse;
  margin-bottom: $space-2;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.user-desc {
  display: flex;
  align-items: center;
  gap: $space-2;

  text {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.85);
  }
}

.user-action {
  display: flex;
  align-items: center;
  gap: $space-2;
  background: rgba(255, 255, 255, 0.9);
  padding: $space-2 $space-4;
  border-radius: $radius-full;

  text {
    font-size: $font-xs;
    color: $primary;
    font-weight: $font-medium;
  }
}

/* ========== 统计卡片 ========== */
.stats-card {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  background: $bg-card;
  margin: $space-5 $space-6 0;
  border-radius: $radius-lg;
  padding: $space-5 $space-4;
  box-shadow: $shadow-lg;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
}

.stat-value {
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $primary;
}

.stat-label {
  font-size: $font-xs;
  color: $text-tertiary;
}

.stat-divider {
  width: 1rpx;
  height: 48rpx;
  background: $border-light;
}

/* ========== 菜单区块 ========== */
.menu-section {
  margin: $space-4 $space-5;
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;

  &__title {
    padding: $space-4 $space-5 $space-2;

    text {
      font-size: $font-sm;
      color: $text-tertiary;
      font-weight: $font-medium;
    }
  }
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-4 $space-5;
  border-bottom: 1rpx solid $border-light;

  &:last-child {
    border-bottom: none;
  }
}

.menu-left {
  display: flex;
  align-items: center;
  gap: $space-4;

  text {
    font-size: $font-base;
    color: $text-primary;
    font-weight: $font-medium;
  }
}

.menu-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;

  &--heart {
    background: linear-gradient(135deg, #F87171 0%, #EF4444 100%);
  }

  &--clock {
    background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
  }

  &--service {
    background: linear-gradient(135deg, #34D399 0%, #10B981 100%);
  }

  &--info {
    background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
  }
}

.menu-right {
  display: flex;
  align-items: center;
}

/* ========== 底部 ========== */
.footer {
  text-align: center;
  padding: $space-10 $space-6;
}

.footer-logo {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-full;
  background: $primary-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto $space-4;
}

.footer-text {
  display: block;
  font-size: $font-sm;
  color: $text-tertiary;
  margin-bottom: $space-1;
}

.footer-desc {
  display: block;
  font-size: $font-xs;
  color: $text-placeholder;
}
</style>
