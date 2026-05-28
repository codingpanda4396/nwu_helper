<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-header" @click="goSearch">
      <view class="search-bar">
        <u-icon name="search" size="18" color="#9CA3AF" />
        <text class="search-placeholder">搜美食、驾校、活动</text>
      </view>
    </view>

    <!-- 轮播图 -->
    <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :circular="true">
      <swiper-item v-for="banner in banners" :key="banner.id" @click="handleBanner(banner)">
        <image class="banner-image" :src="banner.image" mode="aspectFill" />
        <view class="banner-overlay">
          <text class="banner-title">{{ banner.title || '竹影校园' }}</text>
          <text class="banner-subtitle">{{ banner.subtitle || '校园本地生活增长平台' }}</text>
        </view>
      </swiper-item>
    </swiper>

    <!-- 金刚区 -->
    <view class="quick-grid">
      <view class="grid-item" @click="goTo('/pages/food/food')">
        <view class="grid-icon" style="background: #E8F5E9">
          <u-icon name="gift-fill" size="24" color="#10B981" />
        </view>
        <text class="grid-text">美食</text>
      </view>
      <view class="grid-item" @click="goTo('/pages/service/service?key=driving')">
        <view class="grid-icon" style="background: #E3F2FD">
          <u-icon name="car-fill" size="24" color="#10B981" />
        </view>
        <text class="grid-text">驾校</text>
      </view>
      <view class="grid-item" @click="showServiceMenu">
        <view class="grid-icon" style="background: #FFF3E0">
          <u-icon name="grid-fill" size="24" color="#10B981" />
        </view>
        <text class="grid-text">生活服务</text>
      </view>
    </view>

    <!-- 生活服务展开 -->
    <view v-if="showServices" class="service-expand">
      <view class="service-grid">
        <view class="service-item" v-for="item in serviceList" :key="item.key" @click="goToService(item.key)">
          <u-icon :name="item.icon" size="20" color="#10B981" />
          <text>{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 今日活动 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">今日活动</text>
        <text class="section-desc">校园福利和周边好店</text>
      </view>
      <view v-if="activities.length > 0" class="activity-list">
        <view v-for="activity in activities" :key="activity.id" class="activity-card" @click="openMerchant(activity.merchantId)">
          <image v-if="activity.image" class="activity-image" :src="activity.image" mode="aspectFill" />
          <view class="activity-content">
            <view class="activity-tag">
              <u-icon name="gift-fill" size="12" color="#10B981" />
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
      <view v-else class="empty-state">
        <text>今天暂无上架活动</text>
        <text class="empty-tip">先加入竹影校园微信，第一时间接收新福利。</text>
      </view>
    </view>

    <!-- 热门商家推荐 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门商家</text>
        <text class="section-desc">同学都在逛</text>
      </view>
      <view class="merchant-grid">
        <view v-for="merchant in merchants" :key="merchant.id" class="merchant-card" @click="openMerchant(merchant.id)">
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
    </view>

    <!-- 校园墙专区 -->
    <view class="section">
      <view class="campus-zone">
        <view class="zone-header">
          <view class="zone-tag">
            <u-icon name="star-fill" size="14" color="#10B981" />
            <text>竹影校园</text>
          </view>
          <text class="zone-title">校园墙专区</text>
          <text class="zone-desc">加入我们，获取最新校园资讯</text>
        </view>
        <view class="zone-links">
          <view class="zone-link" @click="showWechatToast">
            <u-icon name="weixin-fill" size="20" color="#07C160" />
            <text>微信</text>
          </view>
          <view class="zone-link">
            <u-icon name="抖音" size="20" color="#000000" />
            <text>抖音</text>
          </view>
          <view class="zone-link">
            <u-icon name="小红书" size="20" color="#FF2442" />
            <text>小红书</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 意见反馈入口 -->
    <view class="section">
      <view class="feedback-entry" @click="goTo('/pages/feedback/feedback')">
        <u-icon name="edit-pen-fill" size="20" color="#10B981" />
        <text class="feedback-text">同学希望学校周边有什么？</text>
        <u-icon name="arrow-right" size="16" color="#9CA3AF" />
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { publicApi } from '@/api/index'

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
    title: '竹影校园',
    subtitle: '校园本地生活增长平台',
    image: '/static/images/hero-campus-life.png'
  }
]

onMounted(async () => {
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
    title: '请添加竹影校园微信',
    type: 'info'
  })
}
</script>

<style lang="scss" scoped>
.page {
  padding-bottom: 120rpx;
  background: #F9FAFB;
}

.search-header {
  background: #10B981;
  padding: 20rpx 24rpx 30rpx;
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

.banner-swiper {
  height: 360rpx;
  position: relative;
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
  padding: 40rpx 30rpx 30rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}

.banner-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.banner-subtitle {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.quick-grid {
  display: flex;
  justify-content: space-around;
  padding: 30rpx;
  background: #ffffff;
  margin: -20rpx 24rpx 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
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
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-text {
  font-size: 24rpx;
  color: #1F2937;
}

.service-expand {
  background: #ffffff;
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx;
  background: #F9FAFB;
  border-radius: 12rpx;

  text {
    font-size: 22rpx;
    color: #1F2937;
  }
}

.section {
  padding: 0 24rpx 24rpx;
}

.section-header {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1F2937;
  display: block;
}

.section-desc {
  font-size: 24rpx;
  color: #9CA3AF;
  margin-top: 8rpx;
  display: block;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.activity-card {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.activity-image {
  width: 100%;
  height: 280rpx;
}

.activity-content {
  padding: 24rpx;
}

.activity-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 12rpx;

  text {
    font-size: 22rpx;
    color: #10B981;
  }
}

.activity-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #1F2937;
  display: block;
  margin-bottom: 12rpx;
}

.activity-desc {
  font-size: 24rpx;
  color: #6B7280;
  display: block;
  margin-bottom: 16rpx;
}

.activity-action {
  display: flex;
  align-items: center;
  gap: 8rpx;

  text {
    font-size: 24rpx;
    color: #10B981;
  }
}

.empty-state {
  text-align: center;
  padding: 60rpx 40rpx;
  background: #ffffff;
  border-radius: 16rpx;

  text {
    font-size: 28rpx;
    color: #9CA3AF;
    display: block;
  }
}

.empty-tip {
  font-size: 24rpx;
  color: #D1D5DB;
  margin-top: 12rpx;
}

.merchant-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.merchant-card {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.merchant-image {
  width: 100%;
  height: 200rpx;
}

.merchant-content {
  padding: 16rpx;
}

.merchant-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #1F2937;
  display: block;
  margin-bottom: 8rpx;
}

.merchant-desc {
  font-size: 22rpx;
  color: #6B7280;
  display: -webkit-box;
  -webkit-line-clamp: 1;
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
    font-size: 20rpx;
    color: #9CA3AF;
  }
}

.campus-zone {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.zone-header {
  margin-bottom: 24rpx;
}

.zone-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;

  text {
    font-size: 22rpx;
    color: #10B981;
  }
}

.zone-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 8rpx;
}

.zone-desc {
  display: block;
  font-size: 24rpx;
  color: #6B7280;
}

.zone-links {
  display: flex;
  justify-content: space-around;
}

.zone-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;

  text {
    font-size: 22rpx;
    color: #6B7280;
  }
}

.feedback-entry {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.feedback-text {
  flex: 1;
  font-size: 26rpx;
  color: #1F2937;
}
</style>
