import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Permission from '../src/components/Permission.vue'
import permissionDirective from '../src/directives/permission'
import { useAuthStore } from '../src/store/auth'

describe('Permission component', () => {
  it('renders slot when anyOf is allowed', () => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.permissions = ['user:edit']

    const wrapper = mount(Permission, {
      props: { anyOf: ['user:edit'] },
      slots: { default: '<button id="btn">Edit</button>' },
    })

    expect(wrapper.find('#btn').exists()).toBe(true)
  })

  it('does not render slot when anyOf is not allowed', () => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.permissions = ['user:view']

    const wrapper = mount(Permission, {
      props: { anyOf: ['user:edit'] },
      slots: { default: '<button id="btn">Edit</button>' },
    })

    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('renders slot when allOf is allowed', () => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.permissions = ['user:view', 'user:edit']

    const wrapper = mount(Permission, {
      props: { allOf: ['user:view', 'user:edit'] },
      slots: { default: '<div id="x">X</div>' },
    })

    expect(wrapper.find('#x').exists()).toBe(true)
  })

  it('does not render slot when allOf is missing', () => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.permissions = ['user:view']

    const wrapper = mount(Permission, {
      props: { allOf: ['user:view', 'user:edit'] },
      slots: { default: '<div id="x">X</div>' },
    })

    expect(wrapper.html()).toBe('<!--v-if-->')
  })
})

describe('v-permission directive', () => {
  it('removes element when missing permission', () => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.permissions = ['user:view']

    const Comp = {
      template: '<div><button id="btn" v-permission="[\'user:edit\']">Edit</button></div>',
      directives: { permission: permissionDirective },
    }

    const wrapper = mount(Comp)
    expect(wrapper.find('#btn').exists()).toBe(false)
  })

  it('keeps element when has permission', () => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.permissions = ['user:edit']

    const Comp = {
      template: '<div><button id="btn" v-permission="[\'user:edit\']">Edit</button></div>',
      directives: { permission: permissionDirective },
    }

    const wrapper = mount(Comp)
    expect(wrapper.find('#btn').exists()).toBe(true)
  })
})
