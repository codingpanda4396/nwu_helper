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

export const useAppStore = defineStore('app', () => {
  const sessionId = ref('')
  const toast = ref('')
  const selectedServiceKey = ref('')
  const token = ref(uni.getStorageSync('nwu_token') || '')
  const user = ref<UserInfo | null>(() => {
    const saved = uni.getStorageSync('nwu_user')
    return saved ? JSON.parse(saved) : null
  })

  const isLogin = computed(() => !!token.value)

  function getSessionId() {
    if (!sessionId.value) {
      sessionId.value = `mp-${Date.now()}-${Math.random().toString(16).slice(2)}`
    }
    return sessionId.value
  }

  function setAuth(newToken: string, newUser: UserInfo) {
    token.value = newToken
    user.value = newUser
    uni.setStorageSync('nwu_token', newToken)
    uni.setStorageSync('nwu_user', JSON.stringify(newUser))
  }

  function logout() {
    token.value = ''
    user.value = null
    uni.removeStorageSync('nwu_token')
    uni.removeStorageSync('nwu_user')
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
