<template>
  <view class="page">
    <!-- 未登录 -->
    <view v-if="!store.isLogin" class="not-login">
      <view class="login-prompt" @click="goLogin">
        <view class="avatar-placeholder">
          <u-icon name="account" size="48" color="#D1D5DB" />
        </view>
        <text class="prompt-text">点击登录</text>
        <text class="prompt-desc">登录后同步收藏和历史记录</text>
      </view>
    </view>

    <!-- 已登录 -->
    <template v-if="store.isLogin">
      <view class="profile-card">
        <view class="profile-header">
          <image
            class="avatar"
            :src="store.user?.avatarUrl || '/static/logo.png'"
            mode="aspectFill"
          />
          <view class="profile-info">
            <text class="profile-name">{{ store.user?.nickname || store.user?.name || '用户' }}</text>
            <text class="profile-phone">{{ store.user?.phone || '' }}</text>
          </view>
        </view>
      </view>

      <view class="menu-section">
        <view class="menu-item" @click="goFavorite">
          <u-icon name="heart" size="22" color="#F59E0B" />
          <text class="menu-text">我的收藏</text>
          <u-icon name="arrow-right" size="16" color="#D1D5DB" />
        </view>
        <view class="menu-item" @click="goHistory">
          <u-icon name="clock" size="22" color="#3B82F6" />
          <text class="menu-text">浏览历史</text>
          <u-icon name="arrow-right" size="16" color="#D1D5DB" />
        </view>
        <view class="menu-item" @click="goFeedback">
          <u-icon name="edit-pen" size="22" color="#8B5CF6" />
          <text class="menu-text">意见反馈</text>
          <u-icon name="arrow-right" size="16" color="#D1D5DB" />
        </view>
      </view>

      <view class="logout-wrap">
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </view>
    </template>

    <u-toast ref="uToast" />
    <CustomTabbar />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/store/index'
import CustomTabbar from '@/components/CustomTabbar.vue'

const store = useAppStore()
const uToast = ref<any>(null)

function goLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}

function goFavorite() {
  uni.navigateTo({ url: '/pages/favorite/favorite' })
}

function goHistory() {
  uni.navigateTo({ url: '/pages/history/history' })
}

function goFeedback() {
  uni.navigateTo({ url: '/pages/feedback/feedback' })
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定退出登录？',
    success: (res) => {
      if (res.confirm) {
        store.logout()
        uToast.value?.show({ title: '已退出登录', type: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  min-height: 100vh;
  background: $bg-page;
  padding-bottom: 140rpx;
}

.not-login {
  padding: 80rpx 40rpx;
  display: flex;
  justify-content: center;
}

.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx;
}

.avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  border: 2rpx dashed $border-light;
}

.prompt-text {
  font-size: 32rpx;
  font-weight: $font-semibold;
  color: $primary;
  margin-bottom: 8rpx;
}

.prompt-desc {
  font-size: $font-sm;
  color: $text-tertiary;
}

.profile-card {
  background: $bg-card;
  margin: 24rpx;
  border-radius: $radius-lg;
  padding: 40rpx;
  box-shadow: $shadow-sm;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: $bg-page;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.profile-name {
  font-size: 36rpx;
  font-weight: $font-bold;
  color: $text-primary;
}

.profile-phone {
  font-size: $font-sm;
  color: $text-tertiary;
}

.menu-section {
  background: $bg-card;
  margin: 0 24rpx 24rpx;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  gap: 16rpx;
  border-bottom: 1rpx solid $border-light;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: $bg-page;
  }
}

.menu-text {
  flex: 1;
  font-size: $font-base;
  color: $text-primary;
}

.logout-wrap {
  padding: 24rpx;
}

.logout-btn {
  height: 88rpx;
  line-height: 88rpx;
  font-size: $font-base;
  color: #EF4444;
  background: $bg-card;
  border-radius: $radius-lg;
  border: 1rpx solid $border-light;
}
</style>
