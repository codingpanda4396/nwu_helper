<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import 'uview-plus/index.scss';

page {
  background-color: #FAF8F4;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ========== 全局工具类 ========== */
.container {
  padding: 24rpx;
}

.card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #F1EADF;
  box-shadow: 0 8rpx 24rpx rgba(46, 36, 22, 0.06);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #22252A;
  margin-bottom: 20rpx;
}

/* ========== 动画类 ========== */
.fade-in {
  animation: fadeIn 0.3s ease forwards;
}

.slide-up {
  animation: slideUp 0.3s ease forwards;
}

.scale-in {
  animation: scaleIn 0.2s ease forwards;
}

/* 依次入场动画 */
.stagger-1 { animation-delay: 0.05s; opacity: 0; }
.stagger-2 { animation-delay: 0.1s; opacity: 0; }
.stagger-3 { animation-delay: 0.15s; opacity: 0; }
.stagger-4 { animation-delay: 0.2s; opacity: 0; }
.stagger-5 { animation-delay: 0.25s; opacity: 0; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

/* ========== 交互反馈 ========== */
.tap-active {
  transition: all 0.15s ease;
}

.tap-active:active {
  transform: scale(0.95);
  opacity: 0.8;
}

/* ========== 渐变文字 ========== */
.gradient-text {
  background: linear-gradient(135deg, #35C98D 0%, #0B8F63 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
