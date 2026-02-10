import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import permissionDirective from './directives/permission'
import 'ant-design-vue/dist/reset.css'
import './styles/big-screen.tokens.css'

const app = createApp(App)

app.use(createPinia())
app.use(Antd)
app.use(router)

app.directive('permission', permissionDirective)

app.mount('#app')
