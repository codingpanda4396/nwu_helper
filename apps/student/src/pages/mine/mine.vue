<template>
  <view class="page">
    <!-- 未登录 -->
    <view v-if="!store.isLogin" class="not-login">
      <view class="login-prompt">
        <view class="avatar-placeholder">
          <u-icon name="account" size="48" color="#9AA1AA" />
        </view>
        <text class="prompt-text">点击登录</text>
        <text class="prompt-desc">登录后同步收藏和历史记录</text>
        <view class="login-btn tap-active" @click="goLogin">
          <text>点击登录</text>
        </view>
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
          <view class="profile-edit tap-active" @click="editProfile">
            <u-icon name="edit-pen" size="16" color="#9AA1AA" />
            <text>编辑资料</text>
          </view>
        </view>
      </view>

      <view class="quick-grid">
        <view class="quick-item tap-active" @click="goFavorite">
          <view class="quick-item__icon quick-item__icon--favorite">
            <u-icon name="heart-fill" size="24" color="#16A873" />
          </view>
          <text class="quick-item__label">我的收藏</text>
        </view>
        <view class="quick-item tap-active" @click="goHistory">
          <view class="quick-item__icon quick-item__icon--history">
            <u-icon name="clock-fill" size="24" color="#4F8EDB" />
          </view>
          <text class="quick-item__label">浏览历史</text>
        </view>
        <view class="quick-item tap-active" @click="goFeedback">
          <view class="quick-item__icon quick-item__icon--feedback">
            <u-icon name="edit-pen-fill" size="24" color="#8B5CF6" />
          </view>
          <text class="quick-item__label">意见反馈</text>
        </view>
      </view>

      <view class="menu-section">
        <view class="menu-item" @click="goAbout">
          <u-icon name="info-circle" size="22" color="#656B73" />
          <text class="menu-text">关于西大圈</text>
          <u-icon name="arrow-right" size="16" color="#9AA1AA" />
        </view>
        <view class="menu-item menu-item--danger" @click="handleLogout">
          <u-icon name="close-circle" size="22" color="#EF5B67" />
          <text class="menu-text menu-text--danger">退出登录</text>
          <u-icon name="arrow-right" size="16" color="#9AA1AA" />
        </view>
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

function editProfile() {
  uToast.value?.show({ title: '敬请期待', type: 'info' })
}

function goAbout() {
  uToast.value?.show({ title: '敬请期待', type: 'info' })
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
  margin-bottom: $space-8;
}

.login-btn {
  background: $primary-gradient;
  border-radius: $radius-full;
  padding: $space-4 $space-12;
  box-shadow: $shadow-primary;

  text {
    font-size: $font-base;
    color: $text-inverse;
    font-weight: $font-semibold;
  }

  &:active {
    opacity: 0.85;
  }
}

.profile-card {
  background: $primary-gradient-light;
  margin: $space-6;
  border-radius: $radius-lg;
  padding: $space-8;
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
  border: 3rpx solid $primary;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
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

.profile-edit {
  display: flex;
  align-items: center;
  gap: $space-2;
  padding: $space-2 $space-4;
  border-radius: $radius-full;
  border: 1rpx solid $border;

  text {
    font-size: $font-xs;
    color: $text-tertiary;
  }

  &:active {
    background: $bg-page;
  }
}

.quick-grid {
  display: flex;
  gap: $space-4;
  padding: 0 $space-6 $space-6;
}

.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-3;
  padding: $space-6 $space-4;
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  border: 1rpx solid $border-light;

  &:active {
    background: $bg-page;
  }

  &__icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;

    &--favorite {
      background: rgba(22, 168, 115, 0.10);
    }

    &--history {
      background: rgba(79, 142, 219, 0.10);
    }

    &--feedback {
      background: rgba(139, 92, 246, 0.10);
    }
  }

  &__label {
    font-size: $font-xs;
    color: $text-secondary;
  }
}

.menu-section {
  background: $bg-card;
  margin: 0 $space-6 $space-6;
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

  &--danger {
    .menu-text--danger {
      color: $error;
    }
  }
}

.menu-text {
  flex: 1;
  font-size: $font-base;
  color: $text-primary;

  &--danger {
    color: $error;
  }
}
</style>
