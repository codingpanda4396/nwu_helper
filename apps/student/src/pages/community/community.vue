<template>
  <view class="page">
    <!-- 分类筛选 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-tags">
          <text v-for="cat in categories" :key="cat" 
            :class="['filter-tag', { active: currentCategory === cat }]"
            @click="selectCategory(cat)">
            {{ cat }}
          </text>
        </view>
      </scroll-view>
    </view>

    <!-- 帖子列表 -->
    <view class="post-list">
      <view v-for="post in posts" :key="post.id" class="post-card" @click="openPost(post.id)">
        <view class="post-header">
          <view class="post-author">
            <u-icon name="account-fill" size="24" color="#10B981" />
            <text>{{ post.authorNickname || '匿名同学' }}</text>
          </view>
          <text class="post-time">{{ post.time }}</text>
        </view>
        <text class="post-title">{{ post.title }}</text>
        <text class="post-summary">{{ post.summary }}</text>
        <view class="post-footer">
          <view class="post-stat">
            <u-icon name="thumb-up" size="14" color="#9CA3AF" />
            <text>{{ post.likeCount }}</text>
          </view>
          <view class="post-stat">
            <u-icon name="eye" size="14" color="#9CA3AF" />
            <text>{{ post.viewCount }}</text>
          </view>
        </view>
      </view>

      <view v-if="posts.length === 0" class="empty-state">
        <text class="empty-title">暂无帖子</text>
        <text class="empty-desc">成为第一个发帖的人吧</text>
      </view>
    </view>

    <!-- 发帖按钮 -->
    <view class="fab-btn" @click="showPostForm = true">
      <u-icon name="edit-pen-fill" size="24" color="#ffffff" />
    </view>

    <!-- 发帖弹窗 -->
    <view v-if="showPostForm" class="post-modal">
      <view class="modal-mask" @click="showPostForm = false"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">发帖</text>
          <u-icon name="close" size="20" color="#9CA3AF" @click="showPostForm = false" />
        </view>
        <view class="form-group">
          <text class="form-label">帖子类型</text>
          <view class="type-tags">
            <text v-for="type in postTypes" :key="type" 
              :class="['type-tag', { active: newPost.type === type }]"
              @click="newPost.type = type">
              {{ type }}
            </text>
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
        <button class="submit-btn" :disabled="!newPost.title || !newPost.content" @click="submitPost">发布</button>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { publicApi } from '@/api/index'

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
    await publicApi('/api/public/community/posts', {
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
.page {
  min-height: 100vh;
  background: #F9FAFB;
  padding-bottom: 120rpx;
}

.filter-bar {
  background: #ffffff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F3F4F6;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-tags {
  display: inline-flex;
  gap: 16rpx;
  padding: 0 24rpx;
}

.filter-tag {
  padding: 12rpx 24rpx;
  background: #F3F4F6;
  border-radius: 32rpx;
  font-size: 24rpx;
  color: #6B7280;
  display: inline-block;

  &.active {
    background: #D1FAE5;
    color: #10B981;
  }
}

.post-list {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.post-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 8rpx;

  text {
    font-size: 24rpx;
    color: #6B7280;
  }
}

.post-time {
  font-size: 22rpx;
  color: #9CA3AF;
}

.post-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 12rpx;
}

.post-summary {
  display: block;
  font-size: 24rpx;
  color: #6B7280;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  gap: 24rpx;
}

.post-stat {
  display: flex;
  align-items: center;
  gap: 6rpx;

  text {
    font-size: 22rpx;
    color: #9CA3AF;
  }
}

.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 12rpx;
}

.empty-desc {
  display: block;
  font-size: 24rpx;
  color: #9CA3AF;
}

.fab-btn {
  position: fixed;
  right: 30rpx;
  bottom: 200rpx;
  width: 100rpx;
  height: 100rpx;
  background: #10B981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(16, 185, 129, 0.4);
}

.post-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1F2937;
}

.form-group {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 26rpx;
  font-weight: 500;
  color: #1F2937;
  margin-bottom: 12rpx;
}

.type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.type-tag {
  padding: 10rpx 20rpx;
  background: #F3F4F6;
  border-radius: 24rpx;
  font-size: 22rpx;
  color: #6B7280;

  &.active {
    background: #D1FAE5;
    color: #10B981;
  }
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #1F2937;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  height: 200rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  padding: 20rpx;
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
  margin-top: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.5;
  }
}
</style>
