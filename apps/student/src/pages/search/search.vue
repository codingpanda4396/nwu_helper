<template>
  <view class="page">
    <view class="search-header">
      <view class="search-bar">
        <u-icon name="search" size="18" color="#9CA3AF" />
        <input class="search-input" v-model="keyword" placeholder="搜美食、驾校、活动" @confirm="doSearch" />
        <text class="search-btn" @click="doSearch">搜索</text>
      </view>
    </view>

    <view v-if="!searched" class="search-tips">
      <view class="tip-section">
        <text class="tip-title">热门搜索</text>
        <view class="tip-tags">
          <text class="tip-tag" v-for="tag in hotTags" :key="tag" @click="searchTag(tag)">{{ tag }}</text>
        </view>
      </view>
    </view>

    <view v-else class="search-results">
      <view v-if="results.length === 0" class="empty-state">
        <u-icon name="search" size="48" color="#D1D5DB" />
        <text class="empty-title">未找到相关结果</text>
        <text class="empty-desc">换个关键词试试</text>
      </view>
      <view v-else class="result-list">
        <view v-for="item in results" :key="item.id" class="result-card" @click="openMerchant(item.id)">
          <image class="result-image" :src="item.image || '/static/images/banner-campus.jpg'" mode="aspectFill" />
          <view class="result-content">
            <text class="result-name">{{ item.name }}</text>
            <text class="result-desc">{{ item.summary || '' }}</text>
            <text class="result-address">{{ item.address || '' }}</text>
          </view>
        </view>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { publicApi } from '@/api/index'

interface Merchant {
  id: string
  name: string
  image?: string
  summary?: string
  address?: string
}

const keyword = ref('')
const searched = ref(false)
const results = ref<Merchant[]>([])
const uToast = ref<any>(null)

const hotTags = ['美食', '奶茶', '烧烤', '驾校', '打印', '娱乐']

async function doSearch() {
  if (!keyword.value.trim()) return
  try {
    const data = await publicApi<{ items: Merchant[] }>('/api/public/merchants?keyword=' + encodeURIComponent(keyword.value))
    results.value = data.items || []
    searched.value = true
  } catch (err) {
    results.value = []
    searched.value = true
  }
}

function searchTag(tag: string) {
  keyword.value = tag
  doSearch()
}

function openMerchant(id: string) {
  uni.navigateTo({ url: `/pages/merchant/merchant?id=${encodeURIComponent(id)}` })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F9FAFB;
}

.search-header {
  background: #ffffff;
  padding: 20rpx 24rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #F3F4F6;
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #1F2937;
}

.search-btn {
  font-size: 28rpx;
  color: #10B981;
  font-weight: 500;
}

.search-tips {
  padding: 30rpx;
}

.tip-section {
  margin-bottom: 40rpx;
}

.tip-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 20rpx;
}

.tip-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tip-tag {
  padding: 12rpx 24rpx;
  background: #ffffff;
  border-radius: 32rpx;
  font-size: 24rpx;
  color: #6B7280;
}

.search-results {
  padding: 24rpx;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.result-card {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.result-image {
  width: 160rpx;
  height: 160rpx;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.result-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #1F2937;
}

.result-desc {
  font-size: 24rpx;
  color: #6B7280;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-address {
  font-size: 22rpx;
  color: #9CA3AF;
}

.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
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
</style>
