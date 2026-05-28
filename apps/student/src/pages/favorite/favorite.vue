<template>
  <view class="page">
    <view v-if="favorites.length === 0" class="empty-state">
      <u-icon name="heart" size="64" color="#D1D5DB" />
      <text class="empty-title">暂无收藏</text>
      <text class="empty-desc">收藏喜欢的商家，下次更快找到</text>
    </view>

    <view v-else class="favorite-list">
      <view v-for="item in favorites" :key="item.id" class="favorite-card" @click="openMerchant(item.id)">
        <image class="favorite-image" :src="item.image || '/static/images/banner-campus.jpg'" mode="aspectFill" />
        <view class="favorite-content">
          <text class="favorite-name">{{ item.name }}</text>
          <text class="favorite-desc">{{ item.summary || '' }}</text>
          <view class="favorite-meta">
            <u-icon name="map-fill" size="12" color="#9CA3AF" />
            <text>{{ item.address || '校边' }}</text>
          </view>
        </view>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface FavoriteItem {
  id: string
  name: string
  image?: string
  summary?: string
  address?: string
}

const favorites = ref<FavoriteItem[]>([])
const uToast = ref<any>(null)

onMounted(() => {
  const saved = uni.getStorageSync('favorites')
  if (saved) {
    favorites.value = JSON.parse(saved)
  }
})

function openMerchant(id: string) {
  uni.navigateTo({ url: `/pages/merchant/merchant?id=${encodeURIComponent(id)}` })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F9FAFB;
}

.empty-state {
  text-align: center;
  padding: 200rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.empty-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #1F2937;
}

.empty-desc {
  font-size: 24rpx;
  color: #9CA3AF;
}

.favorite-list {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.favorite-card {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.favorite-image {
  width: 160rpx;
  height: 160rpx;
  flex-shrink: 0;
}

.favorite-content {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.favorite-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #1F2937;
}

.favorite-desc {
  font-size: 24rpx;
  color: #6B7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.favorite-meta {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-top: auto;

  text {
    font-size: 22rpx;
    color: #9CA3AF;
  }
}
</style>
