const API_BASE = import.meta.env.VITE_API_BASE || ''

interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: {
    code: string
    message: string
  }
}

export interface ActivityPayload {
  action: string
  page?: string
  targetId?: string
  merchantId?: string
  activityId?: string
  channelId?: string
  source?: string
  scene?: string
  platform?: 'h5' | 'miniprogram'
}

function getSessionId() {
  const key = 'nwu_session_id'
  let sessionId = uni.getStorageSync(key)
  if (!sessionId) {
    sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    uni.setStorageSync(key, sessionId)
  }
  return sessionId
}

export async function publicApi<T>(path: string): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${path}`,
      method: 'GET',
      header: {
        'x-session-id': getSessionId()
      },
      success: (res) => {
        const body = res.data as ApiResponse<T>
        if (res.statusCode !== 200 || body.success === false) {
          reject(new Error(body.message || body.error?.message || '请求失败'))
        } else {
          resolve(body.data)
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}

/**
 * 用户行为埋点（fire-and-forget，不阻塞页面）
 */
export function trackActivity(action: string, page?: string, targetId?: string, extra: Omit<ActivityPayload, 'action' | 'page' | 'targetId'> = {}) {
  publicWrite('/api/public/activity', {
    action,
    page,
    targetId,
    sessionId: getSessionId(),
    platform: 'h5',
    ...extra
  }).catch(() => {})
}

export async function publicWrite<T>(path: string, data: Record<string, any>): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${path}`,
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json',
        'x-session-id': getSessionId()
      },
      success: (res) => {
        const body = res.data as ApiResponse<T>
        if (res.statusCode !== 200 || body.success === false) {
          reject(new Error(body.error?.message || body.message || '请求失败'))
        } else {
          resolve(body.data)
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}
