<template>
  <view class="page" v-if="material.id">
    <!-- 标题区 -->
    <view class="detail-header">
      <text class="detail-title">{{ material.title }}</text>
      <view class="detail-tags">
        <text class="tag-course">{{ material.courseName }}</text>
        <text class="tag-teacher">{{ material.teacherName }}</text>
      </view>
    </view>

    <!-- 描述 -->
    <view class="detail-section" v-if="material.description">
      <text class="section-label">资料描述</text>
      <text class="detail-desc">{{ material.description }}</text>
    </view>

    <!-- 文件列表 -->
    <view class="detail-section">
      <text class="section-label">文件列表（{{ (material.files || []).length }}个）</text>
      <view v-for="file in material.files" :key="file.id" class="file-item tap-active" @click="downloadFile(file)">
        <view class="file-icon">
          <text>📄</text>
        </view>
        <view class="file-info">
          <text class="file-name">{{ file.fileName }}</text>
          <text class="file-meta">{{ file.mimeType }} · {{ (file.fileSize / 1024).toFixed(1) }} KB</text>
        </view>
        <u-icon name="arrow-down" size="16" color="#9AA1AA" />
      </view>
    </view>

    <!-- 统计 -->
    <view class="detail-stats">
      <text class="stat-item">👁 {{ material.viewCount }}次浏览</text>
      <text class="stat-item">⬇ {{ material.downloadCount }}次下载</text>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { publicApi, trackActivity } from '@/api/index'

interface Material {
  id: string
  title: string
  description: string
  courseName: string
  teacherName: string
  viewCount: number
  downloadCount: number
  files: { id: string; fileName: string; fileUrl: string; fileSize: number; mimeType: string }[]
  createdAt: string
}

const materialId = ref('')
const material = ref<Partial<Material>>({})
const uToast = ref<any>(null)

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  materialId.value = currentPage?.options?.id || ''
  if (materialId.value) {
    trackActivity('page_view', '/academic/material-detail', materialId.value)
    fetchMaterial()
  }
})

async function fetchMaterial() {
  try {
    material.value = await publicApi<Material>('/api/public/materials/' + materialId.value)
  } catch {}
}

function downloadFile(file: { fileUrl: string; fileName: string }) {
  // uni-app H5/open download
  uni.downloadFile({
    url: file.fileUrl,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.openDocument({
          filePath: res.tempFilePath,
          showMenu: true,
        })
      }
    },
    fail: () => {
      // Fallback: open in browser
      // #ifdef H5
      window.open(file.fileUrl, '_blank')
      // #endif
    }
  })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  min-height: 100vh;
  background: $bg-page;
  padding: $space-5;
}

.detail-header {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-5;
  margin-bottom: $space-4;
  box-shadow: $shadow-sm;
}

.detail-title {
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $text-primary;
  display: block;
  margin-bottom: $space-4;
}

.detail-tags {
  display: flex;
  gap: $space-3;
}

.tag-course {
  font-size: $font-xs;
  color: $primary;
  background: $primary-bg;
  padding: 4rpx $space-3;
  border-radius: $radius-full;
}

.tag-teacher {
  font-size: $font-xs;
  color: $text-secondary;
  background: $bg-page;
  padding: 4rpx $space-3;
  border-radius: $radius-full;
}

.detail-section {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-5;
  margin-bottom: $space-4;
  box-shadow: $shadow-sm;
}

.section-label {
  font-size: $font-sm;
  font-weight: $font-bold;
  color: $text-primary;
  display: block;
  margin-bottom: $space-3;
}

.detail-desc {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.6;
}

/* ========== 文件列表 ========== */
.file-item {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3 0;
  border-bottom: 1rpx solid $border-light;

  &:last-child {
    border-bottom: none;
  }
}

.file-icon {
  font-size: 36rpx;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: $font-sm;
  color: $text-primary;
  display: block;
}

.file-meta {
  font-size: $font-xs;
  color: $text-tertiary;
}

/* ========== 统计 ========== */
.detail-stats {
  display: flex;
  gap: $space-6;
  padding: $space-4 $space-5;
  justify-content: center;
}

.stat-item {
  font-size: $font-xs;
  color: $text-tertiary;
}
</style>
