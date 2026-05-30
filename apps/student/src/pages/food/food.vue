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
      <scroll-view scroll-x class="filter-scroll" :show-scrollbar="false">
        <view class="filter-tags">
          <view v-for="cat in categories" :key="cat.key" 
            :class="['filter-tag', { 'filter-tag--active': currentCategory === cat.key }]"
            @click="selectCategory(cat.key)">
            <u-icon v-if="cat.icon" :name="cat.icon" size="14" :color="currentCategory === cat.key ? '#FFFFFF' : '#6B7280'" />
            <text>{{ cat.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 排序 -->
    <view class="sort-bar">
      <view v-for="sort in sortOptions" :key="sort.key" 
        :class="['sort-item', { 'sort-item--active': currentSort === sort.key }]"
        @click="selectSort(sort.key)">
        <text>{{ sort.name }}</text>
        <view v-if="currentSort === sort.key" class="sort-indicator" />
      </view>
    </view>

    <!-- 骨架屏 -->
    <view v-if="loading" class="merchant-list">
      <Skeleton type="merchant" :count="5" />
    </view>

    <!-- 商家列表 -->
    <view v-else class="merchant-list">
      <view v-for="(merchant, index) in merchants" :key="merchant.id" 
        :class="['merchant-card', 'tap-active', `slide-up stagger-${index + 1}`]" 
        @click="openMerchant(merchant.id)">
        <image class="merchant-image" :src="merchant.image || '/static/images/banner-campus.jpg'" mode="aspectFill" />
        <view class="merchant-content">
          <view class="merchant-header">
            <text class="merchant-name">{{ merchant.name }}</text>
            <view v-if="merchant.tags?.length" class="merchant-tags">
              <text v-for="tag in merchant.tags.slice(0, 2)" :key="tag" class="tag">{{ tag }}</text>
            </view>
          </view>
          <text class="merchant-desc">{{ merchant.summary || '优质美食商家' }}</text>
          <view class="merchant-footer">
            <view class="merchant-meta">
              <view class="meta-item">
                <u-icon name="map-fill" size="12" color="#10B981" />
                <text>{{ merchant.distance || '校边' }}</text>
              </view>
            </view>
            <view v-if="merchant.avgPrice" class="merchant-price">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ merchant.avgPrice }}</text>
              <text class="price-unit">/人</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <EmptyState 
        v-if="merchants.length === 0 && !loading" 
        icon="search"
        title="正在招募美食商家" 
        description="你推荐的宝藏店，可以通过西大圈微信告诉我们"
        action-text="去推荐"
        @action="showWechatToast"
      />
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { publicApi, trackActivity } from '@/api/index'
import Skeleton from '@/components/Skeleton.vue'
import EmptyState from '@/components/EmptyState.vue'

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
const loading = ref(true)
const currentCategory = ref('all')
const currentSort = ref('default')
const uToast = ref<any>(null)

const categories = [
  { key: 'all', name: '全部', icon: '' },
  { key: 'snack', name: '小吃', icon: 'gift-fill' },
  { key: 'meal', name: '正餐', icon: 'home-fill' },
  { key: 'tea', name: '奶茶', icon: 'water-fill' },
  { key: 'night', name: '夜宵', icon: 'moon-fill' }
]

const sortOptions = [
  { key: 'default', name: '推荐' },
  { key: 'distance', name: '距离' },
  { key: 'hot', name: '热度' },
  { key: 'price', name: '价格' }
]

onMounted(async () => {
  trackActivity('page_view', '/food')
  await fetchMerchants()
})

async function fetchMerchants() {
  loading.value = true
  try {
    const params: string[] = []
    if (currentCategory.value && currentCategory.value !== 'all') {
      params.push(`tag=${currentCategory.value}`)
    }
    if (currentSort.value && currentSort.value !== 'default') {
      params.push(`sort=${currentSort.value}`)
    }
    const qs = params.length ? `?${params.join('&')}` : ''
    const data = await publicApi<Merchant[]>(`/api/public/food/merchants${qs}`)
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

function showWechatToast() {
  uToast.value.show({
    title: '请添加西大圈微信',
    type: 'info'
  })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  padding-bottom: 120rpx;
  background: $bg-page;
  min-height: 100vh;
}

/* ========== 搜索栏 ========== */
.search-header {
  background: $primary-gradient;
  padding: $space-4 $space-6;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: $space-3;
  background: rgba(255, 255, 255, 0.95);
  border-radius: $radius-full;
  padding: $space-3 $space-5;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.search-placeholder {
  font-size: $font-sm;
  color: $text-placeholder;
}

/* ========== 分类筛选 ========== */
.filter-bar {
  background: $bg-card;
  padding: $space-4 0;
  border-bottom: 1rpx solid $border-light;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-tags {
  display: inline-flex;
  gap: $space-3;
  padding: 0 $space-5;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  padding: $space-2 $space-4;
  background: $bg-page;
  border-radius: $radius-full;
  font-size: $font-sm;
  color: $text-secondary;
  transition: all $transition-base;

  &--active {
    background: $primary-gradient;
    color: $text-inverse;
    box-shadow: $shadow-primary;
  }

  &:active {
    transform: scale(0.95);
  }
}

/* ========== 排序栏 ========== */
.sort-bar {
  display: flex;
  background: $bg-card;
  padding: $space-3 $space-5;
  border-bottom: 1rpx solid $border-light;
}

.sort-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
  font-size: $font-sm;
  color: $text-secondary;
  padding: $space-2 0;
  position: relative;
  transition: all $transition-base;

  &--active {
    color: $primary;
    font-weight: $font-semibold;
  }
}

.sort-indicator {
  width: 32rpx;
  height: 4rpx;
  background: $primary-gradient;
  border-radius: $radius-full;
}

/* ========== 商家列表 ========== */
.merchant-list {
  padding: $space-4 $space-5;
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.merchant-card {
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-md;
  display: flex;
  flex-direction: row;
  transition: all $transition-base;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-sm;
  }
}

.merchant-image {
  width: 220rpx;
  height: 220rpx;
  flex-shrink: 0;
}

.merchant-content {
  flex: 1;
  padding: $space-4 $space-5;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.merchant-header {
  display: flex;
  align-items: center;
  gap: $space-3;
  margin-bottom: $space-2;
}

.merchant-name {
  font-size: $font-base;
  font-weight: $font-bold;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.merchant-tags {
  display: flex;
  gap: $space-2;
  flex-shrink: 0;
}

.tag {
  padding: $space-1 $space-2;
  background: $primary-bg;
  border-radius: $radius-sm;
  font-size: $font-xs;
  color: $primary;
  font-weight: $font-medium;
}

.merchant-desc {
  font-size: $font-xs;
  color: $text-secondary;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: $space-3;
  line-height: 1.5;
}

.merchant-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.merchant-meta {
  display: flex;
  align-items: center;
  gap: $space-4;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: $space-1;

  text {
    font-size: $font-xs;
    color: $text-tertiary;
  }
}

.merchant-price {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
}

.price-symbol {
  font-size: $font-xs;
  color: $error;
  font-weight: $font-medium;
}

.price-value {
  font-size: $font-base;
  color: $error;
  font-weight: $font-bold;
}

.price-unit {
  font-size: $font-xs;
  color: $text-tertiary;
}
</style>
