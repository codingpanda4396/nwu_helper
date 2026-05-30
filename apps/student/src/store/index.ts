import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sessionId = ref('')
  const toast = ref('')
  const selectedServiceKey = ref('')

  function getSessionId() {
    if (!sessionId.value) {
      sessionId.value = `mp-${Date.now()}-${Math.random().toString(16).slice(2)}`
    }
    return sessionId.value
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
    getSessionId,
    showToast
  }
})
