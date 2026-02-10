const mockMenuTree = [
  {
    id: 'm_dashboard',
    name: 'Dashboard',
    path: '/home',
    component: 'Home',
    icon: 'home',
    roles: ['admin', 'editor', 'viewer'],
    hideInMenu: false,
    sort: 1,
    children: [],
  },
  {
    id: 'm_string_manage',
    name: '设备管理-组串',
    path: '/string-manage',
    component: 'StringManage',
    icon: 'list',
    roles: ['admin', 'editor'],
    hideInMenu: false,
    sort: 2,
    children: [],
  },
  {
    id: 'm_list',
    name: 'List',
    path: '/list',
    component: 'List',
    icon: 'list',
    roles: ['admin', 'editor'],
    hideInMenu: false,
    sort: 3,
    children: [],
  },
  {
    id: 'm_form',
    name: 'Forms',
    path: '/form',
    component: 'Form',
    icon: 'form',
    roles: ['admin'],
    hideInMenu: false,
    sort: 4,
    children: [],
  },
]

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getMenuTree() {
  await delay(600)
  return {
    code: 0,
    data: mockMenuTree,
  }
}
