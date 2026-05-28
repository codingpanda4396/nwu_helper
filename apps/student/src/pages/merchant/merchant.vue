<template>
  <view class="page">
    <!-- 返回按钮 -->
    <view class="back-bar">
      <u-button type="default" size="small" @click="goBack">
        <u-icon name="arrow-left" size="14" />
        <text style="margin-left: 8rpx;">返回</text>
      </u-button>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <text>商家信息加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view v-if="!loading && !merchant" class="error-state">
      <text>商家暂时不可查看。</text>
    </view>

    <!-- 商家详情 -->
    <view v-if="merchant" class="merchant-detail">
      <!-- 封面图 -->
      <view class="cover-section">
        <image class="cover-image" :src="coverImage" mode="aspectFill" />
        <view class="cover-overlay">
          <view class="merchant-tag">
            <text>{{ merchant.serviceId || '校园商家' }}</text>
          </view>
          <text class="merchant-name">{{ merchant.name }}</text>
          <text class="merchant-summary">{{ merchant.summary || merchant.recommendation || '西大圈推荐商家' }}</text>
        </view>
      </view>

      <!-- 距离信息 -->
      <view v-if="merchant.distance" class="distance-section">
        <view class="distance-item">
          <u-icon name="map-fill" size="14" color="#FF6B35" />
          <text>{{ merchant.distance || merchant.distanceText || '校边商圈' }}</text>
        </view>
      </view>

      <!-- 活动列表 -->
      <view v-if="activities.length > 0" class="section">
        <text class="section-title">进行中的活动</text>
        <view class="activity-list">
          <view v-for="activity in activities" :key="activity.id" class="activity-item">
            <text class="activity-title">{{ activity.title }}</text>
            <text v-if="activity.description" class="activity-desc">{{ activity.description }}</text>
          </view>
        </view>
      </view>

      <!-- 到店信息 -->
      <view class="section">
        <text class="section-title">到店信息</text>
        <view class="info-grid">
          <view class="info-item">
            <u-icon name="map-fill" size="16" color="#FF6B35" />
            <text>{{ merchant.address || '地址待补充' }}</text>
          </view>
          <view class="info-item">
            <u-icon name="phone-fill" size="16" color="#FF6B35" />
            <text>{{ merchant.phone || '电话待补充' }}</text>
          </view>
          <view class="info-item">
            <u-icon name="clock-fill" size="16" color="#FF6B35" />
            <text>{{ merchant.businessHours || '营业时间待补充' }}</text>
          </view>
        </view>
      </view>

      <!-- 二维码区域 -->
      <view class="qr-section">
        <view class="qr-card">
          <image class="qr-image" :src="qrImage" mode="aspectFit" />
          <view class="qr-content">
            <text class="qr-title">扫码联系商家</text>
            <text class="qr-desc">添加微信咨询详情、预约服务。</text>
          </view>
        </view>
      </view>

      <!-- 微信入口 -->
      <view class="wechat-section">
        <view class="wechat-card">
          <image class="wechat-image" src="/static/images/wechat-promo.png" mode="aspectFill" />
          <view class="wechat-content">
            <view class="wechat-tag">
              <u-icon name="weixin-fill" size="14" color="#07C160" />
              <text>微信入口</text>
            </view>
            <text class="wechat-title">加入西大圈微信</text>
            <text class="wechat-desc">领活动、问优惠、推荐好店、反馈问题，都从这里开始。</text>
            <u-button type="success" size="small" @click="showWechatToast">
              <u-icon name="weixin-fill" size="14" color="#fff" />
              <text style="margin-left: 8rpx;">添加微信</text>
            </u-button>
          </view>
        </view>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { publicApi } from '@/api/index'

interface Merchant {
  id: string
  name: string
  image?: string
  summary?: string
  recommendation?: string
  distance?: string
  distanceText?: string
  address?: string
  phone?: string
  businessHours?: string
  serviceId?: string
  qrImage?: string
  qrImageUrl?: string
  activities?: Activity[]
}

interface Activity {
  id: string
  title: string
  description?: string
}

const merchant = ref<Merchant | null>(null)
const loading = ref(true)
const uToast = ref<any>(null)

const coverImage = computed(() => {
  if (merchant.value?.image && /^(https?:|data:|\/api\/|\/assets\/)/.test(merchant.value.image)) {
    return merchant.value.image
  }
  return '/static/images/hero-campus-life.png'
})

const qrImage = computed(() => {
  const qr = merchant.value?.qrImage || merchant.value?.qrImageUrl
  if (qr && /^(https?:|data:|\/api\/|\/assets\/)/.test(qr)) {
    return qr
  }
  return '/static/images/qr-placeholder.jpg'
})

const activities = computed(() => {
  return Array.isArray(merchant.value?.activities) ? merchant.value!.activities : []
})

onLoad((options) => {
  if (options?.id) {
    loadMerchant(options.id)
  }
})

async function loadMerchant(id: string) {
  loading.value = true
  try {
    merchant.value = await publicApi<Merchant>(`/api/public/merchants/${encodeURIComponent(id)}`)
  } catch (err) {
    merchant.value = null
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

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
  padding-bottom: 40rpx;
}

.back-bar {
  padding: 20rpx 30rpx;
  background: #ffffff;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 100rpx 40rpx;
  
  text {
    font-size: 28rpx;
    color: #999999;
  }
}

.merchant-detail {
  background: #f5f5f5;
}

.cover-section {
  position: relative;
}

.cover-image {
  width: 100%;
  height: 400rpx;
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40rpx 30rpx 30rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}

.merchant-tag {
  display: inline-flex;
  margin-bottom: 12rpx;
  
  text {
    font-size: 22rpx;
    color: #ffffff;
    background: rgba(255, 107, 53, 0.8);
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
  }
}

.merchant-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 12rpx;
}

.merchant-summary {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.distance-section {
  padding: 20rpx 30rpx;
  background: #ffffff;
}

.distance-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  
  text {
    font-size: 26rpx;
    color: #333333;
  }
}

.section {
  padding: 30rpx;
  background: #ffffff;
  margin-top: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 20rpx;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.activity-item {
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.activity-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.activity-desc {
  font-size: 24rpx;
  color: #666666;
  display: block;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  
  text {
    font-size: 28rpx;
    color: #333333;
  }
}

.qr-section {
  padding: 30rpx;
  background: #ffffff;
  margin-top: 20rpx;
}

.qr-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 30rpx;
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
}

.wechat-section {
  padding: 30rpx;
  background: #ffffff;
  margin-top: 20rpx;
}

.wechat-card {
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.wechat-image {
  width: 100%;
  height: 300rpx;
}

.wechat-content {
  padding: 30rpx;
}

.wechat-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  
  text {
    font-size: 24rpx;
    color: #07C160;
  }
}

.wechat-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 12rpx;
}

.wechat-desc {
  font-size: 26rpx;
  color: #666666;
  display: block;
  margin-bottom: 24rpx;
}
</style>
