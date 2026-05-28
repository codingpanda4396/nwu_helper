<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-header" @click="goSearch">
      <view class="search-bar">
        <u-icon name="search" size="18" color="#9CA3AF" />
        <text class="search-placeholder">搜美食</text>
      </view>
    </view>

    <!-- 分类筛选 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-tags">
          <text v-for="cat in categories" :key="cat.key" 
            :class="['filter-tag', { active: currentCategory === cat.key }]"
            @click="selectCategory(cat.key)">
            {{ cat.name }}
          </text>
        </view>
      </scroll-view>
    </view>

    <!-- 排序 -->
    <view class="sort-bar">
      <view v-for="sort in sortOptions" :key="sort.key" 
        :class="['sort-item', { active: currentSort === sort.key }]"
        @click="selectSort(sort.key)">
        <text>{{ sort.name }}</text>
      </view>
    </view>

    <!-- 商家列表 -->
    <view class="merchant-list">
      <view v-for="merchant in merchants" :key="merchant.id" class="merchant-card" @click="openMerchant(merchant.id)">
        <image class="merchant-image" :src="merchant.image || '/static/images/banner-campus.jpg'" mode="aspectFill" />
        <view class="merchant-content">
          <view class="merchant-header">
            <text class="merchant-name">{{ merchant.name }}</text>
            <view v-if="merchant.tags?.length" class="merchant-tags">
              <text v-for="tag in merchant.tags.slice(0, 2)" :key="tag" class="tag">{{ tag }}</text>
            </view>
          </view>
          <text class="merchant-desc">{{ merchant.summary || '优质美食商家' }}</text>
          <view class="merchant-meta">
            <view class="meta-item">
              <u-icon name="map-fill" size="12" color="#9CA3AF" />
              <text>{{ merchant.distance || '校边' }}</text>
            </view>
            <view v-if="merchant.avgPrice" class="meta-item">
              <text class="price">¥{{ merchant.avgPrice }}/人</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="merchants.length === 0 && !loading" class="empty-state">
        <text class="empty-title">正在招募美食商家</text>
        <text class="empty-desc">你推荐的宝藏店，可以通过竹影校园微信告诉我们。</text>
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
  distance?: string
  avgPrice?: number
  tags?: string[]
}

const merchants = ref<Merchant[]>([])
const loading = ref(false)
const currentCategory = ref('all')
const currentSort = ref('default')
const uToast = ref<any>(null)

const categories = [
  { key: 'all', name: '全部' },
  { key: 'snack', name: '小吃' },
  { key: 'meal', name: '正餐' },
  { key: 'tea', name: '奶茶' },
  { key: 'night', name: '夜宵' }
]

const sortOptions = [
  { key: 'default', name: '默认' },
  { key: 'distance', name: '距离' },
  { key: 'hot', name: '热度' }
]

onMounted(async () => {
  await fetchMerchants()
})

async function fetchMerchants() {
  loading.value = true
  try {
    const data = await publicApi<Merchant[]>('/api/public/food/merchants')
    merchants.value = data || []
  } catch (err) {
    merchants.value = []
  } finally {
    loading.value = false
  }
}

function selectCategory(key: string) {
  currentCategory.value = key
  fetchMerchants()
}

function selectSort(key: string) {
  currentSort.value = key
  fetchMerchants()
}

function goSearch() {
  uni.navigateTo({ url: '/pages/search/search' })
}

function openMerchant(id: string) {
  uni.navigateTo({ url: `/pages/merchant/merchant?id=${encodeURIComponent(id)}` })
}
</script>

<style lang="scss" scoped>
.page {
  padding-bottom: 120rpx;
  background: #F9FAFB;
}

.search-header {
  background: #10B981;
  padding: 20rpx 24rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
}

.search-placeholder {
  font-size: 26rpx;
  color: #9CA3AF;
}

.filter-bar {
  background: #ffffff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F3F4F6;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-tags {
  display: inline-flex;
  gap: 16rpx;
  padding: 0 24rpx;
}

.filter-tag {
  padding: 12rpx 24rpx;
  background: #F3F4F6;
  border-radius: 32rpx;
  font-size: 24rpx;
  color: #6B7280;
  display: inline-block;

  &.active {
    background: #D1FAE5;
    color: #10B981;
  }
}

.sort-bar {
  display: flex;
  background: #ffffff;
  padding: 16rpx 24rpx;
  border-bottom: 1rpx solid #F3F4F6;
}

.sort-item {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #6B7280;
  padding: 8rpx 0;

  &.active {
    color: #10B981;
    font-weight: 500;
  }
}

.merchant-list {
  padding: 24rpx;
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
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.merchant-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #1F2937;
}

.merchant-tags {
  display: flex;
  gap: 8rpx;
}

.tag {
  padding: 4rpx 12rpx;
  background: #D1FAE5;
  border-radius: 8rpx;
  font-size: 20rpx;
  color: #10B981;
}

.merchant-desc {
  font-size: 24rpx;
  color: #6B7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.merchant-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;

  text {
    font-size: 22rpx;
    color: #9CA3AF;
  }
}

.price {
  color: #EF4444 !important;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60rpx 40rpx;
  background: #ffffff;
  border-radius: 16rpx;
}

.empty-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #1F2937;
  display: block;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #9CA3AF;
  display: block;
}
</style>
