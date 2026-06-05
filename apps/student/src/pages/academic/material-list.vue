<template>
  <view class="page">
    <view class="header-bar">
      <text class="header-title">复习资料</text>
    </view>

    <view v-for="material in materials" :key="material.id" class="material-card tap-active slide-up" @click="goDetail(material.id)">
      <view class="material-header">
        <text class="material-title">{{ material.title }}</text>
        <view class="material-course-tag">
          <text>{{ material.courseName }}</text>
        </view>
      </view>
      <text class="material-desc">{{ material.description || '暂无描述' }}</text>
      <view class="material-meta">
        <text class="material-teacher">{{ material.teacherName }}</text>
        <view class="material-stats">
          <text class="material-stat">📁 {{ (material.files || []).length }}个文件</text>
          <text class="material-stat">👁 {{ material.viewCount }}</text>
          <text class="material-stat">⬇ {{ material.downloadCount }}</text>
        </view>
      </view>
    </view>

    <EmptyState v-if="materials.length === 0" icon="file-text" title="暂无资料" description="快来看看其他内容吧" />

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { publicApi, trackActivity } from '@/api/index'
import EmptyState from '@/components/EmptyState.vue'

interface Material {
  id: string
  title: string
  description: string
  courseName: string
  teacherName: string
  viewCount: number
  downloadCount: number
  files: any[]
}

const materials = ref<Material[]>([])
const uToast = ref<any>(null)

onMounted(() => {
  trackActivity('page_view', '/academic/material-list')
  fetchMaterials()
})

async function fetchMaterials() {
  try {
    const data = await publicApi<any>('/api/public/materials?page=1&pageSize=50')
    materials.value = data?.items || []
  } catch { materials.value = [] }
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/academic/material-detail?id=${encodeURIComponent(id)}` })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  min-height: 100vh;
  background: $bg-page;
  padding: $space-5;
}

.header-bar {
  margin-bottom: $space-4;
}

.header-title {
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $text-primary;
}

.material-card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-4;
  margin-bottom: $space-3;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: $space-3;
  margin-bottom: $space-2;
}

.material-title {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
  flex: 1;
}

.material-course-tag {
  padding: 2rpx $space-3;
  background: $primary-bg;
  border-radius: $radius-full;
  flex-shrink: 0;

  text {
    font-size: $font-xs;
    color: $primary;
  }
}

.material-desc {
  font-size: $font-sm;
  color: $text-secondary;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: $space-3;
}

.material-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.material-teacher {
  font-size: $font-xs;
  color: $text-tertiary;
}

.material-stats {
  display: flex;
  gap: $space-4;
}

.material-stat {
  font-size: $font-xs;
  color: $text-tertiary;
}
</style>
