<template>
  <view class="page">
    <view class="form-card">
      <text class="form-title">添加教师</text>
      <text class="form-desc">添加你认识的老师，审核通过后即可供大家评价</text>

      <view class="form-group">
        <text class="form-label">教师姓名 *</text>
        <input class="form-input" v-model="name" placeholder="请输入教师姓名" />
      </view>

      <view class="form-group">
        <text class="form-label">所属学院</text>
        <input class="form-input" v-model="college" placeholder="例如：信息科学与技术学院" />
      </view>

      <view class="form-group">
        <text class="form-label">系别</text>
        <input class="form-input" v-model="department" placeholder="例如：计算机科学系" />
      </view>

      <button class="submit-btn tap-active" :disabled="!name.trim() || submitting" @click="submitTeacher">
        <text>{{ submitting ? '提交中...' : '提交审核' }}</text>
      </button>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userWrite, trackActivity } from '@/api/index'
import { useAppStore } from '@/store/index'

const store = useAppStore()
const name = ref('')
const college = ref('')
const department = ref('')
const submitting = ref(false)
const uToast = ref<any>(null)

onMounted(() => {
  trackActivity('page_view', '/academic/add-teacher')
})

async function submitTeacher() {
  if (!name.value.trim()) {
    uToast.value?.show({ title: '请输入教师姓名', type: 'warning' })
    return
  }
  if (!store.isLogin) {
    uToast.value?.show({ title: '请先登录', type: 'warning' })
    return
  }
  submitting.value = true
  try {
    await userWrite('/api/user/teachers', {
      name: name.value.trim(),
      college: college.value.trim(),
      department: department.value.trim(),
    })
    uToast.value?.show({ title: '提交成功，审核后展示', type: 'success' })
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
  margin-bottom: $space-2;
}

.form-desc {
  font-size: $font-xs;
  color: $text-tertiary;
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
  margin-top: $space-4;

  &:disabled {
    opacity: 0.5;
  }

  &:active {
    transform: scale(0.98);
  }
}
</style>
