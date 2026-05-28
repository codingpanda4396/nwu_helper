<template>
  <view class="page">
    <!-- 页面头部 -->
    <view class="page-hero">
      <view class="hero-content">
        <view class="hero-tag">
          <u-icon name="chat-fill" size="14" color="#FF6B35" />
          <text>西大圈</text>
        </view>
        <text class="hero-title">校园讨论区</text>
        <text class="hero-desc">发布后进入后台审核，通过后公开展示。</text>
      </view>
      <u-button type="primary" size="small" @click="showForm = !showForm">
        <u-icon name="plus" size="14" color="#fff" />
        <text style="margin-left: 8rpx;">发布</text>
      </u-button>
    </view>

    <!-- 发布表单 -->
    <view v-if="showForm" class="form-section">
      <view class="post-form">
        <view class="form-row">
          <view class="form-item">
            <text class="form-label">类型</text>
            <input v-model="form.type" class="form-input" placeholder="请输入类型" />
          </view>
          <view class="form-item">
            <text class="form-label">昵称</text>
            <input v-model="form.authorNickname" class="form-input" placeholder="请输入昵称" />
          </view>
        </view>
        <view class="form-item">
          <text class="form-label">标题</text>
          <input v-model="form.title" class="form-input" placeholder="请输入标题" maxlength="80" />
        </view>
        <view class="form-item">
          <text class="form-label">正文</text>
          <textarea v-model="form.content" class="form-textarea" placeholder="请输入正文" maxlength="2000" />
        </view>
        <view class="form-item">
          <text class="form-label">联系方式</text>
          <input v-model="form.contact" class="form-input" placeholder="微信或手机号，仅后台可见" />
        </view>
        <view v-if="message" class="success-tip">{{ message }}</view>
        <view v-if="formError" class="error-tip">{{ formError }}</view>
        <u-button type="primary" @click="submitPost" :loading="submitting">
          <u-icon name="send" size="14" color="#fff" />
          <text style="margin-left: 8rpx;">提交审核</text>
        </u-button>
      </view>
    </view>

    <!-- 分类筛选 -->
    <view class="filter-section">
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-list">
          <view 
            v-for="type in communityTypes" 
            :key="type" 
            :class="['filter-item', { active: communityType === type }]"
            @click="communityType = type"
          >
            <text>{{ type }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 错误提示 -->
    <view v-if="error" class="error-tip">{{ error }}</view>

    <!-- 帖子列表 -->
    <view class="post-list">
      <view v-for="post in posts" :key="post.id" class="post-card" @click="openPost(post.id)">
        <view class="post-tag">
          <text>{{ post.type }}</text>
        </view>
        <text class="post-title">{{ post.title }}</text>
        <text class="post-summary">{{ post.summary }}</text>
        <view class="post-meta">
          <view class="meta-item">
            <u-icon name="calendar" size="12" color="#999" />
            <text>{{ post.time }}</text>
          </view>
          <view class="meta-item">
            <u-icon name="chat" size="12" color="#999" />
            <text>{{ post.commentCount ?? 0 }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="posts.length === 0 && !error" class="empty-state">
        <text class="empty-title">还没有内容</text>
        <text class="empty-desc">可以发布校园墙、拼饭、二手和信息投稿，审核后展示。</text>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { publicApi, publicWrite } from '@/api/index'

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

const communityTypes = ref<string[]>(['全部'])
const communityType = ref('全部')
const posts = ref<Post[]>([])
const error = ref('')
const showForm = ref(false)
const form = ref({
  type: '校园墙',
  title: '',
  content: '',
  authorNickname: '',
  contact: ''
})
const message = ref('')
const formError = ref('')
const submitting = ref(false)
const uToast = ref<any>(null)

const mockPosts: Post[] = [
  {
    id: 'mock-post-1',
    type: '校园墙',
    title: '北门夜宵哪家适合四人局？',
    summary: '想找能坐下聊天、价格别太离谱的店。',
    content: '想找能坐下聊天、价格别太离谱的店，欢迎推荐。',
    authorNickname: '同学A',
    likeCount: 12,
    commentCount: 3,
    viewCount: 98,
    time: '今天'
  }
]

onMounted(async () => {
  try {
    const types = await publicApi<string[]>('/api/public/community/types')
    communityTypes.value = types.length ? types : ['全部']
  } catch (err) {
    communityTypes.value = ['全部', '校园墙', '拼饭']
  }
  
  await loadPosts()
})

watch(communityType, () => {
  loadPosts()
})

async function loadPosts() {
  try {
    const data = await publicApi<Post[]>(`/api/public/community/posts?type=${encodeURIComponent(communityType.value)}`)
    posts.value = data || []
    error.value = ''
  } catch (err) {
    posts.value = mockPosts
    error.value = '当前使用本地试点数据。'
  }
}

async function submitPost() {
  if (!form.value.title || !form.value.content) {
    formError.value = '请填写标题和正文'
    return
  }
  
  submitting.value = true
  formError.value = ''
  message.value = ''
  
  try {
    await publicWrite('/api/public/community/posts', form.value)
    message.value = '投稿成功，审核后展示。'
    form.value = { type: '校园墙', title: '', content: '', authorNickname: '', contact: '' }
    setTimeout(() => {
      showForm.value = false
      loadPosts()
    }, 900)
  } catch (err) {
    formError.value = err instanceof Error ? err.message : '投稿失败'
  } finally {
    submitting.value = false
  }
}

function openPost(id: string) {
  uni.navigateTo({ url: `/pages/post/post?id=${encodeURIComponent(id)}` })
}
</script>

<style lang="scss" scoped>
.page {
  padding-bottom: 120rpx;
}

.page-hero {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%);
  padding: 40rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.hero-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  
  text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.hero-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.hero-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.form-section {
  padding: 30rpx;
}

.post-form {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.form-row {
  display: flex;
  gap: 20rpx;
}

.form-item {
  flex: 1;
  margin-bottom: 20rpx;
}

.form-label {
  font-size: 26rpx;
  color: #333333;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 16rpx;
  font-size: 28rpx;
}

.form-textarea {
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 16rpx;
  font-size: 28rpx;
  min-height: 200rpx;
}

.success-tip {
  font-size: 24rpx;
  color: #07C160;
  margin-bottom: 20rpx;
}

.error-tip {
  font-size: 24rpx;
  color: #ff6b6b;
  margin-bottom: 20rpx;
}

.filter-section {
  padding: 20rpx 0;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-list {
  display: inline-flex;
  padding: 0 30rpx;
  gap: 16rpx;
}

.filter-item {
  display: inline-flex;
  padding: 12rpx 24rpx;
  background: #ffffff;
  border-radius: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  &.active {
    background: #FF6B35;
    
    text {
      color: #ffffff;
    }
  }
  
  text {
    font-size: 26rpx;
    color: #666666;
  }
}

.post-list {
  padding: 0 30rpx 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.post-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.post-tag {
  margin-bottom: 12rpx;
  
  text {
    font-size: 22rpx;
    color: #FF6B35;
    background: rgba(255, 107, 53, 0.1);
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
  }
}

.post-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 12rpx;
}

.post-summary {
  font-size: 26rpx;
  color: #666666;
  display: block;
  margin-bottom: 16rpx;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  
  text {
    font-size: 22rpx;
    color: #999999;
  }
}

.empty-state {
  text-align: center;
  padding: 60rpx 40rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.empty-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999999;
  display: block;
}
</style>
