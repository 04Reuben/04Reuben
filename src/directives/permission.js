import { useAuthStore } from '../store/auth'

function hasAnyPermission(userPerms, requiredPerms) {
  if (!requiredPerms || requiredPerms.length === 0) return true
  return requiredPerms.some((p) => userPerms.includes(p))
}

export const permissionDirective = {
  mounted(el, binding) {
    const requiredPerms = Array.isArray(binding.value) ? binding.value : []
    const authStore = useAuthStore()
    const userPerms = authStore.permissions || []

    if (!hasAnyPermission(userPerms, requiredPerms)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  },
  updated(el, binding) {
    const requiredPerms = Array.isArray(binding.value) ? binding.value : []
    const authStore = useAuthStore()
    const userPerms = authStore.permissions || []

    if (!hasAnyPermission(userPerms, requiredPerms)) {
      el.style.display = 'none'
    } else {
      el.style.display = ''
    }
  },
}

export default permissionDirective
