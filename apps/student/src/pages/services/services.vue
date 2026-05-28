<template>
  <view class="page">
    <!-- 页面头部 -->
    <view class="page-hero">
      <view class="hero-content">
        <view class="hero-tag">
          <u-icon name="list" size="14" color="#FF6B35" />
          <text>西大圈</text>
        </view>
        <text class="hero-title">生活服务</text>
        <text class="hero-desc">打印洗护娱乐租房，先看学生常用和可信推荐。</text>
      </view>
    </view>

    <!-- 服务分类 -->
    <view class="service-categories">
      <scroll-view scroll-x class="category-scroll">
        <view class="category-list">
          <view 
            v-for="entry in serviceEntries" 
            :key="entry.id" 
            :class="['category-item', { active: selectedEntry === entry.id }]"
            @click="selectEntry(entry)"
          >
            <text class="category-title">{{ entry.title }}</text>
            <text class="category-scene">{{ entry.scene }}</text>
            <view v-if="!hasCategory(entry)" class="category-badge">
              <text>调研中</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 错误提示 -->
    <view v-if="error" class="error-tip">{{ error }}</view>

    <!-- 商家列表 -->
    <view class="merchant-list">
      <view v-if="showMerchants && merchants.length > 0">
        <view v-for="merchant in merchants" :key="merchant.id" class="merchant-card" @click="openMerchant(merchant.id)">
          <image class="merchant-image" :src="merchant.image || '/static/images/banner-campus.jpg'" mode="aspectFill" />
          <view class="merchant-content">
            <view class="merchant-header">
              <text class="merchant-name">{{ merchant.name }}</text>
            </view>
            <text class="merchant-desc">{{ merchant.summary || merchant.recommendation || '西大圈推荐商家' }}</text>
            <view class="merchant-meta">
              <view class="meta-item">
                <u-icon name="map-fill" size="12" color="#999" />
                <text>{{ merchant.distance || merchant.distanceText || '校边' }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="!showMerchants || merchants.length === 0" class="empty-state">
        <text class="empty-title">{{ selectedConfig.title }}还在调研中</text>
        <text class="empty-desc">这个服务还在调研中，推荐你知道的靠谱店，西大圈优先补充。</text>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { publicApi } from '@/api/index'

interface ServiceCategory {
  id: string
  key: string
  name: string
}

interface Merchant {
  id: string
  name: string
  image?: string
  summary?: string
  recommendation?: string
  distance?: string
  distanceText?: string
  serviceId?: string
}

interface ServiceEntry {
  id: string
  title: string
  scene: string
  aliases: string[]
}

const serviceEntries: ServiceEntry[] = [
  { id: 'print', title: '打印装订', scene: '论文装订/课程资料', aliases: ['print', 'printing', 'copy', 'binding', '打印', '打印复印', '打印装订'] },
  { id: 'care', title: '洗护理发', scene: '洗衣洗头/理发', aliases: ['laundry', 'wash', 'hair', 'barber', '洗护', '洗衣', '理发', '洗护理发'] },
  { id: 'play', title: '休闲娱乐', scene: '台球棋牌/KTV', aliases: ['ktv', 'entertainment', 'billiards', 'chess', '娱乐', '休闲', '休闲娱乐', '台球', '棋牌'] },
  { id: 'girls', title: '女生精选', scene: '美甲护肤/形象管理', aliases: ['beauty', 'nail', 'skin', 'makeup', 'photo', '女生', '女生精选', '美甲', '护肤', '证件照'] },
  { id: 'rent', title: '租房驾校', scene: '短租合租/报名练车', aliases: ['rent', 'house', 'driving', 'driver', 'car', '租房', '驾校', '租房驾校'] },
  { id: 'work', title: '兼职考证', scene: '靠谱兼职/证书考试', aliases: ['job', 'parttime', 'part-time', 'certificate', 'exam', '兼职', '考证', '兼职考证'] }
]

const categories = ref<ServiceCategory[]>([])
const activeKey = ref('')
const merchants = ref<Merchant[]>([])
const error = ref('')
const selectedEntry = ref('print')
const uToast = ref<any>(null)

const selectedConfig = computed(() => {
  return serviceEntries.find(entry => entry.id === selectedEntry.value) || serviceEntries[0]
})

const matchedCategory = computed(() => {
  return categories.value.find(category => {
    const entry = selectedConfig.value
    const normalize = (value?: string) => (value || '').toLowerCase().replace(/\s|_|-/g, '')
    const key = normalize(category.key)
    const name = normalize(category.name)
    return entry.aliases.some(alias => {
      const normalizedAlias = normalize(alias)
      return key === normalizedAlias || name === normalizedAlias || key.includes(normalizedAlias) || name.includes(normalizedAlias)
    })
  })
})

const showMerchants = computed(() => {
  return Boolean(matchedCategory.value?.key && matchedCategory.value.key === activeKey.value)
})

onMounted(async () => {
  try {
    const data = await publicApi<ServiceCategory[]>('/api/public/services/categories')
    categories.value = data || []
    if (categories.value.length > 0 && !activeKey.value) {
      activeKey.value = categories.value[0].key
    }
  } catch (err) {
    categories.value = [
      { id: 'mock-print-cat', key: 'print', name: '打印装订' },
      { id: 'mock-care-cat', key: 'care', name: '洗护理发' },
      { id: 'mock-rent-cat', key: 'rent', name: '租房驾校' }
    ]
    if (!activeKey.value) {
      activeKey.value = 'print'
    }
  }
})

watch(activeKey, async (newKey) => {
  if (!newKey) return
  try {
    const data = await publicApi<Merchant[]>(`/api/public/services/merchants?serviceKey=${encodeURIComponent(newKey)}`)
    merchants.value = data || []
    error.value = ''
  } catch (err) {
    merchants.value = []
    error.value = '当前使用本地试点数据。'
  }
})

function hasCategory(entry: ServiceEntry): boolean {
  return categories.value.some(category => {
    const normalize = (value?: string) => (value || '').toLowerCase().replace(/\s|_|-/g, '')
    const key = normalize(category.key)
    const name = normalize(category.name)
    return entry.aliases.some(alias => {
      const normalizedAlias = normalize(alias)
      return key === normalizedAlias || name === normalizedAlias || key.includes(normalizedAlias) || name.includes(normalizedAlias)
    })
  })
}

function selectEntry(entry: ServiceEntry) {
  selectedEntry.value = entry.id
  const category = matchedCategory.value
  if (category?.key) {
    activeKey.value = category.key
  }
}

function openMerchant(id: string) {
  uni.navigateTo({ url: `/pages/merchant/merchant?id=${encodeURIComponent(id)}` })
}
</script>

<style lang="scss" scoped>
.page {
  padding-bottom: 120rpx;
}

.page-hero {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%);
  padding: 40rpx 30rpx;
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
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.hero-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.hero-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.service-categories {
  padding: 30rpx 0;
}

.category-scroll {
  white-space: nowrap;
}

.category-list {
  display: inline-flex;
  padding: 0 30rpx;
  gap: 20rpx;
}

.category-item {
  display: inline-flex;
  flex-direction: column;
  padding: 20rpx 30rpx;
  background: #ffffff;
  border-radius: 16rpx;
  min-width: 160rpx;
  position: relative;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  &.active {
    background: #FF6B35;
    
    .category-title,
    .category-scene {
      color: #ffffff;
    }
  }
}

.category-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.category-scene {
  font-size: 22rpx;
  color: #999999;
}

.category-badge {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  background: #ff9900;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  
  text {
    font-size: 20rpx;
    color: #ffffff;
  }
}

.error-tip {
  font-size: 24rpx;
  color: #ff6b6b;
  padding: 20rpx 30rpx;
  background: #fff3f3;
}

.merchant-list {
  padding: 0 30rpx 30rpx;
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
  margin-bottom: 12rpx;
}

.merchant-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.merchant-desc {
  font-size: 24rpx;
  color: #666666;
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
    color: #999999;
  }
}

.empty-state {
  text-align: center;
  padding: 60rpx 40rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.empty-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999999;
  display: block;
}
</style>
