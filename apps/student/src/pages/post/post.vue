<template>
  <view class="page">
    <view class="back-bar">
      <u-button type="default" size="small" @click="goBack">
        <u-icon name="arrow-left" size="14" />
        <text style="margin-left: 8rpx;">返回讨论区</text>
      </u-button>
    </view>

    <view v-if="loading" class="loading-state">
      <text>帖子加载中...</text>
    </view>

    <view v-if="!loading && !post" class="error-state">
      <text>帖子暂时不可查看。</text>
    </view>

    <view v-if="post" class="post-detail">
      <view class="post-tag">
        <text>{{ post.type }}</text>
      </view>
      <text class="post-title">{{ post.title }}</text>

      <!-- 图片展示 -->
      <view v-if="post.images && post.images.length > 0" class="post-images">
        <image
          v-for="(img, idx) in post.images"
          :key="idx"
          :src="img"
          mode="aspectFill"
          class="post-image"
          @click="previewImage(idx)"
        />
      </view>

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
        <view class="action-btn tap-active" @click="handleLike">
          <u-icon :name="liked ? 'thumb-up-fill' : 'thumb-up'" :size="18" :color="liked ? '#16A873' : '#9AA1AA'" />
          <text :style="{ color: liked ? '#16A873' : '#9AA1AA' }">{{ likeCount }}</text>
        </view>
        <view class="action-item">
          <u-icon name="chat" size="18" color="#9AA1AA" />
          <text>{{ comments.length }}</text>
        </view>
      </view>
    </view>

    <!-- 评论区 -->
    <view v-if="post" class="comments-section">
      <view class="comments-header">
        <text class="comments-title">评论 ({{ comments.length }})</text>
      </view>

      <view v-if="comments.length === 0" class="no-comments">
        <text>暂无评论，来说两句吧</text>
      </view>

      <view v-for="c in comments" :key="c.id" class="comment-item">
        <view class="comment-header">
          <text class="comment-author">{{ c.authorNickname || '匿名用户' }}</text>
          <text class="comment-time">{{ formatCommentTime(c.time) }}</text>
        </view>
        <text class="comment-content">{{ c.content }}</text>
        <view v-if="c.replies && c.replies.length > 0" class="comment-replies">
          <view v-for="r in c.replies" :key="r.id" class="reply-item">
            <text class="reply-author">{{ r.authorNickname || '匿名用户' }}</text>
            <text class="reply-content">{{ r.content }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部评论输入 -->
    <view v-if="post" class="comment-input-bar">
      <input
        ref="commentInput"
        class="comment-input"
        v-model="commentText"
        placeholder="写评论..."
        confirm-type="send"
        @confirm="submitComment"
      />
      <view class="send-btn tap-active" @click="submitComment">
        <u-icon name="arrow-right" size="18" color="#fff" />
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { publicApi, userWrite } from '@/api/index'

interface CommentItem {
  id: string
  parentId?: string
  authorUserId?: string
  authorNickname?: string
  content: string
  likeCount: number
  time: string
  replies?: CommentItem[]
}

interface Post {
  id: string
  type: string
  title: string
  summary: string
  content?: string
  authorNickname?: string
  images?: string[]
  likeCount?: number
  commentCount?: number
  viewCount?: number
  time?: string
}

const post = ref<Post | null>(null)
const comments = ref<CommentItem[]>([])
const loading = ref(true)
const liked = ref(false)
const likeCount = ref(0)
const commentText = ref('')
const commentInput = ref<any>(null)
const uToast = ref<any>(null)

onLoad((options) => {
  if (options?.id) {
    loadPost(options.id)
    loadComments(options.id)
  }
})

async function loadPost(id: string) {
  loading.value = true
  try {
    post.value = await publicApi<Post>(`/api/public/community/posts/${encodeURIComponent(id)}`)
    if (post.value) {
      likeCount.value = post.value.likeCount ?? 0
    }
  } catch (err) {
    post.value = null
  } finally {
    loading.value = false
  }
}

async function loadComments(id: string) {
  try {
    const data = await publicApi<CommentItem[]>(`/api/public/community/posts/${encodeURIComponent(id)}/comments`)
    comments.value = data || []
  } catch (err) {
    comments.value = []
  }
}

async function handleLike() {
  if (!post.value) return
  try {
    const result = await userWrite<{ liked: boolean; likeCount: number }>(
      `/api/public/community/posts/${encodeURIComponent(post.value.id)}/like`,
      {}
    )
    liked.value = result.liked
    likeCount.value = result.likeCount
  } catch (err: any) {
    uToast.value?.show({ title: '操作失败', type: 'error' })
  }
}

async function submitComment() {
  if (!commentText.value.trim() || !post.value) return
  try {
    await userWrite(
      `/api/public/community/posts/${encodeURIComponent(post.value.id)}/comments`,
      { content: commentText.value.trim() }
    )
    commentText.value = ''
    uToast.value?.show({ title: '评论成功', type: 'success' })
    loadComments(post.value.id)
  } catch (err: any) {
    uToast.value?.show({ title: '评论失败', type: 'error' })
  }
}

function focusComment() {
  nextTick(() => { /* triggers input focus */ })
}

function previewImage(index: number) {
  if (post.value?.images) {
    uni.previewImage({
      current: index,
      urls: post.value.images
    })
  }
}

function formatCommentTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${d.getMonth() + 1}月${d.getDate()}日`
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
  padding-bottom: 140rpx;
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

.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.post-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: $radius-md;
  background: $bg-page;
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
  gap: 48rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;

  text {
    font-size: $font-sm;
  }
}

.comments-section {
  margin: 0 24rpx 24rpx;
  padding: 30rpx;
  background: $bg-card;
  border-radius: $radius-lg;
  border: 1rpx solid $border-light;
}

.comments-header {
  margin-bottom: 24rpx;
}

.comments-title {
  font-size: $font-base;
  font-weight: $font-bold;
  color: $text-primary;
}

.no-comments {
  text-align: center;
  padding: 40rpx 0;

  text {
    font-size: $font-sm;
    color: $text-tertiary;
  }
}

.comment-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid $border-light;

  &:last-child {
    border-bottom: none;
  }
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.comment-author {
  font-size: $font-sm;
  font-weight: $font-medium;
  color: $primary;
}

.comment-time {
  font-size: $font-xs;
  color: $text-tertiary;
}

.comment-content {
  font-size: $font-base;
  color: $text-primary;
  line-height: 1.6;
}

.comment-replies {
  margin-top: 12rpx;
  padding-left: 24rpx;
  border-left: 2rpx solid $border-light;
}

.reply-item {
  padding: 12rpx 0;
}

.reply-author {
  font-size: $font-sm;
  color: $primary;
  margin-right: 8rpx;
}

.reply-content {
  font-size: $font-sm;
  color: $text-secondary;
}

.comment-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: $bg-card;
  border-top: 1rpx solid $border-light;
  z-index: 100;
}

.comment-input {
  flex: 1;
  height: 72rpx;
  background: $bg-page;
  border-radius: $radius-full;
  padding: 0 24rpx;
  font-size: $font-sm;
  color: $text-primary;
}

.send-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
