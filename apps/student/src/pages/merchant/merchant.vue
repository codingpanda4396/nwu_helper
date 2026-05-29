<template>
  <view class="page">
    <view v-if="merchant" class="merchant-detail">
      <!-- 头部大图 -->
      <view class="merchant-hero">
        <image class="hero-image" :src="merchant.image || '/static/images/banner-campus.jpg'" mode="aspectFill" />
        <view class="hero-overlay">
          <text class="merchant-name">{{ merchant.name }}</text>
          <view class="merchant-tags" v-if="merchant.tags?.length">
            <text v-for="tag in merchant.tags" :key="tag" class="tag">{{ tag }}</text>
          </view>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="info-section">
        <view class="info-item" v-if="merchant.summary">
          <u-icon name="info-circle" size="16" color="#10B981" />
          <text>{{ merchant.summary }}</text>
        </view>
        <view class="info-item" @click="openLocation">
          <u-icon name="map-fill" size="16" color="#10B981" />
          <text>{{ merchant.address }}</text>
          <u-icon name="arrow-right" size="14" color="#9CA3AF" />
        </view>
        <view class="info-item" v-if="merchant.phone" @click="callPhone">
          <u-icon name="phone-fill" size="16" color="#10B981" />
          <text>{{ merchant.phone }}</text>
          <u-icon name="arrow-right" size="14" color="#9CA3AF" />
        </view>
        <view class="info-item" v-if="merchant.businessHours">
          <u-icon name="clock-fill" size="16" color="#10B981" />
          <text>{{ merchant.businessHours }}</text>
        </view>
      </view>

      <!-- 图片画廊 -->
      <view v-if="merchant.images?.length" class="section">
        <view class="section-header">
          <text class="section-title">店铺环境</text>
        </view>
        <scroll-view scroll-x class="gallery-scroll">
          <view class="gallery-list">
            <image v-for="img in merchant.images" :key="img.id" :src="img.imageUrl" mode="aspectFill" class="gallery-image" @click="previewImage(img.imageUrl)" />
          </view>
        </scroll-view>
      </view>

      <!-- 当前活动 -->
      <view v-if="merchant.activities?.length" class="section">
        <view class="section-header">
          <text class="section-title">当前活动</text>
        </view>
        <view class="activity-list">
          <view v-for="activity in merchant.activities" :key="activity.id" class="activity-card">
            <image v-if="activity.image" class="activity-image" :src="activity.image" mode="aspectFill" />
            <view class="activity-content">
              <text class="activity-title">{{ activity.title }}</text>
              <text v-if="activity.description" class="activity-desc">{{ activity.description }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 私域引导 -->
      <view v-if="merchant.qrImage" class="section">
        <view class="private-domain">
          <view class="domain-header">
            <u-icon name="weixin-fill" size="20" color="#07C160" />
            <text class="domain-title">进群领福利</text>
          </view>
          <text class="domain-desc">扫码加入商家微信群，获取专属优惠和最新活动</text>
          <image class="qr-image" :src="merchant.qrImage" mode="aspectFit" @click="previewImage(merchant.qrImage)" />
          <text class="qr-tip">长按识别二维码</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer-bar">
      <view class="footer-btn" @click="toggleFavorite">
        <u-icon :name="isFavorite ? 'heart-fill' : 'heart'" size="20" :color="isFavorite ? '#EF4444' : '#6B7280'" />
        <text>{{ isFavorite ? '已收藏' : '收藏' }}</text>
      </view>
      <view class="footer-btn" @click="callPhone" v-if="merchant?.phone">
        <u-icon name="phone-fill" size="20" color="#10B981" />
        <text>联系</text>
      </view>
      <view class="footer-btn primary" @click="openLocation">
        <u-icon name="map-fill" size="20" color="#ffffff" />
        <text>导航到店</text>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { publicApi, trackActivity } from '@/api/index'

interface MerchantDetail {
  id: string
  name: string
  image?: string
  summary?: string
  address: string
  phone?: string
  businessHours?: string
  qrImage?: string
  tags?: string[]
  latitude?: number
  longitude?: number
  images?: { id: string; imageUrl: string }[]
  activities?: { id: string; title: string; description?: string; image?: string }[]
}

const merchant = ref<MerchantDetail | null>(null)
const isFavorite = ref(false)
const uToast = ref<any>(null)

onMounted(async () => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  const id = (page as any).options?.id
  
  if (id) {
    await fetchMerchant(id)
    checkFavorite(id)
    saveHistory(id)
    trackActivity('merchant_view', '/merchant', id)
  }
})

async function fetchMerchant(id: string) {
  try {
    const data = await publicApi<MerchantDetail>('/api/public/merchants/' + id)
    merchant.value = data
  } catch (err) {
    uToast.value.show({ title: '加载失败', type: 'error' })
  }
}

function checkFavorite(id: string) {
  const favorites = uni.getStorageSync('favorites')
  if (favorites) {
    const list = JSON.parse(favorites)
    isFavorite.value = list.some((item: any) => item.id === id)
  }
}

function saveHistory(id: string) {
  if (!merchant.value) return
  let history = []
  const saved = uni.getStorageSync('viewHistory')
  if (saved) {
    history = JSON.parse(saved)
  }
  history = history.filter((item: any) => item.id !== id)
  history.unshift({
    id: merchant.value.id,
    name: merchant.value.name,
    image: merchant.value.image,
    time: new Date().toLocaleDateString()
  })
  if (history.length > 50) history = history.slice(0, 50)
  uni.setStorageSync('viewHistory', JSON.stringify(history))
}

function toggleFavorite() {
  if (!merchant.value) return
  let favorites = []
  const saved = uni.getStorageSync('favorites')
  if (saved) {
    favorites = JSON.parse(saved)
  }
  
  if (isFavorite.value) {
    favorites = favorites.filter((item: any) => item.id !== merchant.value!.id)
    isFavorite.value = false
    uToast.value.show({ title: '已取消收藏', type: 'info' })
  } else {
    favorites.unshift({
      id: merchant.value.id,
      name: merchant.value.name,
      image: merchant.value.image,
      summary: merchant.value.summary,
      address: merchant.value.address
    })
    isFavorite.value = true
    uToast.value.show({ title: '已收藏', type: 'success' })
    trackActivity('favorite', '/merchant', merchant.value.id)
  }
  uni.setStorageSync('favorites', JSON.stringify(favorites))
}

function callPhone() {
  if (merchant.value?.phone) {
    uni.makePhoneCall({ phoneNumber: merchant.value.phone })
  }
}

function openLocation() {
  if (!merchant.value) return
  const lat = merchant.value.latitude
  const lng = merchant.value.longitude
  if (lat && lng && lat !== 0 && lng !== 0) {
    uni.openLocation({
      name: merchant.value.name,
      address: merchant.value.address,
      latitude: lat,
      longitude: lng
    })
  } else {
    uni.setClipboardData({
      data: merchant.value.address,
      success: () => {
        uToast.value.show({ title: '地址已复制', type: 'success' })
      }
    })
  }
}

function previewImage(url: string) {
  uni.previewImage({ urls: [url] })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F9FAFB;
  padding-bottom: 120rpx;
}

.merchant-hero {
  position: relative;
  height: 400rpx;
}

.hero-image {
  width: 100%;
  height: 100%;
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

.merchant-name {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.merchant-tags {
  display: flex;
  gap: 12rpx;
}

.tag {
  padding: 6rpx 16rpx;
  background: rgba(16, 185, 129, 0.8);
  border-radius: 16rpx;
  font-size: 22rpx;
  color: #ffffff;
}

.info-section {
  background: #ffffff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F3F4F6;

  &:last-child {
    border-bottom: none;
  }

  text {
    flex: 1;
    font-size: 26rpx;
    color: #1F2937;
  }
}

.section {
  padding: 0 24rpx 24rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1F2937;
}

.gallery-scroll {
  white-space: nowrap;
}

.gallery-list {
  display: inline-flex;
  gap: 16rpx;
}

.gallery-image {
  width: 240rpx;
  height: 180rpx;
  border-radius: 12rpx;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.activity-card {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.activity-image {
  width: 100%;
  height: 240rpx;
}

.activity-content {
  padding: 20rpx;
}

.activity-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 8rpx;
}

.activity-desc {
  display: block;
  font-size: 24rpx;
  color: #6B7280;
}

.private-domain {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.domain-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.domain-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1F2937;
}

.domain-desc {
  display: block;
  font-size: 24rpx;
  color: #6B7280;
  margin-bottom: 24rpx;
}

.qr-image {
  width: 300rpx;
  height: 300rpx;
  margin-bottom: 16rpx;
}

.qr-tip {
  display: block;
  font-size: 22rpx;
  color: #9CA3AF;
}

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #ffffff;
  padding: 20rpx 24rpx;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
  gap: 16rpx;
}

.footer-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 0;

  text {
    font-size: 22rpx;
    color: #6B7280;
  }

  &.primary {
    background: #10B981;
    border-radius: 44rpx;
    flex-direction: row;
    justify-content: center;
    gap: 8rpx;

    text {
      color: #ffffff;
      font-size: 28rpx;
    }
  }
}
</style>
