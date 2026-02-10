import BasicLayout from '../layouts/BasicLayout.vue'

export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录', hideInMenu: true, requiresAuth: false },
  },
  {
    path: '/big-screen',
    name: 'PvBigScreen',
    component: () => import('../views/PvBigScreen.vue'),
    meta: {
      title: '大屏',
      requiresAuth: false,
      public: true,
      hideInMenu: false,
    },
  },
  {
    path: '/',
    name: 'Layout',
    component: BasicLayout,
    redirect: '/home',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: { title: 'Dashboard', icon: 'home', requiresAuth: true },
      },
      {
        path: 'string-manage',
        name: 'StringManage',
        component: () => import('../views/StringManage.vue'),
        meta: { title: '设备管理-组串', icon: 'list', requiresAuth: true },
      },
      {
        path: 'device/string',
        name: 'DeviceStringTable',
        component: () => import('../views/DeviceStringTable.vue'),
        meta: { title: '设备管理-组串', icon: 'list', requiresAuth: true },
      },
    ],
  },
]

export const asyncRoutes = []

export const routes = [
  ...constantRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'CatchAll',
    redirect: (to) => {
      const token = localStorage.getItem('auth_token') || ''
      return token ? '/home' : '/login'
    },
    meta: { hideInMenu: true, requiresAuth: false },
  },
]
