<template>
  <view class="page">
    <!-- 搜索栏 -->
    <SearchHeader placeholder="搜美食" @click="goSearch" />

    <!-- 分类筛选 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll" :show-scrollbar="false">
        <view class="filter-tags">
          <view v-for="cat in categories" :key="cat.key" 
            :class="['filter-tag', { 'filter-tag--active': currentCategory === cat.key }]"
            @click="selectCategory(cat.key)">
            <u-icon v-if="cat.icon" :name="cat.icon" size="14" :color="currentCategory === cat.key ? '#16A873' : '#656B73'" />
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
      <view v-for="(merchant, index) in merchants" :key="merchant.id" :class="`slide-up stagger-${index + 1}`">
          <MerchantCard :merchant="merchant" @click="openMerchant(merchant)" />
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
    <CustomTabbar />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { publicApi, trackActivity } from '@/api/index'
import Skeleton from '@/components/Skeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import CustomTabbar from '@/components/CustomTabbar.vue'
import SearchHeader from '@/components/SearchHeader.vue'
import MerchantCard from '@/components/MerchantCard.vue'

interface Merchant {
  id: string
  name: string
  image?: string
  summary?: string
  distance?: string
  avgPrice?: number
  tags?: string[]
  defaultChannelId?: string
}

const merchants = ref<Merchant[]>([])
const loading = ref(true)
const currentCategory = ref('all')
const currentSort = ref('default')
const uToast = ref<any>(null)

const categories = [
  { key: 'all', name: '全部', icon: '' },
  { key: 'snack', name: '小吃', icon: 'star-fill' },
  { key: 'meal', name: '正餐', icon: 'list' },
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
    merchants.value.slice(0, 20).forEach((merchant) => {
      trackActivity('merchant_impression', '/food', merchant.id, {
        merchantId: merchant.id,
        channelId: merchant.defaultChannelId,
        source: 'food_list',
        scene: currentCategory.value
      })
    })
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

function openMerchant(merchant: Merchant) {
  trackActivity('merchant_click', '/food', merchant.id, {
    merchantId: merchant.id,
    channelId: merchant.defaultChannelId,
    source: 'food_list',
    scene: currentCategory.value
  })
  const params = [`id=${encodeURIComponent(merchant.id)}`, 'source=food_list']
  if (merchant.defaultChannelId) params.push(`channelId=${encodeURIComponent(merchant.defaultChannelId)}`)
  uni.navigateTo({ url: `/pages/merchant/merchant?${params.join('&')}` })
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

/* ========== 分类筛选 ========== */
.filter-bar {
  background: $bg-card-soft;
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
    background: $primary-bg;
    color: $primary;
    border-color: rgba(22, 168, 115, 0.24);
  }

  &:active {
    transform: scale(0.95);
  }
}

/* ========== 排序栏 ========== */
.sort-bar {
  display: flex;
  background: $bg-card-soft;
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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-4;
}
</style>
