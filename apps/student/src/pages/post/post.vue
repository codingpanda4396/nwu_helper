<template>
  <view class="page">
    <!-- 返回按钮 -->
    <view class="back-bar">
      <u-button type="default" size="small" @click="goBack">
        <u-icon name="arrow-left" size="14" />
        <text style="margin-left: 8rpx;">返回讨论区</text>
      </u-button>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <text>帖子加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view v-if="!loading && !post" class="error-state">
      <text>帖子暂时不可查看。</text>
    </view>

    <!-- 帖子详情 -->
    <view v-if="post" class="post-detail">
      <view class="post-tag">
        <text>{{ post.type }}</text>
      </view>
      <text class="post-title">{{ post.title }}</text>
      <view class="post-meta">
        <view class="meta-item">
          <u-icon name="calendar" size="12" color="#999" />
          <text>{{ post.time }}</text>
        </view>
        <view class="meta-item">
          <u-icon name="account" size="12" color="#999" />
          <text>{{ post.authorNickname || '匿名同学' }}</text>
        </view>
        <view class="meta-item">
          <u-icon name="eye" size="12" color="#999" />
          <text>{{ post.viewCount ?? 0 }} 浏览</text>
        </view>
      </view>
      <view class="post-content">
        <text>{{ post.content || post.summary }}</text>
      </view>
      <view class="post-actions">
        <u-button 
          type="primary" 
          size="small" 
          :loading="liking"
          @click="likePost"
        >
          <u-icon name="thumb-up-fill" size="14" color="#fff" />
          <text style="margin-left: 8rpx;">点赞 {{ post.likeCount ?? 0 }}</text>
        </u-button>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { publicApi, publicWrite } from '@/api/index'
import { useAppStore } from '@/store/index'

interface Post {
  id: string
  type: string
  title: string
  summary: string
  content?: string
  authorNickname?: string
  likeCount?: number
  commentCount?: number
  viewCount?: number
  time?: string
}

const post = ref<Post | null>(null)
const loading = ref(true)
const liking = ref(false)
const uToast = ref<any>(null)
const appStore = useAppStore()

onLoad((options) => {
  if (options?.id) {
    loadPost(options.id)
  }
})

async function loadPost(id: string) {
  loading.value = true
  try {
    post.value = await publicApi<Post>(`/api/public/community/posts/${encodeURIComponent(id)}`)
  } catch (err) {
    post.value = null
  } finally {
    loading.value = false
  }
}

async function likePost() {
  if (!post.value || liking.value) return
  
  liking.value = true
  try {
    const sessionId = appStore.getSessionId()
    const result = await publicWrite<{ likeCount: number }>(
      `/api/public/community/posts/${encodeURIComponent(post.value.id)}/like`,
      { sessionId }
    )
    post.value.likeCount = result.likeCount
  } catch (err) {
    uToast.value.show({
      title: '点赞失败',
      type: 'error'
    })
  } finally {
    liking.value = false
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  min-height: 100vh;
  background: $bg-page;
  padding-bottom: 60rpx;
}

.back-bar {
  padding: 20rpx 30rpx;
  background: $bg-card-soft;
  border-bottom: 1rpx solid $border-light;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 100rpx 40rpx;
  
  text {
    font-size: $font-base;
    color: $text-tertiary;
  }
}

.post-detail {
  margin: 24rpx;
  padding: 30rpx;
  background: $bg-card;
  border-radius: $radius-lg;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
}

.post-tag {
  margin-bottom: 20rpx;
  
  text {
    font-size: $font-sm;
    color: $primary;
    background: $primary-bg;
    padding: 8rpx 20rpx;
    border-radius: 20rpx;
  }
}

.post-title {
  font-size: 40rpx;
  font-weight: bold;
  color: $text-primary;
  display: block;
  margin-bottom: 20rpx;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 30rpx;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid $border-light;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  
  text {
    font-size: $font-xs;
    color: $text-tertiary;
  }
}

.post-content {
  margin-bottom: 40rpx;
  
  text {
    font-size: 30rpx;
    color: $text-primary;
    line-height: 1.8;
  }
}

.post-actions {
  display: flex;
  justify-content: center;
}
</style>
