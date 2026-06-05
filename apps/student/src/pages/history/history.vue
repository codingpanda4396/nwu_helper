<template>
  <view class="page">
    <view v-if="history.length === 0" class="empty-state">
      <u-icon name="clock" size="64" color="#D1D5DB" />
      <text class="empty-title">暂无浏览记录</text>
      <text class="empty-desc">去看看附近的好店吧</text>
    </view>

    <view v-else class="history-list">
      <view class="action-bar">
        <text class="action-text">共 {{ history.length }} 条记录</text>
        <text class="action-clear" @click="clearHistory">清空</text>
      </view>
      <view v-for="item in history" :key="item.id" class="history-card" @click="openMerchant(item.id)">
        <image class="history-image" :src="item.image || '/static/images/banner-campus.jpg'" mode="aspectFill" />
        <view class="history-content">
          <text class="history-name">{{ item.name }}</text>
          <text class="history-time">{{ item.time }}</text>
        </view>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userApi, userWrite } from '@/api/index'

interface HistoryItem {
  id: string
  name: string
  image?: string
  time: string
}

const history = ref<HistoryItem[]>([])
const loading = ref(true)
const uToast = ref<any>(null)

onMounted(async () => {
  try {
    const data = await userApi<any[]>('/api/user/history')
    history.value = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      time: item.viewedAt ? formatTime(item.viewedAt) : ''
    }))
  } catch (e) {
    const saved = uni.getStorageSync('viewHistory')
    if (saved) {
      history.value = JSON.parse(saved)
    }
  } finally {
    loading.value = false
  }
})

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function openMerchant(id: string) {
  uni.navigateTo({ url: `/pages/merchant/merchant?id=${encodeURIComponent(id)}` })
}

async function clearHistory() {
  uni.showModal({
    title: '提示',
    content: '确定清空浏览历史？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await userWrite('/api/user/history', {}, 'DELETE')
        } catch (e) { /* ignore */ }
        history.value = []
        uni.removeStorageSync('viewHistory')
        uToast.value?.show({ title: '已清空', type: 'success' })
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

.history-list {
  padding: 24rpx;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.action-text {
  font-size: 24rpx;
  color: $text-tertiary;
}

.action-clear {
  font-size: 24rpx;
  color: #EF4444;
}

.history-card {
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  margin-bottom: 16rpx;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
}

.history-image {
  width: 140rpx;
  height: 140rpx;
  flex-shrink: 0;
}

.history-content {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.history-name {
  font-size: 28rpx;
  font-weight: bold;
  color: $text-primary;
}

.history-time {
  font-size: 22rpx;
  color: $text-tertiary;
}
</style>
