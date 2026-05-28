<template>
  <view class="page">
    <!-- 关于头部 -->
    <view class="about-hero">
      <image class="about-image" src="/static/images/wechat-promo.png" mode="aspectFill" />
      <view class="about-content">
        <view class="about-tag">
          <u-icon name="heart-fill" size="14" color="#FF6B35" />
          <text>西大圈</text>
        </view>
        <text class="about-title">摸摸圈圈头，万事不用愁</text>
        <text class="about-desc">我们把西大周边的吃喝玩乐、活动福利、驾校服务和生活刚需整理到一个手机入口里。</text>
      </view>
    </view>

    <!-- 信息卡片 -->
    <view class="info-section">
      <view class="info-card">
        <view class="info-item">
          <text class="info-title">找福利</text>
          <text class="info-desc">活动、团购和新品体验统一整理。</text>
        </view>
        <view class="info-item">
          <text class="info-title">找服务</text>
          <text class="info-desc">校园周边商家先筛选，再持续补充真实信息。</text>
        </view>
        <view class="info-item">
          <text class="info-title">找反馈</text>
          <text class="info-desc">好店推荐、商家合作、问题反馈都从微信入口开始。</text>
        </view>
      </view>
    </view>

    <!-- 二维码区域 -->
    <view class="qr-section">
      <view class="qr-card">
        <image class="qr-image" src="/static/images/qr-placeholder.jpg" mode="aspectFit" />
        <view class="qr-content">
          <text class="qr-title">加入西大圈微信</text>
          <text class="qr-desc">合作、反馈、活动报名和讨论区发布入口，优先在微信处理。</text>
          <u-button type="primary" size="small" @click="showWechatToast">
            <u-icon name="weixin-fill" size="14" color="#fff" />
            <text style="margin-left: 8rpx;">添加微信</text>
          </u-button>
        </view>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const uToast = ref<any>(null)

function showWechatToast() {
  uToast.value.show({
    title: '请添加西大圈微信，活动报名、反馈合作和发帖入口都会优先开放。',
    type: 'info',
    duration: 2600
  })
}
</script>

<style lang="scss" scoped>
.page {
  padding-bottom: 120rpx;
}

.about-hero {
  position: relative;
}

.about-image {
  width: 100%;
  height: 400rpx;
}

.about-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40rpx 30rpx 30rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}

.about-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  
  text {
    font-size: 24rpx;
    color: #ffffff;
  }
}

.about-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 12rpx;
}

.about-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.info-section {
  padding: 30rpx;
}

.info-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.info-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.info-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 12rpx;
}

.info-desc {
  font-size: 26rpx;
  color: #666666;
  display: block;
}

.qr-section {
  padding: 0 30rpx 30rpx;
}

.qr-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.qr-image {
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;
}

.qr-content {
  flex: 1;
}

.qr-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 12rpx;
}

.qr-desc {
  font-size: 26rpx;
  color: #666666;
  display: block;
  margin-bottom: 24rpx;
}
</style>
