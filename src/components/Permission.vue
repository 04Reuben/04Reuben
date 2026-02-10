<template>
  <slot v-if="allowed" />
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../store/auth'

const props = defineProps({
  anyOf: {
    type: Array,
    default: () => [],
  },
  allOf: {
    type: Array,
    default: () => [],
  },
})

const authStore = useAuthStore()

const allowed = computed(() => {
  const perms = authStore.permissions || []

  const anyOf = Array.isArray(props.anyOf) ? props.anyOf : []
  const allOf = Array.isArray(props.allOf) ? props.allOf : []

  const anyOk = anyOf.length === 0 ? true : anyOf.some((p) => perms.includes(p))
  const allOk = allOf.length === 0 ? true : allOf.every((p) => perms.includes(p))

  return anyOk && allOk
})
</script>
