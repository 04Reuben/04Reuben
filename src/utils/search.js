/**
 * 从后端菜单树提取可搜索的路由项
 * @param {Array<{ name: string; path: string; hideInMenu?: boolean; children?: any[] }>} menuTree
 * @returns {Array<{ title: string; path: string }>} items
 */
export function flattenMenuToSearchItems(menuTree) {
  const result = []

  function dfs(nodes) {
    ;(nodes || []).forEach((n) => {
      if (n && n.path && !n.hideInMenu) {
        result.push({ title: n.name, path: n.path })
      }
      if (n && n.children && n.children.length) dfs(n.children)
    })
  }

  dfs(menuTree)

  // 去重（按 path）
  const map = new Map()
  result.forEach((it) => {
    if (!map.has(it.path)) map.set(it.path, it)
  })

  return Array.from(map.values())
}
