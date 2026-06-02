<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-header">
      <view class="search-bar">
        <u-icon name="search" size="18" color="#9AA1AA" />
        <input class="search-input" v-model="keyword" placeholder="搜美食、驾校、活动" @confirm="doSearch" focus />
        <view v-if="keyword" class="search-clear tap-active" @click="clearSearch">
          <u-icon name="close-circle-fill" size="16" color="#D1D5DB" />
        </view>
      </view>
      <text class="search-btn tap-active" @click="doSearch">搜索</text>
    </view>

    <!-- 搜索提示 -->
    <view v-if="!searched" class="search-tips slide-up">
      <!-- 热门搜索 -->
      <view class="tip-section">
        <view class="tip-section__header">
          <u-icon name="fire-fill" size="16" color="#F59E0B" />
          <text class="tip-title">热门搜索</text>
        </view>
        <view class="tip-tags">
          <view class="tip-tag tap-active" v-for="(tag, index) in hotTags" :key="tag" @click="searchTag(tag)">
            <view v-if="index < 3" class="tip-tag__rank" :class="`tip-tag__rank--${index + 1}`">
              <text>{{ index + 1 }}</text>
            </view>
            <text>{{ tag }}</text>
          </view>
        </view>
      </view>

      <!-- 搜索历史 -->
      <view v-if="searchHistory.length > 0" class="tip-section">
        <view class="tip-section__header">
          <u-icon name="clock-fill" size="16" color="#656B73" />
          <text class="tip-title">搜索历史</text>
          <view class="tip-clear tap-active" @click="clearHistory">
            <u-icon name="trash" size="14" color="#9AA1AA" />
            <text>清空</text>
          </view>
        </view>
        <view class="tip-tags">
          <view class="tip-tag tip-tag--history tap-active" v-for="tag in searchHistory" :key="tag" @click="searchTag(tag)">
            <text>{{ tag }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view v-else class="search-results">
      <view v-if="results.length === 0" class="empty-state slide-up">
        <view class="empty-state__icon">
          <u-icon name="search" size="48" color="#D1D5DB" />
        </view>
        <text class="empty-title">未找到相关结果</text>
        <text class="empty-desc">换个关键词试试</text>
        <view class="empty-tags">
          <view class="empty-tag tap-active" v-for="tag in suggestTags" :key="tag" @click="searchTag(tag)">
            <text>{{ tag }}</text>
          </view>
        </view>
      </view>
      <view v-else class="result-list">
        <view v-for="(item, index) in results" :key="item.id" 
          :class="['result-card', 'tap-active', `slide-up stagger-${index + 1}`]" 
          @click="openMerchant(item.id)">
          <image class="result-image" :src="item.image || '/static/images/banner-campus.jpg'" mode="aspectFill" />
          <view class="result-content">
            <text class="result-name">{{ item.name }}</text>
            <text v-if="item.summary" class="result-desc">{{ item.summary }}</text>
            <view v-if="item.address" class="result-address">
              <u-icon name="map-fill" size="12" color="#16A873" />
              <text>{{ item.address }}</text>
            </view>
          </view>
          <u-icon name="arrow-right" size="16" color="#D1D5DB" />
        </view>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { publicApi } from '@/api/index'

interface Merchant {
  id: string
  name: string
  image?: string
  summary?: string
  address?: string
}

const keyword = ref('')
const searched = ref(false)
const results = ref<Merchant[]>([])
const uToast = ref<any>(null)
const searchHistory = ref<string[]>([])

const hotTags = ['美食', '奶茶', '烧烤', '驾校', '打印', '娱乐']
const suggestTags = ['美食', '奶茶', '小吃', '正餐']

async function doSearch() {
  if (!keyword.value.trim()) return
  
  // 添加到搜索历史
  addToHistory(keyword.value.trim())
  
  try {
    const data = await publicApi<{ items: Merchant[] }>('/api/public/merchants?keyword=' + encodeURIComponent(keyword.value))
    results.value = data.items || []
    searched.value = true
  } catch (err) {
    results.value = []
    searched.value = true
  }
}

function searchTag(tag: string) {
  keyword.value = tag
  doSearch()
}

function clearSearch() {
  keyword.value = ''
  searched.value = false
  results.value = []
}

function addToHistory(tag: string) {
  const history = searchHistory.value.filter(h => h !== tag)
  history.unshift(tag)
  searchHistory.value = history.slice(0, 10)
}

function clearHistory() {
  searchHistory.value = []
}

function openMerchant(id: string) {
  uni.navigateTo({ url: `/pages/merchant/merchant?id=${encodeURIComponent(id)}` })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  min-height: 100vh;
  background: $bg-page;
}

/* ========== 搜索栏 ========== */
.search-header {
  background: $bg-card-soft;
  padding: $space-4 $space-5;
  display: flex;
  align-items: center;
  gap: $space-4;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid $border-light;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $space-3;
  background: $bg-page;
  border-radius: $radius-full;
  padding: $space-3 $space-4;
  border: 2rpx solid transparent;
  transition: all $transition-base;

  &:focus-within {
    border-color: $primary;
    background: $bg-card;
    box-shadow: 0 0 0 4rpx rgba(16, 185, 129, 0.1);
  }
}

.search-input {
  flex: 1;
  font-size: $font-base;
  color: $text-primary;
}

.search-clear {
  padding: $space-1;
}

.search-btn {
  font-size: $font-base;
  color: $primary;
  font-weight: $font-semibold;
  flex-shrink: 0;
}

/* ========== 搜索提示 ========== */
.search-tips {
  padding: $space-5 $space-6;
}

.tip-section {
  margin-bottom: $space-8;

  &__header {
    display: flex;
    align-items: center;
    gap: $space-2;
    margin-bottom: $space-4;
  }
}

.tip-title {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
}

.tip-clear {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: $space-1;

  text {
    font-size: $font-xs;
    color: $text-tertiary;
  }
}

.tip-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
}

.tip-tag {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  padding: $space-2 $space-4;
  background: $bg-card;
  border-radius: $radius-full;
  font-size: $font-sm;
  color: $text-secondary;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
  transition: all $transition-base;

  &:active {
    transform: scale(0.95);
    background: $primary-bg;
    color: $primary;
  }

  &--history {
    background: $bg-page;
    box-shadow: none;
  }

  &__rank {
    width: 32rpx;
    height: 32rpx;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;

    text {
      font-size: $font-xs;
      font-weight: $font-bold;
      color: $text-inverse;
    }

    &--1 {
      background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
    }

    &--2 {
      background: linear-gradient(135deg, $text-tertiary 0%, $text-secondary 100%);
    }

    &--3 {
      background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
    }
  }
}

/* ========== 搜索结果 ========== */
.search-results {
  padding: $space-4 $space-5;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.result-card {
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: $space-4;
  padding: $space-4;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
  transition: all $transition-base;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-sm;
  }
}

.result-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-md;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $space-2;
  min-width: 0;
}

.result-name {
  font-size: $font-base;
  font-weight: $font-bold;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-desc {
  font-size: $font-xs;
  color: $text-secondary;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-address {
  display: flex;
  align-items: center;
  gap: $space-1;

  text {
    font-size: $font-xs;
    color: $text-tertiary;
  }
}

/* ========== 空状态 ========== */
.empty-state {
  text-align: center;
  padding: $space-12 $space-6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-4;

  &__icon {
    width: 160rpx;
    height: 160rpx;
    border-radius: $radius-full;
    background: $bg-page;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $space-4;
  }
}

.empty-title {
  font-size: $font-md;
  font-weight: $font-bold;
  color: $text-primary;
}

.empty-desc {
  font-size: $font-sm;
  color: $text-tertiary;
}

.empty-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: $space-3;
  margin-top: $space-4;
}

.empty-tag {
  padding: $space-2 $space-4;
  background: $primary-bg;
  border-radius: $radius-full;
  font-size: $font-sm;
  color: $primary;
  font-weight: $font-medium;
  transition: all $transition-base;

  &:active {
    transform: scale(0.95);
    background: $primary;
    color: $text-inverse;
  }
}
</style>
