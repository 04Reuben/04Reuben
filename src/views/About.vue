<template>
  <div>
    <a-typography-title :level="2">关于本项目</a-typography-title>
    <a-typography-paragraph>
      本示例使用以下技术栈构建：
    </a-typography-paragraph>
    <a-list :data-source="techStack" bordered>
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta :title="item.name" :description="item.desc" />
        </a-list-item>
      </template>
    </a-list>
    <a-alert
      message="提示"
      description="运行 npm run dev 启动开发服务器，在浏览器访问即可查看效果。"
      type="info"
      show-icon
      style="margin-top: 16px"
    />
  </div>
</template>

<script setup>
const techStack = [
  { name: 'Vue 3', desc: '渐进式 JavaScript 框架，Composition API' },
  { name: 'Vite', desc: '下一代前端构建工具' },
  { name: 'Ant Design Vue', desc: '企业级 UI 组件库' },
  { name: 'Vue Router', desc: 'Vue.js 官方路由' },
]
</script>
