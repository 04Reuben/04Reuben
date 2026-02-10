import { h } from 'vue'

/**
 * 扩展点：后端菜单字段到前端 route 的映射
 * 后端菜单建议字段：
 * - name: 显示名称（-> meta.title）
 * - path: 路由路径（必须以 / 开头）
 * - component: 组件标识（字符串），由前端 componentMap 映射到真实组件（懒加载）
 * - icon: 图标标识（-> meta.icon，用于菜单）
 * - roles: 允许访问的角色数组（-> meta.roles，用于守卫与菜单过滤）
 * - hideInMenu: 是否隐藏菜单（-> meta.hideInMenu）
 * - children: 子菜单
 */

const componentMap = {
  Home: () => import('../views/Home.vue'),
  List: () => import('../views/List.vue'),
  Form: () => import('../views/Form.vue'),
  StringManage: () => import('../views/StringManage.vue'),
}

export function transformMenuToRoutes(menuTree) {
  return (menuTree || []).map((item) => {
    const route = {
      path: item.path,
      name: item.component || item.path,
      component: componentMap[item.component],
      meta: {
        title: item.name,
        icon: item.icon,
        roles: item.roles || [],
        hideInMenu: Boolean(item.hideInMenu),
        requiresAuth: true,
      },
    }

    if (item.children && item.children.length) {
      route.children = transformMenuToRoutes(item.children)
    }

    return route
  })
}

const iconTextMap = {
  home: '⌂',
  list: '☰',
  form: '◇',
}

function hasPermission(menuNode, roles) {
  const need = menuNode?.roles
  if (!need || !need.length) return true
  return need.some((r) => roles.includes(r))
}

export function transformMenuToMenuItems(menuTree, roles) {
  return (menuTree || [])
    .filter((m) => !m.hideInMenu)
    .filter((m) => hasPermission(m, roles || []))
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    .map((item) => {
      const menuItem = {
        key: item.path,
        label: item.name,
      }

      if (item.icon && iconTextMap[item.icon]) {
        menuItem.icon = () => h('span', { class: 'menu-icon' }, iconTextMap[item.icon])
      }

      if (item.children && item.children.length) {
        menuItem.children = transformMenuToMenuItems(item.children, roles)
      }

      return menuItem
    })
}
