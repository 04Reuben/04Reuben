import { defineStore } from 'pinia'
import { transformMenuToRoutes } from '../utils/route'
import { getMenuTree } from '../services/menu'

const LS_TOKEN_KEY = 'auth_token'
const LS_USER_KEY = 'auth_userInfo'
const LS_ROLES_KEY = 'auth_roles'
const LS_MENU_KEY = 'auth_menuTree'
const LS_PERMISSIONS_KEY = 'auth_permissions'

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const token = localStorage.getItem(LS_TOKEN_KEY) || ''
    const userInfo = safeJsonParse(localStorage.getItem(LS_USER_KEY), null)
    const roles = safeJsonParse(localStorage.getItem(LS_ROLES_KEY), [])
    const menuTree = safeJsonParse(localStorage.getItem(LS_MENU_KEY), [])
    const permissions = safeJsonParse(localStorage.getItem(LS_PERMISSIONS_KEY), [])

    return {
      token,
      userInfo,
      roles,
      menuTree,
      permissions,
      routesAdded: false,
    }
  },
  getters: {
    isAuthed: (state) => Boolean(state.token),
  },
  actions: {
    async login(payload) {
      const { username } = payload || {}
      await new Promise((resolve) => setTimeout(resolve, 500))

      const token = `mock_${Date.now()}`
      const userInfo = {
        id: 'u_001',
        username: username || 'admin',
        nickname: username || 'admin',
      }

      const roles =
        username === 'editor'
          ? ['editor']
          : username === 'viewer'
            ? ['viewer']
            : ['admin']

      const permissions =
        username === 'viewer'
          ? ['user:view']
          : username === 'editor'
            ? ['user:view', 'user:edit']
            : ['user:view', 'user:edit', 'user:add', 'user:delete']

      this.token = token
      this.userInfo = userInfo
      this.roles = roles
      this.permissions = permissions

      localStorage.setItem(LS_TOKEN_KEY, token)
      localStorage.setItem(LS_USER_KEY, JSON.stringify(userInfo))
      localStorage.setItem(LS_ROLES_KEY, JSON.stringify(roles))
      localStorage.setItem(LS_PERMISSIONS_KEY, JSON.stringify(permissions))

      return { token, userInfo, roles, permissions }
    },

    logout() {
      this.token = ''
      this.userInfo = null
      this.roles = []
      this.menuTree = []
      this.permissions = []
      this.routesAdded = false

      localStorage.removeItem(LS_TOKEN_KEY)
      localStorage.removeItem(LS_USER_KEY)
      localStorage.removeItem(LS_ROLES_KEY)
      localStorage.removeItem(LS_MENU_KEY)
      localStorage.removeItem(LS_PERMISSIONS_KEY)
    },

    restore() {
      this.token = localStorage.getItem(LS_TOKEN_KEY) || ''
      this.userInfo = safeJsonParse(localStorage.getItem(LS_USER_KEY), null)
      this.roles = safeJsonParse(localStorage.getItem(LS_ROLES_KEY), [])
      this.menuTree = safeJsonParse(localStorage.getItem(LS_MENU_KEY), [])
      this.permissions = safeJsonParse(localStorage.getItem(LS_PERMISSIONS_KEY), [])
    },

    async fetchMenuAndAddRoutes(router) {
      if (this.routesAdded) return

      const resp = await getMenuTree()
      if (resp?.code !== 0 || !resp?.data) {
        throw new Error('获取菜单失败')
      }

      this.menuTree = resp.data
      localStorage.setItem(LS_MENU_KEY, JSON.stringify(resp.data))

      const dynamicRoutes = transformMenuToRoutes(resp.data)

      // 将菜单路由作为 '/'（BasicLayout）的 children 动态注入
      dynamicRoutes.forEach((r) => {
        router.addRoute('/', r)
      })

      this.routesAdded = true
    },

    async restoreRoutes(router) {
      if (!this.isAuthed || this.routesAdded) return

      if (this.menuTree && this.menuTree.length) {
        const dynamicRoutes = transformMenuToRoutes(this.menuTree)
        dynamicRoutes.forEach((r) => {
          router.addRoute('/', r)
        })
        this.routesAdded = true
      }
    },
  },
})
