<template>
  <view class="page">
    <!-- 教师头部 -->
    <view class="teacher-hero">
      <view class="teacher-avatar">
        <u-icon name="account-fill" size="32" color="#FFFFFF" />
      </view>
      <text class="teacher-name">{{ teacher.name }}</text>
      <text class="teacher-college">{{ teacher.college }}{{ teacher.department ? ' · ' + teacher.department : '' }}</text>
      <text class="teacher-review-count">{{ teacher.reviewCount }}条评价</text>
    </view>

    <!-- 评分维度 -->
    <view class="ratings-section">
      <view class="rating-dim">
        <view class="dim-header">
          <text class="dim-label">给分好坏</text>
          <text class="dim-value">{{ teacher.avgGrading ? teacher.avgGrading.toFixed(1) : '-' }}</text>
        </view>
        <view class="dim-bar-bg"><view class="dim-bar-fill" :style="{ width: (teacher.avgGrading / 5 * 100) + '%', background: dimColor(teacher.avgGrading) }" /></view>
      </view>
      <view class="rating-dim">
        <view class="dim-header">
          <text class="dim-label">点名频率</text>
          <text class="dim-value">{{ teacher.avgAttendance ? teacher.avgAttendance.toFixed(1) : '-' }}</text>
        </view>
        <view class="dim-bar-bg"><view class="dim-bar-fill" :style="{ width: (teacher.avgAttendance / 5 * 100) + '%', background: dimColor(teacher.avgAttendance) }" /></view>
      </view>
      <view class="rating-dim">
        <view class="dim-header">
          <text class="dim-label">课程难度</text>
          <text class="dim-value">{{ teacher.avgDifficulty ? teacher.avgDifficulty.toFixed(1) : '-' }}</text>
        </view>
        <view class="dim-bar-bg"><view class="dim-bar-fill" :style="{ width: (teacher.avgDifficulty / 5 * 100) + '%', background: dimColor(teacher.avgDifficulty, true) }" /></view>
      </view>
      <view class="rating-dim">
        <view class="dim-header">
          <text class="dim-label">推荐指数</text>
          <text class="dim-value highlight">{{ teacher.avgRecommend ? teacher.avgRecommend.toFixed(1) : '-' }}</text>
        </view>
        <view class="dim-bar-bg"><view class="dim-bar-fill" :style="{ width: (teacher.avgRecommend / 5 * 100) + '%', background: '#F59E0B' }" /></view>
      </view>
      <view class="rating-dim">
        <view class="dim-header">
          <text class="dim-label">考试重点</text>
          <text class="dim-value">{{ teacher.avgExamFocus ? teacher.avgExamFocus.toFixed(1) : '-' }}</text>
        </view>
        <view class="dim-bar-bg"><view class="dim-bar-fill" :style="{ width: (teacher.avgExamFocus / 5 * 100) + '%', background: dimColor(teacher.avgExamFocus) }" /></view>
      </view>
    </view>

    <!-- 写评价按钮 -->
    <view class="action-bar">
      <button class="review-btn tap-active" @click="goWriteReview">✍️ 写评价</button>
    </view>

    <!-- 评价列表 -->
    <view class="reviews-section">
      <text class="section-title">评价列表（{{ total }}）</text>

      <view v-for="review in reviews" :key="review.id" class="review-card slide-up">
        <view class="review-header">
          <text class="review-course">{{ review.courseName }}</text>
          <text class="review-time">{{ formatTime(review.createdAt) }}</text>
        </view>
        <view class="review-scores">
          <text class="score-item">给分 {{ review.grading }}⭐</text>
          <text class="score-item">点名 {{ review.attendance }}⭐</text>
          <text class="score-item">难度 {{ review.difficulty }}⭐</text>
          <text class="score-item">推荐 {{ review.recommend }}⭐</text>
          <text class="score-item">重点 {{ review.examFocus }}⭐</text>
        </view>
        <text v-if="review.comment" class="review-comment">{{ review.comment }}</text>
      </view>

      <view v-if="reviews.length === 0 && !loading" class="empty-hint">
        <text>暂无评价，快来写第一条评价吧</text>
      </view>

      <view v-if="hasMore" class="load-more tap-active" @click="loadMore">
        <text>{{ loading ? '加载中...' : '加载更多' }}</text>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { publicApi, trackActivity } from '@/api/index'

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

interface Review {
  id: string
  courseName: string
  grading: number
  attendance: number
  difficulty: number
  recommend: number
  examFocus: number
  comment: string
  createdAt: string
}

const teacherId = ref('')
const teacher = ref<Teacher>({} as Teacher)
const reviews = ref<Review[]>([])
const total = ref(0)
const page = ref(1)
const hasMore = ref(false)
const loading = ref(false)
const uToast = ref<any>(null)

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  teacherId.value = currentPage?.options?.id || ''
  if (teacherId.value) {
    trackActivity('page_view', '/academic/teacher-detail', teacherId.value)
    fetchTeacher()
    fetchReviews()
  }
})

async function fetchTeacher() {
  try {
    teacher.value = await publicApi<Teacher>('/api/public/teachers/' + teacherId.value)
  } catch {}
}

async function fetchReviews() {
  loading.value = true
  try {
    const data = await publicApi<any>(`/api/public/teachers/${teacherId.value}/reviews?page=${page.value}&pageSize=10`)
    if (page.value === 1) {
      reviews.value = data?.items || []
    } else {
      reviews.value.push(...(data?.items || []))
    }
    total.value = data?.total || 0
    hasMore.value = reviews.value.length < total.value
  } catch { reviews.value = [] }
  loading.value = false
}

function loadMore() {
  page.value++
  fetchReviews()
}

function goWriteReview() {
  uni.navigateTo({ url: `/pages/academic/review-form?teacherId=${encodeURIComponent(teacherId.value)}&teacherName=${encodeURIComponent(teacher.value.name)}` })
}

function dimColor(score: number, reverse = false) {
  if (!score) return '#E5E7EB'
  if (reverse) {
    // Higher difficulty = more red
    if (score >= 4) return '#EF4444'
    if (score >= 3) return '#F59E0B'
    return '#10B981'
  }
  // Higher = better = more green
  if (score >= 4) return '#10B981'
  if (score >= 3) return '#F59E0B'
  return '#EF4444'
}

function formatTime(t: string) {
  if (!t) return ''
  return new Date(t).toISOString().slice(0, 10)
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  min-height: 100vh;
  background: $bg-page;
  padding-bottom: 40rpx;
}

/* ========== 教师头部 ========== */
.teacher-hero {
  background: $primary-bg;
  padding: $space-8 $space-5 $space-6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
}

.teacher-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-full;
  background: $primary-gradient;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $space-2;
}

.teacher-name {
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $text-primary;
}

.teacher-college {
  font-size: $font-sm;
  color: $text-secondary;
}

.teacher-review-count {
  font-size: $font-xs;
  color: $text-tertiary;
}

/* ========== 评分维度 ========== */
.ratings-section {
  background: $bg-card;
  margin: $space-4 $space-5;
  border-radius: $radius-lg;
  padding: $space-5;
  box-shadow: $shadow-sm;
}

.rating-dim {
  margin-bottom: $space-4;

  &:last-child {
    margin-bottom: 0;
  }
}

.dim-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: $space-2;
}

.dim-label {
  font-size: $font-sm;
  color: $text-primary;
  font-weight: $font-medium;
}

.dim-value {
  font-size: $font-sm;
  font-weight: $font-bold;
  color: $text-secondary;

  &.highlight {
    color: $warning;
  }
}

.dim-bar-bg {
  height: 12rpx;
  background: $bg-page;
  border-radius: $radius-full;
  overflow: hidden;
}

.dim-bar-fill {
  height: 100%;
  border-radius: $radius-full;
  transition: width 0.5s ease;
  min-width: 4rpx;
}

/* ========== 操作栏 ========== */
.action-bar {
  padding: 0 $space-5 $space-3;
}

.review-btn {
  width: 100%;
  height: 88rpx;
  background: $primary;
  color: #fff;
  font-size: $font-base;
  font-weight: $font-semibold;
  border-radius: $radius-full;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-primary;

  &:active {
    transform: scale(0.98);
  }
}

/* ========== 评价列表 ========== */
.reviews-section {
  padding: 0 $space-5;
}

.section-title {
  font-size: $font-base;
  font-weight: $font-bold;
  color: $text-primary;
  display: block;
  margin-bottom: $space-4;
}

.review-card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-4;
  margin-bottom: $space-3;
  border: 1rpx solid $border-light;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: $space-2;
}

.review-course {
  font-size: $font-sm;
  font-weight: $font-semibold;
  color: $text-primary;
}

.review-time {
  font-size: $font-xs;
  color: $text-tertiary;
}

.review-scores {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
  margin-bottom: $space-2;
}

.score-item {
  font-size: $font-xs;
  color: $text-secondary;
  background: $bg-page;
  padding: 2rpx $space-2;
  border-radius: $radius-sm;
}

.review-comment {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.6;
}

.empty-hint {
  text-align: center;
  padding: $space-10 0;

  text {
    font-size: $font-sm;
    color: $text-tertiary;
  }
}

.load-more {
  text-align: center;
  padding: $space-4;
  font-size: $font-sm;
  color: $primary;
}
</style>
