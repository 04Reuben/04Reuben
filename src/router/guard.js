import { useAuthStore } from '../store/auth'

const publicRoutes = ['/login', '/big-screen']

export function setupRouterGuard(router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // 每次导航都先恢复一次本地登录态（避免 localStorage 被清空后状态不同步）
    authStore.restore()

    const isAuthed = authStore.isAuthed
    const userRoles = authStore.roles || []

    const isPublic = publicRoutes.includes(to.path) || to.meta?.public === true || to.meta?.requiresAuth === false

    // 未登录：仅允许访问 public / requiresAuth=false 的页面（例如 /login、/big-screen），其它全部跳登录
    if (!isPublic && !isAuthed) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    // 已登录但访问登录页：跳首页
    if (isAuthed && to.path === '/login') {
      return next({ path: '/home' })
    }

    // 角色权限：无权限统一回首页（不展示 403 页面）
    const allowedRoles = to.meta?.roles
    if (!isPublic && allowedRoles && allowedRoles.length) {
      const hasRole = allowedRoles.some((role) => userRoles.includes(role))
      if (!hasRole) {
        return next({ path: '/home' })
      }
    }

    next()
  })
}
