<template>
  <view class="page">
    <view class="form-card">
      <view class="teacher-preview">
        <text class="preview-label">评价教师</text>
        <text class="preview-name">{{ teacherName }}</text>
      </view>

      <!-- 课程名 -->
      <view class="form-group">
        <text class="form-label">课程名称</text>
        <input class="form-input" v-model="courseName" placeholder="例如：高等数学" />
      </view>

      <!-- 评分维度 -->
      <view class="form-group" v-for="dim in dimensions" :key="dim.key">
        <text class="form-label">{{ dim.label }}</text>
        <view class="star-row">
          <view
            v-for="n in 5" :key="n"
            :class="['star-btn', { 'star-btn--active': n <= form[dim.key] }]"
            @click="form[dim.key] = n"
          >
            <text>{{ n <= form[dim.key] ? '⭐' : '☆' }}</text>
          </view>
          <text class="star-hint">{{ hints[form[dim.key] - 1] || '' }}</text>
        </view>
      </view>

      <!-- 文字评价 -->
      <view class="form-group">
        <text class="form-label">文字评价（选填）</text>
        <textarea class="form-textarea" v-model="comment" placeholder="写下你的评价心得..." maxlength="2000" />
      </view>

      <button class="submit-btn tap-active" :disabled="!courseName" @click="submitReview">
        <text>{{ submitting ? '提交中...' : '匿名提交评价' }}</text>
      </button>
      <text class="hint-text">评价将以匿名方式发布，你的身份不会公开</text>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userWrite, trackActivity } from '@/api/index'

const teacherId = ref('')
const teacherName = ref('')
const courseName = ref('')
const comment = ref('')
const submitting = ref(false)
const uToast = ref<any>(null)

const form = ref<Record<string, number>>({
  grading: 3,
  attendance: 3,
  difficulty: 3,
  recommend: 3,
  examFocus: 3,
})

const dimensions = [
  { key: 'grading', label: '给分好坏' },
  { key: 'attendance', label: '点名频率' },
  { key: 'difficulty', label: '课程难度' },
  { key: 'recommend', label: '推荐指数' },
  { key: 'examFocus', label: '考试重点' },
]

const hints = ['很差', '较差', '一般', '不错', '很好']

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  teacherId.value = currentPage?.options?.teacherId || ''
  teacherName.value = decodeURIComponent(currentPage?.options?.teacherName || '')
  trackActivity('page_view', '/academic/review-form')
})

async function submitReview() {
  if (!courseName.value.trim()) {
    uToast.value?.show({ title: '请输入课程名称', type: 'warning' })
    return
  }
  submitting.value = true
  try {
    await userWrite('/api/user/reviews', {
      teacherId: teacherId.value,
      courseName: courseName.value.trim(),
      ...form.value,
      comment: comment.value.trim(),
    })
    uToast.value?.show({ title: '评价提交成功，审核后展示', type: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (err: any) {
    uToast.value?.show({ title: err.message || '提交失败', type: 'error' })
  }
  submitting.value = false
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  min-height: 100vh;
  background: $bg-page;
  padding: $space-5;
}

.form-card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-5;
  box-shadow: $shadow-sm;
}

.teacher-preview {
  text-align: center;
  padding: $space-4 0 $space-5;
  border-bottom: 1rpx solid $border-light;
  margin-bottom: $space-5;
}

.preview-label {
  display: block;
  font-size: $font-xs;
  color: $text-tertiary;
  margin-bottom: $space-1;
}

.preview-name {
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
}

.form-group {
  margin-bottom: $space-5;
}

.form-label {
  display: block;
  font-size: $font-sm;
  font-weight: $font-medium;
  color: $text-primary;
  margin-bottom: $space-3;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: $bg-page;
  border-radius: $radius-md;
  padding: 0 $space-4;
  font-size: $font-base;
  color: $text-primary;
  box-sizing: border-box;
  border: 2rpx solid transparent;

  &:focus {
    border-color: $primary;
  }
}

.star-row {
  display: flex;
  align-items: center;
  gap: $space-2;
  flex-wrap: wrap;
}

.star-btn {
  font-size: 36rpx;
  padding: 4rpx;
  transition: transform 0.15s;

  &:active {
    transform: scale(1.2);
  }
}

.star-hint {
  font-size: $font-xs;
  color: $text-tertiary;
  margin-left: $space-2;
}

.form-textarea {
  width: 100%;
  height: 180rpx;
  background: $bg-page;
  border-radius: $radius-md;
  padding: $space-4;
  font-size: $font-base;
  color: $text-primary;
  box-sizing: border-box;
  border: 2rpx solid transparent;

  &:focus {
    border-color: $primary;
  }
}

.submit-btn {
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
  margin-bottom: $space-3;

  &:disabled {
    opacity: 0.5;
  }

  &:active {
    transform: scale(0.98);
  }
}

.hint-text {
  display: block;
  text-align: center;
  font-size: $font-xs;
  color: $text-tertiary;
}
</style>
