<template>
  <view class="page">
    <!-- 驾校介绍 -->
    <view class="driving-hero">
      <image class="driving-image" src="/static/images/driving-school.jpg" mode="aspectFill" />
      <view class="driving-content">
        <view class="driving-tag">
          <u-icon name="car-fill" size="14" color="#FF6B35" />
          <text>西大圈严选驾校</text>
        </view>
        <text class="driving-title">课少也能稳稳学车</text>
        <text class="driving-desc">就近练车、灵活约课、流程透明，适合西大学生从报名到拿证一路跟进。</text>
      </view>
    </view>

    <!-- 信息卡片 -->
    <view class="info-section">
      <view class="info-card">
        <view class="info-item">
          <text class="info-title">练车环境</text>
          <text class="info-desc">标准场地、路线清晰，训练节奏适合学生时间。</text>
        </view>
        <view class="info-item">
          <text class="info-title">模式优点</text>
          <text class="info-desc">小班沟通、预约灵活、费用明细提前确认。</text>
        </view>
        <view class="info-item">
          <text class="info-title">报名流程</text>
          <text class="info-desc">微信咨询、确认班型、提交资料、安排体检与练车。</text>
        </view>
      </view>
    </view>

    <!-- 二维码区域 -->
    <view class="qr-section">
      <view class="qr-card">
        <image class="qr-image" src="/static/images/qr-placeholder.jpg" mode="aspectFit" />
        <view class="qr-content">
          <text class="qr-title">扫码咨询班型</text>
          <text class="qr-desc">报名优惠、练车时间和接送安排，以西大圈微信咨询为准。</text>
          <u-button type="primary" size="small" @click="showWechatToast">
            <u-icon name="phone-fill" size="14" color="#fff" />
            <text style="margin-left: 8rpx;">联系西大圈</text>
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
    title: '请添加西大圈微信，咨询驾校详情。',
    type: 'info',
    duration: 2600
  })
}
</script>

<style lang="scss" scoped>
.page {
  padding-bottom: 120rpx;
}

.driving-hero {
  position: relative;
}

.driving-image {
  width: 100%;
  height: 400rpx;
}

.driving-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40rpx 30rpx 30rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}

.driving-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  
  text {
    font-size: 24rpx;
    color: #ffffff;
  }
}

.driving-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 12rpx;
}

.driving-desc {
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
