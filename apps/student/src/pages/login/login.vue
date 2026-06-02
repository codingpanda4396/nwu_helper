<template>
  <view class="page">
    <view class="login-card">
      <view class="login-header">
        <image class="login-logo" src="/static/logo.png" mode="aspectFit" />
        <text class="login-title">西大圈</text>
        <text class="login-subtitle">登录后享受更多服务</text>
      </view>

      <!-- H5: 手机号 + 验证码登录 -->
      <!-- #ifdef H5 -->
      <view class="login-form">
        <view class="input-group">
          <u-icon name="phone" size="20" color="#9AA1AA" />
          <input
            class="input-field"
            v-model="phone"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
          />
        </view>
        <view class="input-group">
          <u-icon name="lock" size="20" color="#9AA1AA" />
          <input
            class="input-field input-code"
            v-model="code"
            type="number"
            maxlength="6"
            placeholder="请输入验证码"
          />
          <button
            class="sms-btn"
            :disabled="countdown > 0 || !phone"
            :class="{ 'sms-btn--active': phone && countdown === 0 }"
            @click="sendSms"
          >
            {{ countdown > 0 ? `${countdown}s后重发` : '获取验证码' }}
          </button>
        </view>
        <button class="login-btn" :disabled="loading" @click="handleSmsLogin">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </view>
      <!-- #endif -->

      <!-- MP-WEIXIN: 微信授权登录 -->
      <!-- #ifdef MP-WEIXIN -->
      <view class="login-form">
        <button class="wx-login-btn" :disabled="loading" @click="handleWxLogin">
          <image class="wx-icon" src="/static/icons/chat-active.svg" mode="aspectFit" />
          {{ loading ? '登录中...' : '微信授权登录' }}
        </button>
      </view>
      <!-- #endif -->

      <view class="login-footer">
        <text class="footer-text">登录即表示同意《用户协议》和《隐私政策》</text>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { publicWrite, userApi } from '@/api/index'
import { useAppStore } from '@/store/index'

const store = useAppStore()
const phone = ref('')
const code = ref('')
const countdown = ref(0)
const loading = ref(false)
const uToast = ref<any>(null)

let timer: ReturnType<typeof setInterval> | null = null

function showTip(message: string) {
  uToast.value?.show({ title: message, type: 'error' })
}

// #ifdef H5
async function sendSms() {
  if (!phone.value || countdown.value > 0) return
  try {
    await publicWrite('/api/auth/sms/send', { phone: phone.value })
    countdown.value = 60
    uToast.value?.show({ title: '验证码已发送', type: 'success' })
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (timer) clearInterval(timer)
        timer = null
      }
    }, 1000)
  } catch (e: any) {
    showTip(e.message || '发送失败')
  }
}

async function handleSmsLogin() {
  if (!phone.value || !code.value) {
    showTip('请输入手机号和验证码')
    return
  }
  loading.value = true
  try {
    const data = await publicWrite<{ token: string; user: any }>('/api/auth/sms/login', {
      phone: phone.value,
      code: code.value
    })
    store.setAuth(data.token, data.user)
    uni.navigateBack()
  } catch (e: any) {
    showTip(e.message || '登录失败')
  } finally {
    loading.value = false
  }
}
// #endif

// #ifdef MP-WEIXIN
async function handleWxLogin() {
  loading.value = true
  try {
    const loginRes = await uni.login()
    if (!loginRes.code) {
      showTip('获取微信授权失败')
      loading.value = false
      return
    }
    const data = await publicWrite<{ token: string; user: any }>('/api/auth/wx-login', {
      code: loginRes.code
    })
    store.setAuth(data.token, data.user)
    uni.navigateBack()
  } catch (e: any) {
    showTip(e.message || '微信登录失败')
  } finally {
    loading.value = false
  }
}
// #endif
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  min-height: 100vh;
  background: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.login-card {
  width: 100%;
  max-width: 640rpx;
  background: $bg-card;
  border-radius: $radius-xl;
  padding: 60rpx 48rpx;
  box-shadow: $shadow-md;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
}

.login-logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 24rpx;
  border-radius: $radius-xl;
}

.login-title {
  font-size: 40rpx;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: 8rpx;
}

.login-subtitle {
  font-size: $font-sm;
  color: $text-tertiary;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.input-group {
  display: flex;
  align-items: center;
  background: $bg-page;
  border-radius: $radius-lg;
  padding: 0 24rpx;
  height: 88rpx;
  border: 1rpx solid $border-light;
}

.input-field {
  flex: 1;
  margin-left: 16rpx;
  font-size: $font-base;
  color: $text-primary;
}

.input-code {
  max-width: 200rpx;
}

.sms-btn {
  flex-shrink: 0;
  padding: 0 20rpx;
  height: 56rpx;
  line-height: 56rpx;
  font-size: 24rpx;
  color: $text-tertiary;
  background: $border-light;
  border-radius: $radius-md;
  border: none;

  &--active {
    color: $primary;
    background: rgba($primary, 0.1);
  }

  &[disabled] {
    color: $text-tertiary;
    background: $border-light;
  }
}

.login-btn {
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
  font-weight: $font-semibold;
  color: #fff;
  background: $primary-gradient;
  border-radius: $radius-lg;
  border: none;
  margin-top: 16rpx;

  &[disabled] {
    opacity: 0.6;
  }
}

.wx-login-btn {
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
  font-weight: $font-semibold;
  color: #fff;
  background: #07C160;
  border-radius: $radius-lg;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;

  &[disabled] {
    opacity: 0.6;
  }
}

.wx-icon {
  width: 36rpx;
  height: 36rpx;
  filter: brightness(0) invert(1);
}

.login-footer {
  margin-top: 48rpx;
  text-align: center;
}

.footer-text {
  font-size: 22rpx;
  color: $text-tertiary;
}
</style>
