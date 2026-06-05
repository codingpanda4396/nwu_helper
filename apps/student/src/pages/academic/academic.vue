<template>
  <view class="page">
    <!-- 顶部搜索 -->
    <view class="search-section">
      <input class="search-input" v-model="keyword" placeholder="搜索老师或课程..." @confirm="doSearch" />
    </view>

    <!-- 分段切换 -->
    <view class="segmented-bar">
      <view
        :class="['seg-item', { 'seg-item--active': activeTab === 'teachers' }]"
        @click="activeTab = 'teachers'"
      >
        <text>老师评价</text>
      </view>
      <view
        :class="['seg-item', { 'seg-item--active': activeTab === 'materials' }]"
        @click="activeTab = 'materials'"
      >
        <text>复习资料</text>
      </view>
    </view>

    <!-- 老师评价 -->
    <view v-if="activeTab === 'teachers'" class="content-section">
      <view class="section-header">
        <text class="section-title">热门教师</text>
        <text class="section-action tap-active" @click="goAddTeacher">添加教师</text>
      </view>

      <view v-for="teacher in teachers" :key="teacher.id" class="teacher-card tap-active slide-up" @click="goTeacher(teacher.id)">
        <view class="teacher-avatar">
          <u-icon name="account-fill" size="22" color="#FFFFFF" />
        </view>
        <view class="teacher-info">
          <view class="teacher-name-row">
            <text class="teacher-name">{{ teacher.name }}</text>
            <text class="teacher-review-count">{{ teacher.reviewCount }}条评价</text>
          </view>
          <text class="teacher-college">{{ teacher.college }}{{ teacher.department ? ' · ' + teacher.department : '' }}</text>
          <view class="rating-row">
            <view class="rating-item">
              <text class="rating-label">给分</text>
              <text class="rating-value">{{ teacher.avgGrading ? teacher.avgGrading.toFixed(1) : '-' }}</text>
            </view>
            <view class="rating-item">
              <text class="rating-label">点名</text>
              <text class="rating-value">{{ teacher.avgAttendance ? teacher.avgAttendance.toFixed(1) : '-' }}</text>
            </view>
            <view class="rating-item">
              <text class="rating-label">难度</text>
              <text class="rating-value">{{ teacher.avgDifficulty ? teacher.avgDifficulty.toFixed(1) : '-' }}</text>
            </view>
            <view class="rating-item">
              <text class="rating-label">推荐</text>
              <text class="rating-value highlight">{{ teacher.avgRecommend ? teacher.avgRecommend.toFixed(1) : '-' }}</text>
            </view>
            <view class="rating-item">
              <text class="rating-label">重点</text>
              <text class="rating-value">{{ teacher.avgExamFocus ? teacher.avgExamFocus.toFixed(1) : '-' }}</text>
            </view>
          </view>
        </view>
      </view>

      <EmptyState v-if="teachers.length === 0" icon="account" title="暂无教师" description="快来添加第一位教师吧" action-text="添加教师" @action="goAddTeacher" />
    </view>

    <!-- 复习资料 -->
    <view v-if="activeTab === 'materials'" class="content-section">
      <view class="section-header">
        <text class="section-title">最新资料</text>
        <text class="section-action tap-active" @click="goUploadMaterial">上传资料</text>
      </view>

      <view v-for="material in materials" :key="material.id" class="material-card tap-active slide-up" @click="goMaterial(material.id)">
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
          </view>
        </view>
      </view>

      <EmptyState v-if="materials.length === 0" icon="file-text" title="暂无资料" description="快来分享第一份复习资料吧" action-text="上传资料" @action="goUploadMaterial" />
    </view>

    <u-toast ref="uToast" />
    <CustomTabbar />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { publicApi, trackActivity } from '@/api/index'
import EmptyState from '@/components/EmptyState.vue'
import CustomTabbar from '@/components/CustomTabbar.vue'

interface Teacher {
  id: string
  name: string
  college: string
  department: string
  avgGrading: number
  avgAttendance: number
  avgDifficulty: number
  avgRecommend: number
  avgExamFocus: number
  reviewCount: number
}

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

const activeTab = ref('teachers')
const keyword = ref('')
const teachers = ref<Teacher[]>([])
const materials = ref<Material[]>([])
const uToast = ref<any>(null)

onMounted(() => {
  trackActivity('page_view', '/academic')
  fetchTeachers()
})

watch(activeTab, (tab) => {
  if (tab === 'materials' && materials.value.length === 0) {
    fetchMaterials()
  }
})

async function fetchTeachers() {
  try {
    const data = await publicApi<any>('/api/public/teachers?page=1&pageSize=20')
    teachers.value = data?.items || []
  } catch { teachers.value = [] }
}

async function fetchMaterials() {
  try {
    const data = await publicApi<any>('/api/public/materials?page=1&pageSize=20')
    materials.value = data?.items || []
  } catch { materials.value = [] }
}

function doSearch() {
  const kw = keyword.value.trim()
  if (activeTab.value === 'teachers') {
    uni.navigateTo({ url: `/pages/academic/teacher-search?keyword=${encodeURIComponent(kw)}` })
  }
}

function goTeacher(id: string) {
  uni.navigateTo({ url: `/pages/academic/teacher-detail?id=${encodeURIComponent(id)}` })
}

function goMaterial(id: string) {
  uni.navigateTo({ url: `/pages/academic/material-detail?id=${encodeURIComponent(id)}` })
}

function goAddTeacher() {
  uni.navigateTo({ url: '/pages/academic/add-teacher' })
}

function goUploadMaterial() {
  uni.navigateTo({ url: '/pages/academic/material-upload' })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  min-height: 100vh;
  background: $bg-page;
  padding-bottom: 120rpx;
}

/* ========== 搜索 ========== */
.search-section {
  padding: $space-4 $space-5;
  background: $bg-card;
}

.search-input {
  height: 80rpx;
  background: $bg-page;
  border-radius: $radius-full;
  padding: 0 $space-6;
  font-size: $font-base;
  color: $text-primary;
  border: 2rpx solid transparent;

  &:focus {
    border-color: $primary;
  }
}

/* ========== 分段切换 ========== */
.segmented-bar {
  display: flex;
  background: $bg-card;
  padding: $space-2 $space-5 $space-4;
  gap: $space-3;
}

.seg-item {
  flex: 1;
  text-align: center;
  padding: $space-3 0;
  border-radius: $radius-md;
  background: $bg-page;
  transition: all $transition-base;

  text {
    font-size: $font-sm;
    color: $text-secondary;
    font-weight: $font-medium;
  }

  &--active {
    background: $primary-bg;

    text {
      color: $primary;
    }
  }
}

/* ========== 内容区 ========== */
.content-section {
  padding: $space-4 $space-5;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-4;
}

.section-title {
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
}

.section-action {
  font-size: $font-sm;
  color: $primary;
}

/* ========== 教师卡片 ========== */
.teacher-card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-5;
  margin-bottom: $space-4;
  display: flex;
  gap: $space-4;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
}

.teacher-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-full;
  background: $primary-gradient;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.teacher-info {
  flex: 1;
  min-width: 0;
}

.teacher-name-row {
  display: flex;
  align-items: baseline;
  gap: $space-3;
  margin-bottom: $space-1;
}

.teacher-name {
  font-size: $font-base;
  font-weight: $font-bold;
  color: $text-primary;
}

.teacher-review-count {
  font-size: $font-xs;
  color: $text-tertiary;
}

.teacher-college {
  font-size: $font-xs;
  color: $text-secondary;
  display: block;
  margin-bottom: $space-3;
}

.rating-row {
  display: flex;
  gap: $space-4;
}

.rating-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
}

.rating-label {
  font-size: 18rpx;
  color: $text-tertiary;
}

.rating-value {
  font-size: $font-sm;
  font-weight: $font-semibold;
  color: $text-secondary;

  &.highlight {
    color: $warning;
  }
}

/* ========== 资料卡片 ========== */
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
