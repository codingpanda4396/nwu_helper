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
import { publicWrite } from '@/api/index'

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
    await publicWrite('/api/public/feedback', {
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
@import '../../uni.scss';

.page {
  min-height: 100vh;
  background: $bg-page;
}

.feedback-form {
  padding: 30rpx;
}

.form-header {
  margin-bottom: 40rpx;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-lg;
  padding: 30rpx;
  box-shadow: $shadow-sm;
}

.form-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.form-desc {
  display: block;
  font-size: 24rpx;
  color: $text-secondary;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: $text-primary;
  margin-bottom: 16rpx;
}

.type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.type-tag {
  padding: 12rpx 24rpx;
  background: $bg-card;
  border-radius: $radius-full;
  font-size: $font-sm;
  color: $text-secondary;
  border: 2rpx solid $border;

  &.active {
    background: $primary-bg;
    color: $primary;
    border-color: rgba(22, 168, 115, 0.28);
  }
}

.form-textarea {
  width: 100%;
  height: 240rpx;
  background: $bg-card;
  border-radius: $radius-lg;
  padding: 20rpx;
  font-size: 28rpx;
  color: $text-primary;
  border: 1rpx solid $border-light;
  box-sizing: border-box;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: $text-tertiary;
  margin-top: 8rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: $bg-card;
  border-radius: $radius-lg;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: $text-primary;
  border: 1rpx solid $border-light;
  box-sizing: border-box;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: $primary;
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
