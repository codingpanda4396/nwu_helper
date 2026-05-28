<template>
  <view class="page">
    <!-- 轮播图 -->
    <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :circular="true">
      <swiper-item v-for="banner in banners" :key="banner.id" @click="handleBanner(banner)">
        <image class="banner-image" :src="banner.image" mode="aspectFill" />
        <view class="banner-overlay">
          <view class="banner-tag">
            <u-icon name="star-fill" size="12" color="#fff" />
            <text>西大圈</text>
          </view>
          <text class="banner-title">{{ banner.title || '摸摸圈圈头，万事不用愁' }}</text>
          <text class="banner-subtitle">{{ banner.subtitle || '校园吃喝玩乐和生活服务，一个入口就够。' }}</text>
        </view>
      </swiper-item>
    </swiper>

    <!-- 今日活动 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">今日活动</text>
        <text class="section-desc">校园福利和周边好店</text>
      </view>
      <view v-if="homeError" class="error-tip">{{ homeError }}</view>
      <view v-if="activities.length > 0" class="activity-list">
        <view v-for="activity in activities" :key="activity.id" class="activity-card" @click="openMerchant(activity.merchantId)">
          <image v-if="activity.image" class="activity-image" :src="activity.image" mode="aspectFill" />
          <view class="activity-content">
            <view class="activity-tag">
              <u-icon name="gift-fill" size="12" color="#FF6B35" />
              <text>校园福利</text>
            </view>
            <text class="activity-title">{{ activity.title }}</text>
            <text v-if="activity.description" class="activity-desc">{{ activity.description }}</text>
            <view class="activity-action">
              <text>去看看</text>
              <u-icon name="arrow-right" size="12" color="#FF6B35" />
            </view>
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text>今天暂无上架活动</text>
        <text class="empty-tip">先加入西大圈微信，第一时间接收新福利。</text>
      </view>
    </view>

    <!-- 抽签吃饭 -->
    <view class="section">
      <view class="random-food-card">
        <view class="random-food-info">
          <view class="random-food-tag">
            <u-icon name="list" size="14" color="#FF6B35" />
            <text>抽签吃饭</text>
          </view>
          <text class="random-food-name">{{ randomFood ? randomFood.name : '今天交给西大圈' }}</text>
          <text class="random-food-desc">{{ randomFood ? (randomFood.recommendation || '这家今天值得试试。') : '选择困难时，随机抽一家校边美食；暂无可抽商家时会提示空态。' }}</text>
        </view>
        <view class="random-food-actions">
          <u-button type="primary" size="small" @click="chooseFood">
            <u-icon name="shuffle" size="14" color="#fff" />
            <text style="margin-left: 8rpx;">开抽</text>
          </u-button>
          <u-button v-if="randomFood" type="default" size="small" @click="openMerchant(randomFood.id)">
            <u-icon name="arrow-right" size="14" color="#FF6B35" />
            <text style="margin-left: 8rpx;">进店</text>
          </u-button>
        </view>
      </view>
    </view>

    <!-- 微信入口 -->
    <view class="section">
      <view class="wechat-card">
        <image class="wechat-image" src="/static/images/wechat-promo.png" mode="aspectFill" />
        <view class="wechat-content">
          <view class="wechat-tag">
            <u-icon name="weixin-fill" size="14" color="#07C160" />
            <text>微信入口</text>
          </view>
          <text class="wechat-title">加入西大圈微信</text>
          <text class="wechat-desc">领活动、问优惠、推荐好店、反馈问题，都从这里开始。</text>
          <u-button type="success" size="small" @click="showWechatToast">
            <u-icon name="weixin-fill" size="14" color="#fff" />
            <text style="margin-left: 8rpx;">添加微信</text>
          </u-button>
        </view>
      </view>
    </view>

    <!-- Toast -->
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
  recommendation?: string
}

const banners = ref<Banner[]>([])
const activities = ref<Activity[]>([])
const randomFood = ref<Merchant | null>(null)
const homeError = ref('')
const uToast = ref<any>(null)

const defaultBanners: Banner[] = [
  {
    id: 'default',
    title: '摸摸圈圈头，万事不用愁',
    subtitle: '校园吃喝玩乐和生活服务，一个入口就够。',
    image: '/static/images/hero-campus-life.png',
    targetType: 'about'
  }
]

onMounted(async () => {
  try {
    const data = await publicApi<{ banners: Banner[]; activities: Activity[] }>('/api/public/home')
    banners.value = data.banners.length > 0 ? data.banners : defaultBanners
    activities.value = data.activities || []
  } catch (err) {
    banners.value = defaultBanners
    homeError.value = '首页内容暂时加载失败，请稍后再试。'
  }
})

function handleBanner(banner: Banner) {
  if (banner.targetType === 'activity' && banner.targetId) {
    const activity = activities.value.find(a => a.id === banner.targetId)
    if (activity?.merchantId) {
      openMerchant(activity.merchantId)
    }
  } else if (banner.targetType === 'tab' && banner.targetId) {
    uni.switchTab({ url: `/pages/${banner.targetId}/${banner.targetId}` })
  } else if (banner.targetType === 'url' && banner.url) {
    uni.navigateTo({ url: `/pages/webview/webview?url=${encodeURIComponent(banner.url)}` })
  }
}

function openMerchant(id?: string) {
  if (!id) return
  uni.navigateTo({ url: `/pages/merchant/merchant?id=${encodeURIComponent(id)}` })
}

async function chooseFood() {
  try {
    randomFood.value = await publicApi<Merchant | null>('/api/public/food/random')
  } catch (err) {
    randomFood.value = null
    uToast.value.show({
      title: '暂无可抽美食',
      type: 'warning'
    })
  }
}

function showWechatToast() {
  uToast.value.show({
    title: '请添加西大圈微信，活动报名、反馈合作和发帖入口都会优先开放。',
    type: 'info',
    duration: 2600
  })
}
</script>

<style lang="scss" scoped>
.page {
  padding-bottom: 120rpx;
}

.banner-swiper {
  height: 400rpx;
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

.banner-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 107, 53, 0.8);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
  
  text {
    font-size: 22rpx;
    color: #ffffff;
  }
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

.section {
  padding: 30rpx;
}

.section-header {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  display: block;
}

.section-desc {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
  display: block;
}

.error-tip {
  font-size: 24rpx;
  color: #ff6b6b;
  margin-bottom: 20rpx;
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
  height: 300rpx;
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
    color: #FF6B35;
  }
}

.activity-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 12rpx;
}

.activity-desc {
  font-size: 26rpx;
  color: #666666;
  display: block;
  margin-bottom: 16rpx;
}

.activity-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
  
  text {
    font-size: 24rpx;
    color: #FF6B35;
  }
}

.random-food-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.random-food-info {
  flex: 1;
  margin-right: 30rpx;
}

.random-food-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  
  text {
    font-size: 24rpx;
    color: #FF6B35;
  }
}

.random-food-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 12rpx;
}

.random-food-desc {
  font-size: 26rpx;
  color: #666666;
  display: block;
}

.random-food-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.wechat-card {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.wechat-image {
  width: 100%;
  height: 300rpx;
}

.wechat-content {
  padding: 30rpx;
}

.wechat-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  
  text {
    font-size: 24rpx;
    color: #07C160;
  }
}

.wechat-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 12rpx;
}

.wechat-desc {
  font-size: 26rpx;
  color: #666666;
  display: block;
  margin-bottom: 24rpx;
}

.empty-state {
  text-align: center;
  padding: 60rpx 40rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  text {
    font-size: 28rpx;
    color: #999999;
    display: block;
  }
}

.empty-tip {
  font-size: 24rpx;
  color: #cccccc;
  margin-top: 12rpx;
}
</style>
