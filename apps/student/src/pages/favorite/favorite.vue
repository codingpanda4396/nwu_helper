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
            <u-icon name="map-fill" size="12" color="#9AA1AA" />
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
import { userApi } from '@/api/index'
import { useAppStore } from '@/store/index'

interface FavoriteItem {
  id: string
  name: string
  image?: string
  summary?: string
  address?: string
}

const store = useAppStore()
const favorites = ref<FavoriteItem[]>([])
const loading = ref(true)
const uToast = ref<any>(null)

onMounted(async () => {
  if (!store.isLogin) {
    loading.value = false
    return
  }
  try {
    const data = await userApi<FavoriteItem[]>('/api/user/favorites')
    favorites.value = data
  } catch (e) {
    // fallback to localStorage
    const saved = uni.getStorageSync('favorites')
    if (saved) {
      favorites.value = JSON.parse(saved)
    }
  } finally {
    loading.value = false
  }
})

function openMerchant(id: string) {
  uni.navigateTo({ url: `/pages/merchant/merchant?id=${encodeURIComponent(id)}` })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  min-height: 100vh;
  background: $bg-page;
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
  font-size: $font-base;
  font-weight: bold;
  color: $text-primary;
}

.empty-desc {
  font-size: $font-sm;
  color: $text-tertiary;
}

.favorite-list {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.favorite-card {
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
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
  font-size: $font-base;
  font-weight: bold;
  color: $text-primary;
}

.favorite-desc {
  font-size: $font-xs;
  color: $text-secondary;
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
    color: $text-tertiary;
  }
}
</style>
