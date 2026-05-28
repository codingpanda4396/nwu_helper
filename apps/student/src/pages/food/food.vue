<template>
  <view class="page">
    <!-- 页面头部 -->
    <view class="page-hero">
      <view class="hero-content">
        <view class="hero-tag">
          <u-icon name="list" size="14" color="#FF6B35" />
          <text>西大圈</text>
        </view>
        <text class="hero-title">今天吃什么</text>
        <text class="hero-desc">按分类找附近好吃的，距离一眼扫完。</text>
      </view>
    </view>

    <!-- 错误提示 -->
    <view v-if="error" class="error-tip">{{ error }}</view>

    <!-- 商家列表 -->
    <view class="merchant-list">
      <view v-for="merchant in merchants" :key="merchant.id" class="merchant-card" @click="openMerchant(merchant.id)">
        <image class="merchant-image" :src="merchant.image || '/static/images/banner-campus.jpg'" mode="aspectFill" />
        <view class="merchant-content">
          <view class="merchant-header">
            <text class="merchant-name">{{ merchant.name }}</text>
          </view>
          <text class="merchant-desc">{{ merchant.summary || merchant.recommendation || '西大圈推荐商家' }}</text>
          <view class="merchant-meta">
            <view class="meta-item">
              <u-icon name="map-fill" size="12" color="#999" />
              <text>{{ merchant.distance || merchant.distanceText || '校边' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="merchants.length === 0 && !error" class="empty-state">
        <text class="empty-title">正在招募美食商家</text>
        <text class="empty-desc">你推荐的宝藏店，可以通过西大圈微信告诉我们。</text>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { publicApi } from '@/api/index'

interface Merchant {
  id: string
  name: string
  image?: string
  summary?: string
  recommendation?: string
  distance?: string
  distanceText?: string
  category?: string
}

const merchants = ref<Merchant[]>([])
const error = ref('')
const uToast = ref<any>(null)

const mockMerchants: Merchant[] = [
  {
    id: 'mock-bbq',
    category: 'food',
    name: '北门阿强烧烤',
    image: '/static/images/merchant-food-001.jpg',
    distance: '北门步行6分钟',
    recommendation: '宿舍夜宵局常选，烤串出餐快。'
  }
]

onMounted(async () => {
  try {
    const data = await publicApi<Merchant[]>('/api/public/food/merchants')
    merchants.value = data || []
  } catch (err) {
    merchants.value = mockMerchants
    error.value = '当前使用本地试点数据。'
  }
})

function openMerchant(id: string) {
  uni.navigateTo({ url: `/pages/merchant/merchant?id=${encodeURIComponent(id)}` })
}
</script>

<style lang="scss" scoped>
.page {
  padding-bottom: 120rpx;
}

.page-hero {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%);
  padding: 40rpx 30rpx;
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
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.hero-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.hero-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.error-tip {
  font-size: 24rpx;
  color: #ff6b6b;
  padding: 20rpx 30rpx;
  background: #fff3f3;
}

.merchant-list {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.merchant-card {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
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

.merchant-header {
  margin-bottom: 12rpx;
}

.merchant-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.merchant-desc {
  font-size: 24rpx;
  color: #666666;
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
    color: #999999;
  }
}

.empty-state {
  text-align: center;
  padding: 60rpx 40rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.empty-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999999;
  display: block;
}
</style>
