<template>
  <view class="page">
    <view class="user-header">
      <view class="avatar-wrap">
        <u-icon name="account-fill" size="48" color="#10B981" />
      </view>
      <view class="user-info">
        <text class="user-name">竹影同学</text>
        <text class="user-desc">探索校园好店</text>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-item" @click="goTo('/pages/favorite/favorite')">
        <view class="menu-left">
          <u-icon name="heart-fill" size="20" color="#10B981" />
          <text>我的收藏</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#9CA3AF" />
      </view>
      <view class="menu-item" @click="goTo('/pages/history/history')">
        <view class="menu-left">
          <u-icon name="clock-fill" size="20" color="#10B981" />
          <text>浏览历史</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#9CA3AF" />
      </view>
      <view class="menu-item" @click="goTo('/pages/feedback/feedback')">
        <view class="menu-left">
          <u-icon name="edit-pen-fill" size="20" color="#10B981" />
          <text>意见反馈</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#9CA3AF" />
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-item" @click="contactPlatform">
        <view class="menu-left">
          <u-icon name="kefu-ermai" size="20" color="#10B981" />
          <text>联系平台</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#9CA3AF" />
      </view>
      <view class="menu-item" @click="showAbout">
        <view class="menu-left">
          <u-icon name="info-circle-fill" size="20" color="#10B981" />
          <text>关于平台</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#9CA3AF" />
      </view>
    </view>

    <view class="footer">
      <text class="footer-text">竹影校园 v1.0.0</text>
      <text class="footer-desc">校园本地生活增长平台</text>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const uToast = ref<any>(null)

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
.page {
  min-height: 100vh;
  background: #F9FAFB;
}

.user-header {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  padding: 60rpx 30rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar-wrap {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  flex: 1;
}

.user-name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.user-desc {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.menu-section {
  margin: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #F3F4F6;

  &:last-child {
    border-bottom: none;
  }
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;

  text {
    font-size: 28rpx;
    color: #1F2937;
  }
}

.footer {
  text-align: center;
  padding: 60rpx 30rpx;
}

.footer-text {
  display: block;
  font-size: 24rpx;
  color: #9CA3AF;
  margin-bottom: 8rpx;
}

.footer-desc {
  display: block;
  font-size: 20rpx;
  color: #D1D5DB;
}
</style>
