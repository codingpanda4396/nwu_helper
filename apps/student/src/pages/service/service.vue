<template>
  <view class="page">
    <view class="page-hero">
      <view class="hero-content">
        <view class="hero-tag">
          <u-icon name="list" size="14" color="#10B981" />
          <text>西大圈</text>
        </view>
        <text class="hero-title">生活服务</text>
        <text class="hero-desc">校园周边生活服务，一键直达</text>
      </view>
    </view>

    <Skeleton v-if="loading" type="grid" />

    <view v-if="!loading && categories.length > 0" class="service-grid">
      <view class="grid-item tap-active" v-for="item in categories" :key="item.key" @click="goToService(item.key)">
        <view class="grid-icon">
          <image class="grid-icon__img" :src="getServiceIcon(item.key)" mode="aspectFit" />
        </view>
        <text class="grid-text">{{ item.name }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <view class="section-header__left">
          <text class="section-title">生活服务商家</text>
          <text v-if="activeCategory" class="section-desc">{{ activeCategory }}</text>
        </view>
        <view v-if="activeKey" class="section-header__clear tap-active" @click="clearFilter">
          <text>全部</text>
        </view>
      </view>

      <Skeleton v-if="loading" type="list" :count="3" />

      <view v-else-if="merchants.length > 0" class="merchant-list">
        <view v-for="merchant in merchants" :key="merchant.id" class="merchant-card tap-active" @click="openMerchant(merchant)">
          <image class="merchant-image" :src="merchant.image || '/static/images/banner-campus.jpg'" mode="aspectFill" />
          <view class="merchant-content">
            <text class="merchant-name">{{ merchant.name }}</text>
            <text class="merchant-desc">{{ merchant.summary || '优质商家' }}</text>
            <view class="merchant-meta">
              <view class="meta-item">
                <u-icon name="map-fill" size="12" color="#9CA3AF" />
                <text>{{ merchant.distance || '校边' }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <EmptyState
        v-else
        icon="shop"
        title="暂无生活服务商家"
        description="更多商家即将上线"
        size="small"
      />
    </view>

    <u-toast ref="uToast" />
    <CustomTabbar />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { publicApi, trackActivity } from '@/api/index'
import { useAppStore } from '@/store/index'
import Skeleton from '@/components/Skeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import CustomTabbar from '@/components/CustomTabbar.vue'

interface ServiceCategory {
  id: string
  name: string
  key: string
  icon?: string
}

interface Merchant {
  id: string
  name: string
  image?: string
  summary?: string
  distance?: string
  defaultChannelId?: string
}

const store = useAppStore()
const categories = ref<ServiceCategory[]>([])
const merchants = ref<Merchant[]>([])
const activeKey = ref('')
const loading = ref(true)
const uToast = ref<any>(null)

const serviceIconMap: Record<string, string> = {
  print: '/static/icons/print.svg',
  wash: '/static/icons/wash.svg',
  entertainment: '/static/icons/entertainment.svg',
  female: '/static/icons/heart.svg',
  rent: '/static/icons/home.svg',
  parttime: '/static/icons/bag.svg'
}

function getServiceIcon(key: string): string {
  return serviceIconMap[key] || '/static/icons/service.svg'
}

const activeCategory = computed(() => {
  if (!activeKey.value) return ''
  const cat = categories.value.find(c => c.key === activeKey.value)
  return cat ? cat.name : ''
})

onMounted(async () => {
  trackActivity('page_view', '/service')

  if (store.selectedServiceKey) {
    activeKey.value = store.selectedServiceKey
    store.selectedServiceKey = ''
  }

  try {
    const cats = await publicApi<ServiceCategory[]>('/api/public/services/categories')
    categories.value = cats || []
  } catch (err) {
    categories.value = []
  }

  await loadMerchants()
  loading.value = false
})

async function loadMerchants() {
  try {
    const qs = activeKey.value ? `?serviceKey=${encodeURIComponent(activeKey.value)}` : ''
    const data = await publicApi<Merchant[]>(`/api/public/services/merchants${qs}`)
    merchants.value = data || []
    merchants.value.slice(0, 20).forEach((merchant) => {
      trackActivity('merchant_impression', '/service', merchant.id, {
        merchantId: merchant.id,
        channelId: merchant.defaultChannelId,
        source: 'service_list'
      })
    })
  } catch (err) {
    merchants.value = []
  }
}

async function goToService(key: string) {
  activeKey.value = key
  loading.value = true
  await loadMerchants()
  loading.value = false
}

function clearFilter() {
  activeKey.value = ''
  loading.value = true
  loadMerchants().finally(() => { loading.value = false })
}

function openMerchant(merchant: Merchant) {
  trackActivity('merchant_click', '/service', merchant.id, {
    merchantId: merchant.id,
    channelId: merchant.defaultChannelId,
    source: 'service_list'
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
  background: $primary-bg;

  &__img {
    width: 40rpx;
    height: 40rpx;
  }
}

.grid-text {
  font-size: $font-xs;
  color: $text-primary;
}

.section {
  padding: 0 24rpx;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24rpx;

  &__left {
    display: flex;
    flex-direction: column;
  }

  &__clear {
    text {
      font-size: $font-sm;
      color: $primary;
    }
  }
}

.section-title {
  font-size: $font-base;
  font-weight: bold;
  color: $text-primary;
}

.section-desc {
  font-size: $font-xs;
  color: $text-tertiary;
  margin-top: 4rpx;
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
</style>
