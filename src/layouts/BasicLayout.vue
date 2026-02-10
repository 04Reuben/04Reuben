<template>
  <a-layout style="min-height: 100vh" :class="{ 'layout-dark': themeStore.isDark }">
    <a-layout-sider v-model:collapsed="appStore.sidebarCollapsed" :trigger="null" collapsible>
      <div class="logo">
        <div class="logo-icon" />
        <span v-if="!appStore.sidebarCollapsed" class="logo-text">Ruben</span>
      </div>
      <div class="guide-menu">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          theme="dark"
          mode="inline"
          :items="menuItems"
          @click="onMenuClick"
        />
      </div>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">
        <span class="trigger" @click="appStore.toggleSidebar">
          {{ appStore.sidebarCollapsed ? '☰' : '✕' }}
        </span>
        <span class="header-title">Ruben</span>

        <div class="header-center">
          <a-auto-complete
            ref="searchRef"
            v-model:value="searchValue"
            :options="searchOptions"
            :filter-option="false"
            placeholder="搜索页面（Ctrl+K）"
            style="width: 320px"
            @search="onSearch"
            @select="onSelect"
            @pressEnter="onEnter"
          />
        </div>

        <div class="header-right">
          <div class="guide-theme">
            <a-tooltip title="切换主题">
              <a-switch
                :checked="themeStore.isDark"
                checked-children="Dark"
                un-checked-children="Light"
                @change="themeStore.toggleTheme"
              />
            </a-tooltip>
          </div>

          <div class="guide-user">
            <a-dropdown>
              <span class="user-trigger">
                Hello, {{ authStore.userInfo?.nickname || authStore.userInfo?.username || 'Guest' }}
                <span class="dropdown-arrow">▼</span>
              </span>
              <template #overlay>
                <a-menu @click="onUserMenuClick">
                  <a-menu-item key="profile">Profile</a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="logout">Logout</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <a-breadcrumb class="breadcrumb">
          <a-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
            <router-link v-if="item.path" :to="item.path">{{ item.title }}</router-link>
            <span v-else>{{ item.title }}</span>
          </a-breadcrumb-item>
        </a-breadcrumb>
        <div class="content-inner">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../store/app'
import { useAuthStore } from '../store/auth'
import { useThemeStore } from '../store/theme'
import { getLayoutMenuItems } from '../router/menu'
import { flattenMenuToSearchItems } from '../utils/search'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const selectedKeys = ref([route.path])

const menuItems = computed(() => {
  return getLayoutMenuItems(router, authStore.roles || [])
})

watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]
  },
  { immediate: true },
)

function onMenuClick({ key }) {
  router.push(key)
}

function onUserMenuClick({ key }) {
  if (key === 'profile') {
    // 可扩展：跳转个人页
  }
  if (key === 'logout') {
    authStore.logout()
    router.replace('/login')
  }
}

const breadcrumbList = computed(() => {
  const list = []
  const matched = route.matched.filter((m) => m.meta?.title)
  matched.forEach((m, i) => {
    const isLast = i === matched.length - 1
    let path =
      m.path === '/' || m.path === '' ? '/home' : m.path.startsWith('/') ? m.path : '/' + m.path
    list.push({
      path: isLast ? '' : path,
      title: m.meta.title,
    })
  })
  return list
})

// 全局搜索
const searchRef = ref(null)
const searchValue = ref('')
const searchOptions = ref([])

const searchItems = computed(() => {
  return flattenMenuToSearchItems(authStore.menuTree || [])
})

function onSearch(q) {
  const keyword = String(q || '').trim().toLowerCase()
  if (!keyword) {
    searchOptions.value = searchItems.value
      .slice(0, 20)
      .map((it) => ({ value: it.title, label: it.title }))
    return
  }

  const matched = searchItems.value
    .filter((it) => it.title.toLowerCase().includes(keyword))
    .slice(0, 20)
    .map((it) => ({ value: it.title, label: it.title }))

  searchOptions.value = matched
}

function gotoByTitle(title) {
  const t = String(title || '').trim()
  if (!t) return
  const found = searchItems.value.find((it) => it.title === t)
  if (found) {
    router.push(found.path)
  }
}

function onSelect(value) {
  gotoByTitle(value)
}

function onEnter() {
  gotoByTitle(searchValue.value)
}

function onKeydown(e) {
  const isK = e.key === 'k' || e.key === 'K'
  if (e.ctrlKey && isK) {
    e.preventDefault()
    const el = document.querySelector('.header-center .ant-select-selector input')
    if (el && el.focus) el.focus()
  }
}

onMounted(() => {
  onSearch('')
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.logo-icon {
  width: 32px;
  height: 32px;
  background-color: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
}
.logo-icon::before {
  content: 'R';
}
.logo-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 18px;
  font-weight: 600;
}
.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}
.layout-dark .header {
  background: #141414;
  border-bottom: 1px solid #303030;
}
.trigger {
  font-size: 18px;
  margin-right: 24px;
  cursor: pointer;
}
.header-title {
  font-size: 16px;
  font-weight: 500;
}
.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 16px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-trigger {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.dropdown-arrow {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
.layout-dark .dropdown-arrow {
  color: rgba(255, 255, 255, 0.45);
}
.content {
  margin: 0;
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}
.layout-dark .content {
  background: #000;
}
.breadcrumb {
  margin-bottom: 16px;
}
.content-inner {
  background: #fff;
  padding: 24px;
  min-height: 360px;
  border-radius: 8px;
}
.layout-dark .content-inner {
  background: #1f1f1f;
  border: 1px solid #303030;
}
.menu-icon {
  margin-right: 8px;
}
</style>
