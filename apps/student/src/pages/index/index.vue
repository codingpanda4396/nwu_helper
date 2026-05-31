<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-header" @click="goSearch">
      <view class="search-header__inner">
        <view class="search-bar">
          <u-icon name="search" size="18" color="#9CA3AF" />
          <text class="search-placeholder">搜美食、驾校、活动</text>
        </view>
        <view class="search-header__brand">
          <text class="brand-text">西大圈</text>
        </view>
      </view>
    </view>

    <!-- 骨架屏 -->
    <Skeleton v-if="loading" type="banner" />
    <Skeleton v-if="loading" type="grid" />

    <!-- 轮播图 -->
    <view v-if="!loading" class="banner-wrapper slide-up">
      <swiper 
        class="banner-swiper" 
        :indicator-dots="true" 
        :autoplay="true" 
        :interval="4000" 
        :circular="true"
        :indicator-color="'rgba(255,255,255,0.4)'"
        :indicator-active-color="'#16A873'"
      >
        <swiper-item v-for="banner in banners" :key="banner.id" @click="handleBanner(banner)">
          <image class="banner-image" :src="banner.image" mode="aspectFill" />
          <view class="banner-overlay">
            <text class="banner-title">{{ banner.title || '西大圈' }}</text>
            <text class="banner-subtitle">{{ banner.subtitle || '校园本地生活增长平台' }}</text>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 金刚区 -->
    <view v-if="!loading" class="quick-grid slide-up stagger-1">
      <view class="grid-item tap-active" @click="goTo('/pages/food/food')">
        <view class="grid-icon grid-icon--food">
          <image class="grid-icon__img" src="/static/icons/food.svg" mode="aspectFit" />
        </view>
        <text class="grid-text">美食</text>
      </view>
      <view class="grid-item tap-active" @click="goTo('/pages/driving/driving')">
        <view class="grid-icon grid-icon--driving">
          <image class="grid-icon__img" src="/static/icons/car.svg" mode="aspectFit" />
        </view>
        <text class="grid-text">驾校</text>
      </view>
      <view class="grid-item tap-active" @click="showServiceMenu">
        <view class="grid-icon grid-icon--service">
          <image class="grid-icon__img" src="/static/icons/service.svg" mode="aspectFit" />
        </view>
        <text class="grid-text">生活服务</text>
      </view>
      <view class="grid-item tap-active" @click="goTo('/pages/community/community')">
        <view class="grid-icon grid-icon--community">
          <image class="grid-icon__img" src="/static/icons/chat.svg" mode="aspectFit" />
        </view>
        <text class="grid-text">校园墙</text>
      </view>
    </view>

    <!-- 生活服务展开 -->
    <view v-if="showServices" class="service-expand scale-in">
      <view class="service-expand__header">
        <text class="service-expand__title">生活服务</text>
        <view class="service-expand__close" @click="showServices = false">
          <u-icon name="close" size="16" color="#9CA3AF" />
        </view>
      </view>
      <view class="service-grid">
        <view class="service-item tap-active" v-for="item in serviceList" :key="item.key" @click="goToService(item.key)">
          <image class="service-item__icon" :src="item.icon" mode="aspectFit" />
          <text>{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 抽签吃饭 -->
    <view class="food-draw slide-up stagger-2">
      <view class="food-draw__header">
        <view>
          <view class="food-draw__badge">
            <u-icon name="gift-fill" size="12" color="#B42318" />
            <text>今天吃什么</text>
          </view>
          <text class="food-draw__title">抽一家校边美食</text>
          <text class="food-draw__desc">奖池 {{ foodMerchants.length }} 家，点一下交给手气</text>
        </view>
        <view class="food-draw__pot">
          <text>食</text>
        </view>
      </view>

      <view :class="['food-draw__reel', { 'food-draw__reel--rolling': drawRolling }]">
        <image
          v-if="currentDrawMerchant?.image"
          class="food-draw__image"
          :src="currentDrawMerchant.image"
          mode="aspectFill"
        />
        <view v-else class="food-draw__image food-draw__image--empty">
          <u-icon name="photo" size="24" color="#F97316" />
        </view>
        <view class="food-draw__merchant">
          <text class="food-draw__merchant-name">{{ currentDrawMerchant?.name || '正在收录校边美食' }}</text>
          <text class="food-draw__merchant-desc">
            {{ currentDrawMerchant?.summary || emptyDrawText }}
          </text>
          <view v-if="currentDrawMerchant" class="food-draw__meta">
            <text v-if="currentDrawMerchant.avgPrice">人均 {{ currentDrawMerchant.avgPrice }} 元</text>
            <text>{{ currentDrawMerchant.distance || '校边' }}</text>
          </view>
        </view>
      </view>

      <view class="food-draw__actions">
        <button
          class="food-draw__button"
          :disabled="drawRolling || foodMerchants.length === 0"
          @click="startFoodDraw"
        >
          {{ drawRolling ? '抽签中...' : selectedDrawMerchant ? '再抽一次' : '开始抽签' }}
        </button>
        <button
          v-if="selectedDrawMerchant && !drawRolling"
          class="food-draw__detail"
          @click="openDrawMerchant"
        >
          去看看
        </button>
      </view>
    </view>

    <!-- 今日活动 -->
    <view class="section slide-up stagger-3">
      <view class="section-header">
        <view class="section-header__left">
          <text class="section-title">今日活动</text>
          <text class="section-desc">校园福利和周边好店</text>
        </view>
        <view v-if="activities.length > 0" class="section-header__more" @click="goTo('/pages/food/food')">
          <text>更多</text>
          <u-icon name="arrow-right" size="14" color="#9CA3AF" />
        </view>
      </view>
      <view v-if="activities.length > 0" class="activity-list">
        <view v-for="(activity, index) in activities" :key="activity.id" 
          :class="['activity-card', 'tap-active', `stagger-${index + 1}`]" 
          @click="openMerchant(activity.merchantId, { activityId: activity.id, channelId: activity.channelId, source: activity.source || 'home_activity', action: 'activity_click' })">
          <image v-if="activity.image" class="activity-image" :src="activity.image" mode="aspectFill" />
          <view class="activity-content">
            <view class="activity-tag">
              <u-icon name="gift-fill" size="12" color="#FFFFFF" />
              <text>校园福利</text>
            </view>
            <text class="activity-title">{{ activity.title }}</text>
            <text v-if="activity.description" class="activity-desc">{{ activity.description }}</text>
            <view class="activity-action">
              <text>去看看</text>
              <u-icon name="arrow-right" size="12" color="#10B981" />
            </view>
          </view>
        </view>
      </view>
      <EmptyState 
        v-else 
        icon="gift" 
        title="今天暂无上架活动" 
        description="先加入西大圈微信，第一时间接收新福利"
        size="small"
      />
    </view>

    <!-- 热门商家推荐 -->
    <view class="section slide-up stagger-4">
      <view class="section-header">
        <view class="section-header__left">
          <text class="section-title">热门商家</text>
          <text class="section-desc">同学都在逛</text>
        </view>
        <view v-if="merchants.length > 0" class="section-header__more" @click="goTo('/pages/food/food')">
          <text>更多</text>
          <u-icon name="arrow-right" size="14" color="#9CA3AF" />
        </view>
      </view>
      <Skeleton v-if="loading" type="merchant" :count="2" />
      <view v-else-if="merchants.length > 0" class="merchant-grid">
        <view v-for="(merchant, index) in merchants" :key="merchant.id" 
          :class="['merchant-card', 'tap-active', `stagger-${index + 1}`]" 
          @click="openMerchant(merchant.id, { channelId: merchant.defaultChannelId, source: 'home_hot', action: 'merchant_click' })">
          <image class="merchant-image" :src="merchant.image || '/static/images/banner-campus.jpg'" mode="aspectFill" />
          <view class="merchant-content">
            <text class="merchant-name">{{ merchant.name }}</text>
            <text class="merchant-desc">{{ merchant.summary || '优质商家' }}</text>
            <view class="merchant-meta">
              <view class="meta-item">
                <u-icon name="map-fill" size="12" color="#10B981" />
                <text>{{ merchant.distance || '校边' }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <EmptyState 
        v-else 
        icon="shop" 
        title="暂无推荐商家" 
        description="我们会尽快为你推荐优质商家"
        size="small"
      />
    </view>

    <!-- 校园墙专区 -->
    <view class="section slide-up stagger-5">
      <view class="campus-zone">
        <view class="zone-header">
          <view class="zone-badge">
            <u-icon name="star-fill" size="14" color="#FFFFFF" />
            <text>官方</text>
          </view>
          <text class="zone-title">校园墙专区</text>
          <text class="zone-desc">加入我们，获取最新校园资讯</text>
        </view>
        <view class="zone-links">
          <view class="zone-link tap-active" @click="showWechatToast">
            <view class="zone-link__icon zone-link__icon--wechat">
              <image class="zone-link__icon-img" src="/static/icons/wechat.svg" mode="aspectFit" />
            </view>
            <text>微信</text>
          </view>
          <view class="zone-link tap-active">
            <view class="zone-link__icon zone-link__icon--douyin">
              <image class="zone-link__icon-img" src="/static/icons/douyin.svg" mode="aspectFit" />
            </view>
            <text>抖音</text>
          </view>
          <view class="zone-link tap-active">
            <view class="zone-link__icon zone-link__icon--xiaohongshu">
              <image class="zone-link__icon-img" src="/static/icons/xiaohongshu.svg" mode="aspectFit" />
            </view>
            <text>小红书</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 意见反馈入口 -->
    <view class="section slide-up stagger-5">
      <view class="feedback-entry tap-active" @click="goTo('/pages/feedback/feedback')">
        <view class="feedback-entry__icon">
          <u-icon name="edit-pen-fill" size="20" color="#10B981" />
        </view>
        <text class="feedback-text">同学希望学校周边有什么？</text>
        <u-icon name="arrow-right" size="16" color="#D1D5DB" />
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { publicApi, trackActivity } from '@/api/index'
import { useAppStore } from '@/store/index'
import Skeleton from '@/components/Skeleton.vue'
import EmptyState from '@/components/EmptyState.vue'

interface Banner {
  id: string
  title?: string
  subtitle?: string
  image?: string
  targetType?: string
  targetId?: string
  url?: string
}

interface Activity {
  id: string
  title: string
  description?: string
  image?: string
  merchantId?: string
  channelId?: string
  source?: string
}

interface Merchant {
  id: string
  name: string
  image?: string
  summary?: string
  distance?: string
  avgPrice?: number
  defaultChannelId?: string
}

const store = useAppStore()
const banners = ref<Banner[]>([])
const activities = ref<Activity[]>([])
const merchants = ref<Merchant[]>([])
const foodMerchants = ref<Merchant[]>([])
const showServices = ref(false)
const loading = ref(true)
const uToast = ref<any>(null)
const drawRolling = ref(false)
const drawCursor = ref(0)
const selectedDrawMerchant = ref<Merchant | null>(null)
let drawTimer: ReturnType<typeof setInterval> | undefined

const tabPages = ['/pages/index/index', '/pages/food/food', '/pages/service/service', '/pages/community/community', '/pages/mine/mine']

const serviceList = [
  { key: 'print', name: '打印', icon: '/static/icons/print-green.svg' },
  { key: 'wash', name: '洗护', icon: '/static/icons/wash-green.svg' },
  { key: 'entertainment', name: '娱乐', icon: '/static/icons/entertainment-green.svg' },
  { key: 'female', name: '女生精选', icon: '/static/icons/heart-green.svg' },
  { key: 'rent', name: '租房', icon: '/static/icons/home-green.svg' },
  { key: 'parttime', name: '兼职', icon: '/static/icons/bag-green.svg' }
]

const defaultBanners: Banner[] = [
  {
    id: 'default',
    title: '西大圈',
    subtitle: '校园本地生活增长平台',
    image: '/static/images/h5-hero-campus-life.png'
  }
]

const emptyDrawText = '美食商家上线后，就能一键抽出今天吃哪家'
const currentDrawMerchant = computed(() => {
  if (drawRolling.value && foodMerchants.value.length > 0) {
    return foodMerchants.value[drawCursor.value % foodMerchants.value.length]
  }
  return selectedDrawMerchant.value || foodMerchants.value[0] || null
})

onMounted(async () => {
  trackActivity('page_view', '/index')
  try {
    const data = await publicApi<any>('/api/public/home')
    banners.value = data.banners?.length > 0 ? data.banners : defaultBanners
    activities.value = data.activities || []
    activities.value.slice(0, 6).forEach((activity) => {
      trackActivity('activity_impression', '/index', activity.id, {
        merchantId: activity.merchantId,
        activityId: activity.id,
        channelId: activity.channelId,
        source: activity.source || 'home_activity'
      })
    })
  } catch (err) {
    banners.value = defaultBanners
  }

  try {
    const data = await publicApi<Merchant[]>('/api/public/food/merchants')
    foodMerchants.value = data || []
    merchants.value = foodMerchants.value.slice(0, 4)
    if (foodMerchants.value.length > 0) {
      trackActivity('food_draw_impression', '/index', undefined, {
        source: 'food_draw'
      })
    }
    merchants.value.forEach((merchant) => {
      trackActivity('merchant_impression', '/index', merchant.id, {
        merchantId: merchant.id,
        channelId: merchant.defaultChannelId,
        source: 'home_hot'
      })
    })
  } catch (err) {
    merchants.value = []
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  stopDrawTimer()
})

function goSearch() {
  uni.navigateTo({ url: '/pages/search/search' })
}

function goTo(url: string) {
  const path = url.split('?')[0]
  if (tabPages.includes(path)) {
    uni.switchTab({ url: path })
  } else {
    uni.navigateTo({ url })
  }
}

function goToService(key: string) {
  showServices.value = false
  store.selectedServiceKey = key
  uni.switchTab({ url: '/pages/service/service' })
}

function showServiceMenu() {
  showServices.value = !showServices.value
}

function handleBanner(banner: Banner) {
  trackActivity('banner_click', '/index', banner.id, {
    source: 'home_banner',
    scene: banner.targetType
  })
  if (banner.targetType === 'activity' && banner.targetId) {
    const activity = activities.value.find(a => a.id === banner.targetId)
    if (activity?.merchantId) {
      openMerchant(activity.merchantId, { activityId: activity.id, channelId: activity.channelId, source: activity.source || 'home_banner', action: 'activity_click' })
    }
  } else if (banner.targetType === 'tab' && banner.targetId) {
    uni.switchTab({ url: `/pages/${banner.targetId}/${banner.targetId}` })
  }
}

function stopDrawTimer() {
  if (!drawTimer) return
  clearInterval(drawTimer)
  drawTimer = undefined
}

function startFoodDraw() {
  if (drawRolling.value || foodMerchants.value.length === 0) return
  trackActivity('food_draw_start', '/index', undefined, {
    source: 'food_draw'
  })
  drawRolling.value = true
  selectedDrawMerchant.value = null
  let ticks = 0
  const maxTicks = 24 + Math.floor(Math.random() * 10)
  const targetIndex = Math.floor(Math.random() * foodMerchants.value.length)
  stopDrawTimer()
  drawTimer = setInterval(() => {
    ticks += 1
    drawCursor.value = (drawCursor.value + 1) % foodMerchants.value.length
    if (ticks >= maxTicks) {
      stopDrawTimer()
      drawCursor.value = targetIndex
      const selected = foodMerchants.value[targetIndex]
      selectedDrawMerchant.value = selected
      drawRolling.value = false
      trackActivity('food_draw_result', '/index', selected.id, {
        merchantId: selected.id,
        channelId: selected.defaultChannelId,
        source: 'food_draw'
      })
    }
  }, 70)
}

function openDrawMerchant() {
  if (!selectedDrawMerchant.value) return
  openMerchant(selectedDrawMerchant.value.id, {
    channelId: selectedDrawMerchant.value.defaultChannelId,
    source: 'food_draw',
    action: 'merchant_click'
  })
}

function openMerchant(id?: string, options: { activityId?: string; channelId?: string; source?: string; action?: string } = {}) {
  if (!id) return
  trackActivity(options.action || 'merchant_click', '/index', id, {
    merchantId: id,
    activityId: options.activityId,
    channelId: options.channelId,
    source: options.source || 'home'
  })
  const params = [`id=${encodeURIComponent(id)}`]
  if (options.activityId) params.push(`activityId=${encodeURIComponent(options.activityId)}`)
  if (options.channelId) params.push(`channelId=${encodeURIComponent(options.channelId)}`)
  if (options.source) params.push(`source=${encodeURIComponent(options.source)}`)
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

/* ========== 搜索栏 ========== */
.search-header {
  background: $bg-card-soft;
  padding: 20rpx 24rpx 26rpx;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid $border-light;

  &__inner {
    display: flex;
    align-items: center;
    gap: $space-4;
  }
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $space-3;
  background: $bg-page;
  border-radius: $radius-full;
  padding: $space-3 $space-4;
  border: 1rpx solid $border;
}

.search-placeholder {
  font-size: $font-sm;
  color: $text-placeholder;
}

.search-header__brand {
  .brand-text {
    font-size: $font-sm;
    color: $primary;
    font-weight: $font-medium;
  }
}

/* ========== 轮播图 ========== */
.banner-wrapper {
  padding: 0 $space-4;
  margin-top: $space-4;
  position: relative;
  z-index: 1;
}

.banner-swiper {
  height: 320rpx;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-md;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 48rpx 24rpx 24rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
}

.banner-title {
  display: block;
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-inverse;
  margin-bottom: $space-2;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.banner-subtitle {
  display: block;
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.85);
}

/* ========== 金刚区 ========== */
.quick-grid {
  display: flex;
  justify-content: space-around;
  padding: $space-6 $space-4;
  background: $bg-card;
  margin: $space-4 $space-4 $space-4;
  border-radius: $radius-lg;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-3;
}

.grid-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-sm;
  transition: all $transition-base;

  &__img {
    width: 48rpx;
    height: 48rpx;
  }

  &--food {
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    box-shadow: 0 4rpx 12rpx rgba(16, 185, 129, 0.3);
  }

  &--driving {
    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
  }

  &--service {
    background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
    box-shadow: 0 4rpx 12rpx rgba(245, 158, 11, 0.3);
  }

  &--community {
    background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
    box-shadow: 0 4rpx 12rpx rgba(139, 92, 246, 0.3);
  }
}

.grid-text {
  font-size: $font-sm;
  color: $text-primary;
  font-weight: $font-medium;
}

/* ========== 生活服务展开 ========== */
.service-expand {
  background: $bg-card;
  margin: 0 $space-4 $space-4;
  border-radius: $radius-lg;
  padding: $space-5;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-5;
  }

  &__title {
    font-size: $font-md;
    font-weight: $font-semibold;
    color: $text-primary;
  }

  &__close {
    width: 48rpx;
    height: 48rpx;
    border-radius: $radius-full;
    background: $bg-page;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $space-4;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-3;
  padding: $space-4;
  background: $bg-page;
  border-radius: $radius-md;
  transition: all $transition-base;

  &__icon {
    width: 48rpx;
    height: 48rpx;
  }

  &:active {
    background: $primary-bg;
  }

  text {
    font-size: $font-xs;
    color: $text-primary;
    font-weight: $font-medium;
  }
}

/* ========== 抽签吃饭 ========== */
.food-draw {
  margin: 0 $space-4 $space-4;
  padding: 24rpx;
  border-radius: $radius-lg;
  background: linear-gradient(135deg, #FFF7D6 0%, #FFE1A3 42%, #FF5A36 100%);
  border: 2rpx solid #FFD16A;
  box-shadow: 0 12rpx 28rpx rgba(255, 90, 54, 0.18);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    right: -60rpx;
    top: -80rpx;
    width: 220rpx;
    height: 220rpx;
    border-radius: $radius-full;
    border: 24rpx solid rgba(255, 255, 255, 0.26);
  }

  &__header {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: $space-4;
    margin-bottom: $space-5;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: $space-1;
    padding: 6rpx 14rpx;
    border-radius: $radius-full;
    background: rgba(255, 255, 255, 0.86);
    margin-bottom: $space-3;

    text {
      font-size: $font-xs;
      color: #B42318;
      font-weight: $font-semibold;
    }
  }

  &__title {
    display: block;
    font-size: 40rpx;
    line-height: 1.2;
    color: #7A1F12;
    font-weight: $font-bold;
    margin-bottom: $space-2;
  }

  &__desc {
    display: block;
    font-size: $font-xs;
    color: rgba(122, 31, 18, 0.78);
  }

  &__pot {
    width: 86rpx;
    height: 86rpx;
    border-radius: $radius-full;
    flex-shrink: 0;
    background: #D92D20;
    border: 6rpx solid #FFFFFF;
    box-shadow: 0 8rpx 18rpx rgba(180, 35, 24, 0.26);
    display: flex;
    align-items: center;
    justify-content: center;

    text {
      color: #FFFFFF;
      font-size: $font-lg;
      font-weight: $font-bold;
    }
  }

  &__reel {
    position: relative;
    z-index: 1;
    min-height: 184rpx;
    display: flex;
    align-items: center;
    gap: $space-4;
    padding: $space-4;
    border-radius: $radius-md;
    background: rgba(255, 255, 255, 0.94);
    border: 2rpx solid rgba(255, 255, 255, 0.78);
    box-shadow: inset 0 0 0 2rpx rgba(255, 209, 106, 0.42);
    transition: transform $transition-fast;

    &--rolling {
      transform: scale(1.01);
    }
  }

  &__image {
    width: 148rpx;
    height: 148rpx;
    border-radius: $radius-md;
    flex-shrink: 0;
    background: #FFF1D6;

    &--empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__merchant {
    min-width: 0;
    flex: 1;
  }

  &__merchant-name {
    display: block;
    font-size: $font-md;
    line-height: 1.25;
    font-weight: $font-bold;
    color: #25110C;
    margin-bottom: $space-2;
  }

  &__merchant-desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: $font-xs;
    line-height: 1.45;
    color: #755044;
    margin-bottom: $space-3;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;

    text {
      padding: 4rpx 12rpx;
      border-radius: $radius-full;
      background: #FFF4E6;
      font-size: 20rpx;
      color: #B54708;
      font-weight: $font-medium;
    }
  }

  &__actions {
    position: relative;
    z-index: 1;
    display: flex;
    gap: $space-3;
    margin-top: $space-4;
  }

  &__button,
  &__detail {
    height: 76rpx;
    min-width: 0;
    margin: 0;
    border-radius: $radius-full;
    font-size: $font-base;
    font-weight: $font-bold;
    line-height: 76rpx;
    border: none;

    &::after {
      border: none;
    }
  }

  &__button {
    flex: 1;
    color: #FFFFFF;
    background: linear-gradient(135deg, #F04438 0%, #B42318 100%);
    box-shadow: 0 8rpx 18rpx rgba(180, 35, 24, 0.24);

    &[disabled] {
      color: rgba(255, 255, 255, 0.82);
      background: #D0A99D;
      box-shadow: none;
    }
  }

  &__detail {
    width: 176rpx;
    flex-shrink: 0;
    color: #B42318;
    background: #FFFFFF;
  }
}

/* ========== 区块通用 ========== */
.section {
  padding: $space-2 $space-4 $space-4;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: $space-5;

  &__left {
    display: flex;
    flex-direction: column;
  }

  &__more {
    display: flex;
    align-items: center;
    gap: $space-1;

    text {
      font-size: $font-sm;
      color: $text-tertiary;
    }
  }
}

.section-title {
  font-size: $font-base;
  font-weight: $font-bold;
  color: $text-primary;
  display: block;
}

.section-desc {
  font-size: $font-xs;
  color: $text-tertiary;
  margin-top: $space-1;
  display: block;
}

/* ========== 活动卡片 ========== */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.activity-card {
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
  transition: all $transition-base;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-sm;
  }
}

.activity-image {
  width: 100%;
  height: 300rpx;
}

.activity-content {
  padding: $space-5;
}

.activity-tag {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  background: $primary-bg;
  padding: $space-1 $space-3;
  border-radius: $radius-full;
  margin-bottom: $space-3;

  text {
    font-size: $font-xs;
    color: $primary;
    font-weight: $font-medium;
  }
}

.activity-title {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
  display: block;
  margin-bottom: $space-2;
}

.activity-desc {
  font-size: $font-sm;
  color: $text-secondary;
  display: block;
  margin-bottom: $space-3;
  line-height: 1.5;
}

.activity-action {
  display: flex;
  align-items: center;
  gap: $space-2;

  text {
    font-size: $font-sm;
    color: $primary;
    font-weight: $font-medium;
  }
}

/* ========== 商家卡片 ========== */
.merchant-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-4;
}

.merchant-card {
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
  transition: all $transition-base;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-sm;
  }
}

.merchant-image {
  width: 100%;
  height: 220rpx;
}

.merchant-content {
  padding: $space-4;
}

.merchant-name {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
  display: block;
  margin-bottom: $space-2;
}

.merchant-desc {
  font-size: $font-xs;
  color: $text-secondary;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: $space-3;
}

.merchant-meta {
  display: flex;
  align-items: center;
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

/* ========== 校园墙专区 ========== */
.campus-zone {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-6;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
}

.zone-header {
  margin-bottom: $space-6;
}

.zone-badge {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  background: $primary-bg;
  padding: $space-1 $space-3;
  border-radius: $radius-full;
  margin-bottom: $space-3;

  text {
    font-size: $font-xs;
    color: $primary;
    font-weight: $font-medium;
  }
}

.zone-title {
  display: block;
  font-size: $font-md;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $space-2;
}

.zone-desc {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
}

.zone-links {
  display: flex;
  justify-content: space-around;
}

.zone-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-3;

  text {
    font-size: $font-xs;
    color: $text-secondary;
    font-weight: $font-medium;
  }

  &__icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: $radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: $shadow-sm;

    &-img {
      width: 48rpx;
      height: 48rpx;
    }

    &--wechat {
      background: linear-gradient(135deg, #07C160 0%, #06AD56 100%);
    }

    &--douyin {
      background: linear-gradient(135deg, #000000 0%, #333333 100%);
    }

    &--xiaohongshu {
      background: linear-gradient(135deg, #FF2442 0%, #E61E3C 100%);
    }
  }
}

/* ========== 意见反馈入口 ========== */
.feedback-entry {
  display: flex;
  align-items: center;
  gap: $space-4;
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-5;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;

  &__icon {
    width: 64rpx;
    height: 64rpx;
    border-radius: $radius-md;
    background: $primary-bg;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.feedback-text {
  flex: 1;
  font-size: $font-sm;
  color: $text-primary;
  font-weight: $font-medium;
}
</style>
