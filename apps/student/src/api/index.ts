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

export async function publicApi<T>(path: string): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${path}`,
      method: 'GET',
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
export function trackActivity(action: string, page?: string, targetId?: string) {
  publicWrite('/api/public/activity', {
    action,
    page,
    targetId,
    platform: 'h5'
  }).catch(() => {})
}

export async function publicWrite<T>(path: string, data: Record<string, any>): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${path}`,
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json'
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
