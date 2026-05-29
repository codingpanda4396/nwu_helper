<template>
  <view class="page">
    <!-- 分类筛选 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll" :show-scrollbar="false">
        <view class="filter-tags">
          <view v-for="cat in categories" :key="cat" 
            :class="['filter-tag', { 'filter-tag--active': currentCategory === cat }]"
            @click="selectCategory(cat)">
            <text>{{ cat }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 帖子列表 -->
    <view class="post-list">
      <view v-for="(post, index) in posts" :key="post.id" 
        :class="['post-card', 'tap-active', `slide-up stagger-${index + 1}`]" 
        @click="openPost(post.id)">
        <view class="post-header">
          <view class="post-author">
            <view class="post-avatar">
              <u-icon name="account-fill" size="16" color="#FFFFFF" />
            </view>
            <view class="post-author-info">
              <text class="post-author-name">{{ post.authorNickname || '匿名同学' }}</text>
              <text class="post-time">{{ post.time }}</text>
            </view>
          </view>
          <view class="post-type-tag">
            <text>{{ post.type }}</text>
          </view>
        </view>
        <text class="post-title">{{ post.title }}</text>
        <text class="post-summary">{{ post.summary }}</text>
        <view class="post-footer">
          <view class="post-stat tap-active">
            <u-icon name="thumb-up" size="14" color="#9CA3AF" />
            <text>{{ post.likeCount }}</text>
          </view>
          <view class="post-stat">
            <u-icon name="eye" size="14" color="#9CA3AF" />
            <text>{{ post.viewCount }}</text>
          </view>
          <view class="post-stat">
            <u-icon name="chat" size="14" color="#9CA3AF" />
            <text>评论</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <EmptyState 
        v-if="posts.length === 0" 
        icon="edit-pen"
        title="暂无帖子" 
        description="成为第一个发帖的人吧"
        action-text="去发帖"
        @action="showPostForm = true"
      />
    </view>

    <!-- 发帖按钮 -->
    <view class="fab-btn tap-active" @click="showPostForm = true">
      <u-icon name="edit-pen-fill" size="28" color="#ffffff" />
    </view>

    <!-- 发帖弹窗 -->
    <view v-if="showPostForm" class="post-modal">
      <view class="modal-mask" @click="showPostForm = false"></view>
      <view class="modal-content slide-up">
        <view class="modal-header">
          <text class="modal-title">发帖</text>
          <view class="modal-close tap-active" @click="showPostForm = false">
            <u-icon name="close" size="16" color="#9CA3AF" />
          </view>
        </view>
        
        <view class="form-group">
          <text class="form-label">帖子类型</text>
          <view class="type-tags">
            <view v-for="type in postTypes" :key="type" 
              :class="['type-tag', { 'type-tag--active': newPost.type === type }]"
              @click="newPost.type = type">
              <text>{{ type }}</text>
            </view>
          </view>
        </view>
        
        <view class="form-group">
          <text class="form-label">标题</text>
          <input class="form-input" v-model="newPost.title" placeholder="请输入标题" />
        </view>
        
        <view class="form-group">
          <text class="form-label">内容</text>
          <textarea class="form-textarea" v-model="newPost.content" placeholder="说点什么..." maxlength="500" />
        </view>
        
        <view class="form-group">
          <text class="form-label">昵称（选填）</text>
          <input class="form-input" v-model="newPost.nickname" placeholder="不填则匿名" />
        </view>
        
        <button class="submit-btn tap-active" :disabled="!newPost.title || !newPost.content" @click="submitPost">
          <text>发布</text>
        </button>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { publicApi, publicWrite, trackActivity } from '@/api/index'
import EmptyState from '@/components/EmptyState.vue'

interface Post {
  id: string
  type: string
  title: string
  summary: string
  authorNickname?: string
  likeCount: number
  viewCount: number
  time: string
}

const posts = ref<Post[]>([])
const showPostForm = ref(false)
const currentCategory = ref('全部')
const uToast = ref<any>(null)

const newPost = ref({
  type: '校园讨论',
  title: '',
  content: '',
  nickname: ''
})

const categories = ['全部', '校园讨论', '避坑指南', '美食推荐', '求助']
const postTypes = ['校园讨论', '避坑指南', '美食推荐', '求助']

onMounted(async () => {
  trackActivity('page_view', '/community')
  await fetchPosts()
})

async function fetchPosts() {
  try {
    const type = currentCategory.value === '全部' ? '' : currentCategory.value
    const data = await publicApi<Post[]>('/api/public/community/posts' + (type ? `?type=${type}` : ''))
    posts.value = data || []
  } catch (err) {
    posts.value = []
  }
}

function selectCategory(cat: string) {
  currentCategory.value = cat
  fetchPosts()
}

function openPost(id: string) {
  uni.navigateTo({ url: `/pages/post/post?id=${encodeURIComponent(id)}` })
}

async function submitPost() {
  if (!newPost.value.title || !newPost.value.content) return
  
  try {
    await publicWrite('/api/public/community/posts', {
      type: newPost.value.type,
      title: newPost.value.title,
      content: newPost.value.content,
      authorNickname: newPost.value.nickname || '匿名同学'
    })
    uToast.value.show({ title: '发布成功，等待审核', type: 'success' })
    showPostForm.value = false
    newPost.value = { type: '校园讨论', title: '', content: '', nickname: '' }
    fetchPosts()
  } catch (err) {
    uToast.value.show({ title: '发布失败', type: 'error' })
  }
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  min-height: 100vh;
  background: $bg-page;
  padding-bottom: 120rpx;
}

/* ========== 分类筛选 ========== */
.filter-bar {
  background: $bg-card;
  padding: $space-4 0;
  border-bottom: 1rpx solid $border-light;
  position: sticky;
  top: 0;
  z-index: 100;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-tags {
  display: inline-flex;
  gap: $space-3;
  padding: 0 $space-5;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  padding: $space-2 $space-4;
  background: $bg-page;
  border-radius: $radius-full;
  font-size: $font-sm;
  color: $text-secondary;
  transition: all $transition-base;

  &--active {
    background: $primary-gradient;
    color: $text-inverse;
    box-shadow: $shadow-primary;
  }

  &:active {
    transform: scale(0.95);
  }
}

/* ========== 帖子列表 ========== */
.post-list {
  padding: $space-4 $space-5;
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.post-card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-5;
  box-shadow: $shadow-md;
  transition: all $transition-base;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-sm;
  }
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $space-4;
}

.post-author {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.post-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: $radius-full;
  background: $primary-gradient;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-author-info {
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.post-author-name {
  font-size: $font-sm;
  color: $text-primary;
  font-weight: $font-medium;
}

.post-time {
  font-size: $font-xs;
  color: $text-tertiary;
}

.post-type-tag {
  padding: $space-1 $space-3;
  background: $primary-bg;
  border-radius: $radius-full;

  text {
    font-size: $font-xs;
    color: $primary;
    font-weight: $font-medium;
  }
}

.post-title {
  display: block;
  font-size: $font-base;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $space-2;
}

.post-summary {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: $space-4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
}

.post-footer {
  display: flex;
  gap: $space-6;
  padding-top: $space-4;
  border-top: 1rpx solid $border-light;
}

.post-stat {
  display: flex;
  align-items: center;
  gap: $space-2;

  text {
    font-size: $font-xs;
    color: $text-tertiary;
  }
}

/* ========== 发帖按钮 ========== */
.fab-btn {
  position: fixed;
  right: $space-6;
  bottom: 200rpx;
  width: 112rpx;
  height: 112rpx;
  background: $primary-gradient;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(16, 185, 129, 0.4);
  z-index: 50;

  &:active {
    transform: scale(0.9);
  }
}

/* ========== 发帖弹窗 ========== */
.post-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $bg-mask;
}

.modal-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: $bg-card;
  border-radius: $radius-xl $radius-xl 0 0;
  padding: $space-6;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-6;
}

.modal-title {
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
}

.modal-close {
  width: 56rpx;
  height: 56rpx;
  border-radius: $radius-full;
  background: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
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

.type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
}

.type-tag {
  display: inline-flex;
  align-items: center;
  padding: $space-2 $space-4;
  background: $bg-page;
  border-radius: $radius-full;
  font-size: $font-xs;
  color: $text-secondary;
  transition: all $transition-base;

  &--active {
    background: $primary-gradient;
    color: $text-inverse;
  }
}

.form-input {
  width: 100%;
  height: 88rpx;
  background: $bg-page;
  border-radius: $radius-md;
  padding: 0 $space-4;
  font-size: $font-base;
  color: $text-primary;
  box-sizing: border-box;
  border: 2rpx solid transparent;
  transition: all $transition-base;

  &:focus {
    border-color: $primary;
    background: $bg-card;
  }
}

.form-textarea {
  width: 100%;
  height: 200rpx;
  background: $bg-page;
  border-radius: $radius-md;
  padding: $space-4;
  font-size: $font-base;
  color: $text-primary;
  box-sizing: border-box;
  border: 2rpx solid transparent;
  transition: all $transition-base;

  &:focus {
    border-color: $primary;
    background: $bg-card;
  }
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  background: $primary-gradient;
  color: $text-inverse;
  font-size: $font-base;
  font-weight: $font-semibold;
  border-radius: $radius-full;
  margin-top: $space-6;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-primary;
  border: none;

  &:disabled {
    opacity: 0.5;
    box-shadow: none;
  }

  &:active {
    transform: scale(0.98);
  }
}
</style>
