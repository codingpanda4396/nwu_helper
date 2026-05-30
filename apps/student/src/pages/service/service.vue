<template>
  <view class="page">
    <view class="page-hero">
      <view class="hero-content">
        <view class="hero-tag">
          <u-icon name="list" size="14" color="#10B981" />
          <text>西大圈</text>
        </view>
        <text class="hero-title">驾校服务</text>
        <text class="hero-desc">校园周边驾校，一键直达</text>
      </view>
    </view>

    <view class="service-grid">
      <view class="grid-item" v-for="item in serviceCategories" :key="item.key" @click="goToService(item.key)">
        <view class="grid-icon" :style="{ background: item.bgColor }">
          <u-icon :name="item.icon" size="24" color="#10B981" />
        </view>
        <text class="grid-text">{{ item.name }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">热门驾校</text>
      </view>
      <view class="merchant-list">
        <view v-for="merchant in merchants" :key="merchant.id" class="merchant-card" @click="openMerchant(merchant)">
          <image class="merchant-image" :src="merchant.image || '/static/images/banner-campus.jpg'" mode="aspectFill" />
          <view class="merchant-content">
            <text class="merchant-name">{{ merchant.name }}</text>
            <text class="merchant-desc">{{ merchant.summary || '优质驾校' }}</text>
            <view class="merchant-meta">
              <view class="meta-item">
                <u-icon name="map-fill" size="12" color="#9CA3AF" />
                <text>{{ merchant.distance || '校边' }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-if="merchants.length === 0" class="empty-state">
          <text class="empty-title">正在招募驾校商家</text>
          <text class="empty-desc">更多驾校即将上线</text>
        </view>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { publicApi, trackActivity } from '@/api/index'
import { useAppStore } from '@/store/index'

interface Merchant {
  id: string
  name: string
  image?: string
  summary?: string
  distance?: string
  defaultChannelId?: string
}

const store = useAppStore()
const merchants = ref<Merchant[]>([])
const uToast = ref<any>(null)
const activeKey = ref('')

const serviceCategories = [
  { key: 'c1', name: '科一', icon: 'book-fill', bgColor: '#E8F5E9' },
  { key: 'c2', name: '科二', icon: 'car-fill', bgColor: '#E3F2FD' },
  { key: 'c3', name: '科三', icon: 'car-fill', bgColor: '#FFF3E0' },
  { key: 'c4', name: '科四', icon: 'book-fill', bgColor: '#FCE4EC' },
  { key: 'discount', name: '优惠', icon: 'gift-fill', bgColor: '#F3E5F5' },
  { key: 'enroll', name: '报名', icon: 'edit-pen-fill', bgColor: '#E0F2F1' },
  { key: 'review', name: '评价', icon: 'star-fill', bgColor: '#E8EAF6' },
  { key: 'more', name: '更多', icon: 'grid-fill', bgColor: '#FAFAFA' }
]

onMounted(async () => {
  trackActivity('page_view', '/driving')
  if (store.selectedServiceKey) {
    activeKey.value = store.selectedServiceKey
    store.selectedServiceKey = ''
  }
  try {
    const qs = activeKey.value ? `?serviceKey=${encodeURIComponent(activeKey.value)}` : ''
    const data = await publicApi<Merchant[]>(`/api/public/services/merchants${qs}`)
    merchants.value = data || []
    merchants.value.slice(0, 20).forEach((merchant) => {
      trackActivity('merchant_impression', '/driving', merchant.id, {
        merchantId: merchant.id,
        channelId: merchant.defaultChannelId,
        source: 'driving_list'
      })
    })
  } catch (err) {
    merchants.value = []
  }
})

function goToService(key: string) {
  if (key === 'more') return
  activeKey.value = key
}

function openMerchant(merchant: Merchant) {
  trackActivity('merchant_click', '/driving', merchant.id, {
    merchantId: merchant.id,
    channelId: merchant.defaultChannelId,
    source: 'driving_list'
  })
  const params = [`id=${encodeURIComponent(merchant.id)}`, 'source=service_list']
  if (merchant.defaultChannelId) params.push(`channelId=${encodeURIComponent(merchant.defaultChannelId)}`)
  uni.navigateTo({ url: `/pages/merchant/merchant?${params.join('&')}` })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  padding-bottom: 120rpx;
  min-height: 100vh;
  background: $bg-page;
}

.page-hero {
  background: $bg-card-soft;
  padding: 36rpx 30rpx 56rpx;
  border-bottom: 1rpx solid $border-light;
}

.hero-content {
  display: flex;
  flex-direction: column;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;

  text {
    font-size: $font-sm;
    color: $primary;
    font-weight: $font-medium;
  }
}

.hero-title {
  font-size: 40rpx;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.hero-desc {
  font-size: $font-sm;
  color: $text-secondary;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
  padding: 30rpx;
  background: $bg-card;
  margin: -28rpx 24rpx 24rpx;
  border-radius: $radius-lg;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.grid-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-text {
  font-size: $font-xs;
  color: $text-primary;
}

.section {
  padding: 0 24rpx;
}

.section-header {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: $font-base;
  font-weight: bold;
  color: $text-primary;
}

.merchant-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.merchant-card {
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
  display: flex;
  flex-direction: row;
}

.merchant-image {
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;
}

.merchant-content {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.merchant-name {
  font-size: $font-base;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.merchant-desc {
  font-size: $font-xs;
  color: $text-secondary;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.merchant-meta {
  display: flex;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;

  text {
    font-size: 22rpx;
    color: $text-tertiary;
  }
}

.empty-state {
  text-align: center;
  padding: 60rpx 40rpx;
  background: $bg-card;
  border-radius: $radius-lg;
  border: 1rpx solid $border-light;
}

.empty-title {
  font-size: $font-base;
  font-weight: bold;
  color: $text-primary;
  display: block;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: $font-sm;
  color: $text-tertiary;
  display: block;
}
</style>
