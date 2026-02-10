<template>
  <a-layout style="min-height: 100vh">
    <a-layout-header style="background: #001529; padding: 0 24px; display: flex; align-items: center;">
      <div class="logo" style="color: #fff; font-size: 20px; font-weight: 600;">
        Vue + Ant Design
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="horizontal"
        style="flex: 1; margin-left: 24px; background: transparent; border: none; color: #fff; line-height: 64px;"
      >
        <a-menu-item key="home">
          <router-link to="/home">首页</router-link>
        </a-menu-item>
        <a-menu-item key="about">
          <router-link to="/about">关于</router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content style="padding: 24px; background: #f0f2f5;">
      <div style="background: #fff; padding: 24px; min-height: 360px; border-radius: 8px;">
        <router-view />
      </div>
    </a-layout-content>
    <a-layout-footer style="text-align: center; background: #f0f2f5;">
      Vue + Ant Design 示例应用 ©2025
    </a-layout-footer>
  </a-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const selectedKeys = ref([route.name?.toLowerCase() || 'home'])

watch(
  () => route.name,
  (name) => {
    selectedKeys.value = [name?.toLowerCase() || 'home']
  }
)
</script>

<style scoped>
.logo {
  white-space: nowrap;
}
a {
  color: rgba(255, 255, 255, 0.85);
}
a:hover {
  color: #fff;
}
</style>
