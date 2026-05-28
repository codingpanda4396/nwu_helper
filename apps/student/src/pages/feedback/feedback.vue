<template>
  <view class="page">
    <view class="feedback-form">
      <view class="form-header">
        <text class="form-title">同学希望学校周边有什么？</text>
        <text class="form-desc">你的建议是我们招商的重要依据</text>
      </view>

      <view class="form-group">
        <text class="form-label">反馈类型</text>
        <view class="type-tags">
          <text v-for="type in feedbackTypes" :key="type.value" 
            :class="['type-tag', { active: selectedType === type.value }]"
            @click="selectedType = type.value">
            {{ type.label }}
          </text>
        </view>
      </view>

      <view class="form-group">
        <text class="form-label">详细描述</text>
        <textarea class="form-textarea" v-model="content" placeholder="告诉我们你的想法..." maxlength="500" />
        <text class="char-count">{{ content.length }}/500</text>
      </view>

      <view class="form-group">
        <text class="form-label">联系方式（选填）</text>
        <input class="form-input" v-model="contact" placeholder="微信/手机号，方便我们联系你" />
      </view>

      <button class="submit-btn" :disabled="!content.trim()" @click="submitFeedback">提交反馈</button>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { publicApi } from '@/api/index'

const content = ref('')
const contact = ref('')
const selectedType = ref('SUGGESTION')
const uToast = ref<any>(null)

const feedbackTypes = [
  { value: 'SUGGESTION', label: '建议' },
  { value: 'COMPLAINT', label: '投诉' },
  { value: 'COOPERATION', label: '合作' },
  { value: 'OTHER', label: '其他' }
]

async function submitFeedback() {
  if (!content.value.trim()) return
  
  try {
    await publicApi('/api/public/feedback', {
      type: selectedType.value,
      content: content.value,
      contact: contact.value || undefined
    })
    uToast.value.show({ title: '感谢你的反馈！', type: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } catch (err) {
    uToast.value.show({ title: '提交失败，请稍后重试', type: 'error' })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F9FAFB;
}

.feedback-form {
  padding: 30rpx;
}

.form-header {
  margin-bottom: 40rpx;
}

.form-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 12rpx;
}

.form-desc {
  display: block;
  font-size: 24rpx;
  color: #6B7280;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #1F2937;
  margin-bottom: 16rpx;
}

.type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.type-tag {
  padding: 12rpx 24rpx;
  background: #ffffff;
  border-radius: 32rpx;
  font-size: 24rpx;
  color: #6B7280;
  border: 2rpx solid #E5E7EB;

  &.active {
    background: #D1FAE5;
    color: #10B981;
    border-color: #10B981;
  }
}

.form-textarea {
  width: 100%;
  height: 240rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #1F2937;
  box-sizing: border-box;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #9CA3AF;
  margin-top: 8rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #1F2937;
  box-sizing: border-box;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #10B981;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 44rpx;
  margin-top: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.5;
  }
}
</style>
