<template>
  <view class="page">
    <view class="form-card">
      <text class="form-title">上传复习资料</text>

      <!-- 选择课程 -->
      <view class="form-group">
        <text class="form-label">所属课程 *</text>
        <picker mode="selector" :range="courseLabels" @change="onCourseChange">
          <view class="picker-display">
            <text :class="{ placeholder: !selectedCourseId }">{{ selectedCourseId ? courseLabels[courseIndex] : '请选择课程' }}</text>
            <u-icon name="arrow-down" size="14" color="#9AA1AA" />
          </view>
        </picker>
      </view>

      <!-- 标题 -->
      <view class="form-group">
        <text class="form-label">资料标题 *</text>
        <input class="form-input" v-model="title" placeholder="例如：高等数学期末复习笔记" />
      </view>

      <!-- 描述 -->
      <view class="form-group">
        <text class="form-label">资料描述</text>
        <textarea class="form-textarea" v-model="description" placeholder="简要描述资料内容..." maxlength="2000" />
      </view>

      <!-- 上传文件列表 -->
      <view class="form-group">
        <text class="form-label">文件（已选 {{ uploadedFiles.length }} 个）</text>
        <view v-for="(f, idx) in uploadedFiles" :key="idx" class="file-tag">
          <text>{{ f.fileName }}</text>
          <text class="file-remove tap-active" @click="removeFile(idx)">✕</text>
        </view>
      </view>

      <button class="submit-btn tap-active" :disabled="!title.trim() || !selectedCourseId || submitting" @click="submitMaterial">
        <text>{{ submitting ? '提交中...' : '提交审核' }}</text>
      </button>
      <text class="hint-text">资料提交后需管理员审核才能公开</text>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { publicApi, userWrite, trackActivity } from '@/api/index'

const title = ref('')
const description = ref('')
const submitting = ref(false)
const uToast = ref<any>(null)

// Courses
interface Course {
  id: string
  name: string
  teacherName: string
}
const courses = ref<Course[]>([])
const selectedCourseId = ref('')
const courseIndex = ref(0)
const courseLabels = ref<string[]>([])

// Uploaded files
const uploadedFiles = ref<{ fileName: string; fileKey: string; fileUrl: string; fileSize: number; mimeType: string }[]>([])

onMounted(async () => {
  trackActivity('page_view', '/academic/material-upload')
  try {
    const data = await publicApi<any>('/api/public/courses?page=1&pageSize=100')
    courses.value = data?.items || []
    courseLabels.value = courses.value.map((c) => `${c.name} (${c.teacherName})`)
  } catch {}
})

function onCourseChange(e: any) {
  const idx = e.detail.value
  courseIndex.value = idx
  selectedCourseId.value = courses.value[idx]?.id || ''
}

function removeFile(idx: number) {
  uploadedFiles.value.splice(idx, 1)
}

async function submitMaterial() {
  if (!title.value.trim()) {
    uToast.value?.show({ title: '请输入资料标题', type: 'warning' })
    return
  }
  if (!selectedCourseId.value) {
    uToast.value?.show({ title: '请选择所属课程', type: 'warning' })
    return
  }
  submitting.value = true
  try {
    await userWrite('/api/user/materials', {
      title: title.value.trim(),
      description: description.value.trim(),
      courseId: selectedCourseId.value,
      files: uploadedFiles.value,
    })
    uToast.value?.show({ title: '资料提交成功，审核后展示', type: 'success' })
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

.form-title {
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
  display: block;
  margin-bottom: $space-6;
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

.picker-display {
  width: 100%;
  height: 80rpx;
  background: $bg-page;
  border-radius: $radius-md;
  padding: 0 $space-4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: $font-base;

  .placeholder {
    color: $text-tertiary;
  }
}

.form-textarea {
  width: 100%;
  height: 160rpx;
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

.file-tag {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-2 $space-3;
  background: $primary-bg;
  border-radius: $radius-md;
  font-size: $font-xs;
  color: $primary;
  margin-bottom: $space-2;
}

.file-remove {
  color: $text-tertiary;
  padding: 4rpx;
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
