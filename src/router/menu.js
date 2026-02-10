import { h } from 'vue'

const iconMap = {
  home: '⌂',
  list: '☰',
  form: '◇',
}

function hasPermission(route, userRoles) {
  const roles = route?.meta?.roles
  if (!roles || !roles.length) return true
  return roles.some((r) => userRoles.includes(r))
}

function resolvePath(basePath, path) {
  if (path.startsWith('/')) return path
  if (!basePath || basePath === '/') return '/' + path
  return `${basePath.replace(/\/$/, '')}/${path}`
}

export function getMenuItemsFromRoutes(routeRecords, userRoles) {
  const items = []

  routeRecords.forEach((r) => {
    if (r?.meta?.hideInMenu) return
    if (!hasPermission(r, userRoles)) return

    const item = {
      key: r.path,
      label: r.meta?.title ?? r.name ?? r.path,
    }

    if (r.meta?.icon && iconMap[r.meta.icon]) {
      item.icon = () => h('span', { class: 'menu-icon' }, iconMap[r.meta.icon])
    }

    if (r.children && r.children.length) {
      const children = getMenuItemsFromRoutes(r.children, userRoles)
      if (children.length) item.children = children
    }

    items.push(item)
  })

  return items
}

export function getLayoutMenuItems(router, userRoles) {
  const root = router.getRoutes().find((r) => r.path === '/')
  const children = root?.children || []

  const normalized = children.map((c) => {
    const fullPath = resolvePath('/', c.path)
    return {
      ...c,
      path: fullPath,
    }
  })

  return getMenuItemsFromRoutes(normalized, userRoles)
}
