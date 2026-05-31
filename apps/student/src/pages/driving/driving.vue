<template>
  <view class="page">
    <Skeleton v-if="loading" type="banner" />

    <template v-if="!loading">
      <!-- 无配置状态 -->
      <EmptyState
        v-if="!config.active"
        icon="car"
        title="驾校宣传页暂未开放"
        description="敬请期待"
        size="large"
      />

      <template v-else>
        <!-- 宣传图轮播 -->
        <view v-if="config.promoImages && config.promoImages.length > 0" class="promo-section">
          <swiper
            v-if="config.promoImages.length > 1"
            class="promo-swiper"
            :indicator-dots="true"
            :autoplay="true"
            :interval="4000"
            :circular="true"
            :indicator-color="'rgba(255,255,255,0.4)'"
            :indicator-active-color="'#16A873'"
          >
            <swiper-item v-for="(img, index) in config.promoImages" :key="index">
              <image class="promo-image" :src="img" mode="aspectFill" />
            </swiper-item>
          </swiper>
          <view v-else class="promo-single">
            <image class="promo-image" :src="config.promoImages[0]" mode="aspectFill" />
          </view>
        </view>

        <!-- 页面标题和描述 -->
        <view class="info-section">
          <view class="info-card">
            <view class="info-tag">
              <u-icon name="car-fill" size="14" color="#FF6B35" />
              <text>西大圈严选</text>
            </view>
            <text class="info-title">{{ config.title }}</text>
            <text v-if="config.description" class="info-desc">{{ config.description }}</text>
          </view>
        </view>

        <!-- 二维码区域 -->
        <view v-if="config.qrImageUrl" class="qr-section">
          <view class="qr-card">
            <image class="qr-image" :src="config.qrImageUrl" mode="aspectFit" />
            <view class="qr-content">
              <text class="qr-title">{{ config.qrTitle || '扫码咨询' }}</text>
              <text class="qr-desc">{{ config.qrDescription || '' }}</text>
            </view>
          </view>
        </view>
      </template>
    </template>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { publicApi, trackActivity } from '@/api/index'
import Skeleton from '@/components/Skeleton.vue'
import EmptyState from '@/components/EmptyState.vue'

interface DrivingConfig {
  active: boolean
  title: string
  description: string
  promoImages: string[]
  qrImageUrl: string | null
  qrTitle: string
  qrDescription: string
}

const config = ref<DrivingConfig>({
  active: false,
  title: '',
  description: '',
  promoImages: [],
  qrImageUrl: null,
  qrTitle: '',
  qrDescription: ''
})
const loading = ref(true)
const uToast = ref<any>(null)

onMounted(async () => {
  trackActivity('page_view', '/driving')
  try {
    const data = await publicApi<DrivingConfig>('/api/public/driving-config')
    config.value = data
  } catch (err) {
    config.value = { active: false, title: '', description: '', promoImages: [], qrImageUrl: null, qrTitle: '', qrDescription: '' }
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  padding-bottom: 120rpx;
  min-height: 100vh;
  background: $bg-page;
}

/* ========== 宣传图轮播 ========== */
.promo-section {
  margin: $space-4;
}

.promo-swiper {
  height: 400rpx;
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: $shadow-md;
}

.promo-single {
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: $shadow-md;
}

.promo-image {
  width: 100%;
  height: 400rpx;
}

/* ========== 信息卡片 ========== */
.info-section {
  padding: 0 $space-4 $space-4;
}

.info-card {
  background: #ffffff;
  border-radius: $radius-lg;
  padding: 30rpx;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
}

.info-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;

  text {
    font-size: 24rpx;
    color: $primary;
    font-weight: $font-medium;
  }
}

.info-title {
  font-size: 40rpx;
  font-weight: bold;
  color: $text-primary;
  display: block;
  margin-bottom: 12rpx;
}

.info-desc {
  font-size: 26rpx;
  color: $text-secondary;
  display: block;
  line-height: 1.6;
}

/* ========== 二维码区域 ========== */
.qr-section {
  padding: 0 $space-4 $space-4;
}

.qr-card {
  background: #ffffff;
  border-radius: $radius-lg;
  padding: 30rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 30rpx;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
}

.qr-image {
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;
  border-radius: $radius-md;
}

.qr-content {
  flex: 1;
}

.qr-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-primary;
  display: block;
  margin-bottom: 12rpx;
}

.qr-desc {
  font-size: 26rpx;
  color: $text-secondary;
  display: block;
  line-height: 1.6;
}
</style>
