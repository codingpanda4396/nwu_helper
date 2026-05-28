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

interface HistoryItem {
  id: string
  name: string
  image?: string
  time: string
}

const history = ref<HistoryItem[]>([])
const uToast = ref<any>(null)

onMounted(() => {
  const saved = uni.getStorageSync('viewHistory')
  if (saved) {
    history.value = JSON.parse(saved)
  }
})

function openMerchant(id: string) {
  uni.navigateTo({ url: `/pages/merchant/merchant?id=${encodeURIComponent(id)}` })
}

function clearHistory() {
  uni.showModal({
    title: '提示',
    content: '确定清空浏览历史？',
    success: (res) => {
      if (res.confirm) {
        history.value = []
        uni.removeStorageSync('viewHistory')
        uToast.value.show({ title: '已清空', type: 'success' })
      }
    }
  })
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
  color: #9CA3AF;
}

.action-clear {
  font-size: 24rpx;
  color: #EF4444;
}

.history-card {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
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
  color: #1F2937;
}

.history-time {
  font-size: 22rpx;
  color: #9CA3AF;
}
</style>
