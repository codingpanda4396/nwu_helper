import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  id: string
  name: string
  nickname?: string
  avatarUrl?: string
  phone?: string
  role: string
}

const DEFAULT_TOKEN = 'default-mock-token'
const DEFAULT_USER: UserInfo = { id: 'default', name: '同学', role: 'STUDENT' }

export const useAppStore = defineStore('app', () => {
  const sessionId = ref('')
  const toast = ref('')
  const selectedServiceKey = ref('')
  // 登录功能已移除，始终使用默认用户
  const token = ref(uni.getStorageSync('nwu_token') || DEFAULT_TOKEN)
  const user = ref<UserInfo | null>(() => {
    const saved = uni.getStorageSync('nwu_user')
    return saved ? JSON.parse(saved) : { ...DEFAULT_USER }
  })

  // 始终处于已登录状态
  const isLogin = computed(() => true)

  function getSessionId() {
    if (!sessionId.value) {
      sessionId.value = `mp-${Date.now()}-${Math.random().toString(16).slice(2)}`
    }
    return sessionId.value
  }

  function setAuth(newToken: string, newUser: UserInfo) {
    token.value = newToken || DEFAULT_TOKEN
    user.value = newUser || { ...DEFAULT_USER }
    uni.setStorageSync('nwu_token', token.value)
    uni.setStorageSync('nwu_user', JSON.stringify(user.value))
  }

  function logout() {
    // 重置为默认用户而非清空
    token.value = DEFAULT_TOKEN
    user.value = { ...DEFAULT_USER }
    uni.setStorageSync('nwu_token', DEFAULT_TOKEN)
    uni.setStorageSync('nwu_user', JSON.stringify(DEFAULT_USER))
  }

  function showToast(message: string, duration = 2600) {
    toast.value = message
    setTimeout(() => {
      toast.value = ''
    }, duration)
  }

  return {
    sessionId,
    toast,
    selectedServiceKey,
    token,
    user,
    isLogin,
    getSessionId,
    setAuth,
    logout,
    showToast
  }
})
