import axios from 'axios'
import { message, notification } from 'ant-design-vue'

const baseURL = import.meta.env?.VITE_API_BASE_URL ?? ''

function isTimeoutError(error) {
  return error?.code === 'ECONNABORTED' || /timeout/i.test(String(error?.message || ''))
}

function isNetworkError(error) {
  return String(error?.message || '').toLowerCase() === 'network error'
}

function notifyHttpError({ status, title, description }) {
  const msg = description || title || '请求失败'

  if (status === 401 || status === 403) {
    notification.error({ message: title || '权限错误', description: msg, duration: 3 })
    return
  }

  if (status >= 500) {
    notification.error({ message: title || '服务器错误', description: msg, duration: 3 })
    return
  }

  message.error(msg)
}

export const http = axios.create({
  baseURL,
  timeout: 15000,
})

http.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    notifyHttpError({ title: '请求发送失败', description: error?.message })
    return Promise.reject(error)
  },
)

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isTimeoutError(error)) {
      notifyHttpError({ title: '请求超时', description: '请求超时，请稍后重试' })
      return Promise.reject(error)
    }

    if (isNetworkError(error)) {
      notifyHttpError({ title: '网络错误', description: '网络异常，请检查网络连接' })
      return Promise.reject(error)
    }

    const status = error?.response?.status
    const serverMsg =
      error?.response?.data?.message ||
      error?.response?.data?.msg ||
      error?.response?.statusText ||
      error?.message

    if (status === 401) {
      notifyHttpError({ status, title: '未登录或登录过期', description: serverMsg || '请重新登录' })
    } else if (status === 403) {
      notifyHttpError({ status, title: '无权限', description: serverMsg || '没有权限访问该资源' })
    } else if (status >= 500) {
      notifyHttpError({ status, title: '服务器错误', description: serverMsg || '服务器异常，请稍后重试' })
    } else {
      notifyHttpError({ status, title: '请求失败', description: serverMsg || '请求失败，请稍后重试' })
    }

    return Promise.reject(error)
  },
)

export default http
