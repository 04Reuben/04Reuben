# Vue + Ant Design 前端应用

基于 **Vue 3** + **Vite** + **Ant Design Vue** 的可运行前端示例项目。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架（Composition API）
- **Vite** - 下一代前端构建工具
- **Ant Design Vue** - 企业级 UI 组件库
- **Vue Router** - 官方路由

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

在浏览器中打开终端显示的地址（一般为 http://localhost:5173）即可查看应用。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
vue-antd-app/
├── public/           # 静态资源
├── src/
│   ├── layouts/      # 布局组件
│   ├── views/        # 页面视图
│   ├── router/       # 路由配置
│   ├── App.vue       # 根组件
│   └── main.js       # 入口文件
├── index.html
├── vite.config.js
└── package.json
```

## 功能说明

- 顶部导航 + 侧边内容区布局
- 首页：展示卡片、按钮、输入框、选择器等 Ant Design 组件
- 关于页：技术栈说明与提示信息
- 中文语言包（Ant Design 组件文案为中文）
