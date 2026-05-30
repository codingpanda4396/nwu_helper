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
        :indicator-active-color="'#10B981'"
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
          <u-icon name="gift-fill" size="28" color="#FFFFFF" />
        </view>
        <text class="grid-text">美食</text>
      </view>
      <view class="grid-item tap-active" @click="goTo('/pages/service/service?key=driving')">
        <view class="grid-icon grid-icon--driving">
          <u-icon name="car-fill" size="28" color="#FFFFFF" />
        </view>
        <text class="grid-text">驾校</text>
      </view>
      <view class="grid-item tap-active" @click="showServiceMenu">
        <view class="grid-icon grid-icon--service">
          <u-icon name="grid-fill" size="28" color="#FFFFFF" />
        </view>
        <text class="grid-text">生活服务</text>
      </view>
      <view class="grid-item tap-active" @click="goTo('/pages/community/community')">
        <view class="grid-icon grid-icon--community">
          <u-icon name="chat-fill" size="28" color="#FFFFFF" />
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
          <u-icon :name="item.icon" size="24" color="#10B981" />
          <text>{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 今日活动 -->
    <view class="section slide-up stagger-2">
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
          @click="openMerchant(activity.merchantId)">
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
    <view class="section slide-up stagger-3">
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
          @click="openMerchant(merchant.id)">
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
    <view class="section slide-up stagger-4">
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
              <u-icon name="weixin-fill" size="24" color="#FFFFFF" />
            </view>
            <text>微信</text>
          </view>
          <view class="zone-link tap-active">
            <view class="zone-link__icon zone-link__icon--douyin">
              <u-icon name="抖音" size="24" color="#FFFFFF" />
            </view>
            <text>抖音</text>
          </view>
          <view class="zone-link tap-active">
            <view class="zone-link__icon zone-link__icon--xiaohongshu">
              <u-icon name="小红书" size="24" color="#FFFFFF" />
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
import { ref, onMounted } from 'vue'
import { publicApi, trackActivity } from '@/api/index'
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
}

interface Merchant {
  id: string
  name: string
  image?: string
  summary?: string
  distance?: string
}

const banners = ref<Banner[]>([])
const activities = ref<Activity[]>([])
const merchants = ref<Merchant[]>([])
const showServices = ref(false)
const loading = ref(true)
const uToast = ref<any>(null)

const serviceList = [
  { key: 'print', name: '打印', icon: 'print-fill' },
  { key: 'wash', name: '洗护', icon: 'water-fill' },
  { key: 'entertainment', name: '娱乐', icon: 'play-right-fill' },
  { key: 'female', name: '女生精选', icon: 'heart-fill' },
  { key: 'rent', name: '租房', icon: 'home-fill' },
  { key: 'parttime', name: '兼职', icon: 'bag-fill' }
]

const defaultBanners: Banner[] = [
  {
    id: 'default',
    title: '西大圈',
    subtitle: '校园本地生活增长平台',
    image: '/static/images/hero-campus-life.png'
  }
]

onMounted(async () => {
  trackActivity('page_view', '/index')
  try {
    const data = await publicApi<any>('/api/public/home')
    banners.value = data.banners?.length > 0 ? data.banners : defaultBanners
    activities.value = data.activities || []
  } catch (err) {
    banners.value = defaultBanners
  }

  try {
    const data = await publicApi<Merchant[]>('/api/public/food/merchants')
    merchants.value = (data || []).slice(0, 4)
  } catch (err) {
    merchants.value = []
  } finally {
    loading.value = false
  }
})

function goSearch() {
  uni.navigateTo({ url: '/pages/search/search' })
}

function goTo(url: string) {
  uni.switchTab({ url })
}

function goToService(key: string) {
  showServices.value = false
  uni.navigateTo({ url: `/pages/service/service?key=${key}` })
}

function showServiceMenu() {
  showServices.value = !showServices.value
}

function handleBanner(banner: Banner) {
  if (banner.targetType === 'activity' && banner.targetId) {
    const activity = activities.value.find(a => a.id === banner.targetId)
    if (activity?.merchantId) {
      openMerchant(activity.merchantId)
    }
  } else if (banner.targetType === 'tab' && banner.targetId) {
    uni.switchTab({ url: `/pages/${banner.targetId}/${banner.targetId}` })
  }
}

function openMerchant(id?: string) {
  if (!id) return
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
  padding: 24rpx 24rpx 32rpx;
  position: sticky;
  top: 0;
  z-index: 100;

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
  background: rgba(255, 255, 255, 0.95);
  border-radius: $radius-full;
  padding: $space-3 $space-4;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.search-placeholder {
  font-size: $font-sm;
  color: $text-placeholder;
}

.search-header__brand {
  .brand-text {
    font-size: $font-sm;
    color: $text-inverse;
    font-weight: $font-medium;
    opacity: 0.9;
  }
}

/* ========== 轮播图 ========== */
.banner-wrapper {
  padding: 0 $space-4;
  margin-top: -$space-4;
  position: relative;
  z-index: 1;
}

.banner-swiper {
  height: 320rpx;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-lg;
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
  box-shadow: $shadow-md;
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
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-sm;
  transition: all $transition-base;

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
  box-shadow: $shadow-md;

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

  &:active {
    background: $primary-bg;
  }

  text {
    font-size: $font-xs;
    color: $text-primary;
    font-weight: $font-medium;
  }
}

/* ========== 区块通用 ========== */
.section {
  padding: 0 $space-4 $space-4;
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
  font-size: $font-md;
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
  box-shadow: $shadow-md;
  transition: all $transition-base;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-sm;
  }
}

.activity-image {
  width: 100%;
  height: 280rpx;
}

.activity-content {
  padding: $space-5;
}

.activity-tag {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  background: $primary-gradient;
  padding: $space-1 $space-3;
  border-radius: $radius-full;
  margin-bottom: $space-3;

  text {
    font-size: $font-xs;
    color: $text-inverse;
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
  box-shadow: $shadow-md;
  transition: all $transition-base;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-sm;
  }
}

.merchant-image {
  width: 100%;
  height: 200rpx;
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
  box-shadow: $shadow-md;
}

.zone-header {
  margin-bottom: $space-6;
}

.zone-badge {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  background: $primary-gradient;
  padding: $space-1 $space-3;
  border-radius: $radius-full;
  margin-bottom: $space-3;

  text {
    font-size: $font-xs;
    color: $text-inverse;
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
  box-shadow: $shadow-md;

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
