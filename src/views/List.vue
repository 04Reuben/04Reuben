<template>
  <div class="page">
    <a-typography-title :level="4" style="margin: 0 0 16px">用户管理</a-typography-title>

    <a-card :bordered="false" style="margin-bottom: 16px">
      <a-form layout="inline">
        <a-form-item label="姓名">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入 name"
            allow-clear
            style="width: 220px"
            @pressEnter="onSearch"
          />
        </a-form-item>

        <a-form-item label="角色">
          <a-select
            v-model:value="searchForm.role"
            placeholder="请选择 role"
            allow-clear
            style="width: 180px"
            :options="roleOptions"
          />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button @click="onReset">重置</a-button>
            <a-button type="primary" :loading="loading" @click="onSearch">查询</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <ProTable
      title="用户列表"
      :columns="tableColumns"
      :data-source="rows"
      :loading="loading"
      :pagination="pagination"
      row-selection
      storage-key="pro-table-user-list"
      @change="onTableChange"
      @export="onExport"
      @batch-delete="onBatchDelete"
    >
      <template #extra>
        <Permission :any-of="['user:add']">
          <a-button type="primary" size="small" @click="onAdd">新增</a-button>
        </Permission>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <a-space>
            <a-button v-permission="['user:edit']" type="link" @click="openEdit(record)">编辑</a-button>
            <a-popconfirm title="确认删除该用户？" @confirm="onDelete(record)">
              <a-button v-permission="['user:delete']" type="link" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>

      <template #batchActions="{ selectedRowKeys }">
        <Permission :any-of="['user:delete']">
          <a-popconfirm title="确认批量删除所选用户？" @confirm="onBatchDeleteConfirm(selectedRowKeys)">
            <a-button danger>批量删除</a-button>
          </a-popconfirm>
        </Permission>
      </template>
    </ProTable>

    <a-modal
      v-model:open="editModal.open"
      title="编辑用户"
      :confirm-loading="editModal.saving"
      @ok="onSave"
      @cancel="onCancelEdit"
      destroy-on-close
    >
      <a-form layout="vertical">
        <a-form-item label="姓名">
          <a-input :value="editModal.record?.name" disabled />
        </a-form-item>

        <a-form-item label="邮箱">
          <a-input :value="editModal.record?.email" disabled />
        </a-form-item>

        <a-form-item label="角色" required>
          <a-select v-model:value="editModal.role" :options="roleOptions" placeholder="请选择 role" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import Permission from '../components/Permission.vue'
import ProTable from '../components/ProTable.vue'
import { getUsers, updateUserRole } from '../services/user'

type UserRole = 'admin' | 'editor' | 'viewer'

interface UserRow {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

interface SearchForm {
  name: string
  role?: UserRole
}

interface GetUsersParams {
  name?: string
  role?: UserRole
  page?: number
  pageSize?: number
}

interface GetUsersResp {
  code: number
  message?: string
  data?: {
    rows: UserRow[]
    total: number
    page: number
    pageSize: number
  }
}

interface UpdateUserRoleResp {
  code: number
  message?: string
  data?: UserRow
}

const roleOptions: Array<{ label: string; value: UserRole }> = [
  { label: 'admin', value: 'admin' },
  { label: 'editor', value: 'editor' },
  { label: 'viewer', value: 'viewer' },
]

const loading = ref(false)

const searchForm = reactive<SearchForm>({
  name: '',
  role: undefined,
})

const query = reactive<SearchForm>({
  name: '',
  role: undefined,
})

const paginationState = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const rows = ref<UserRow[]>([])

const pagination = computed<TablePaginationConfig>(() => ({
  current: paginationState.current,
  pageSize: paginationState.pageSize,
  total: paginationState.total,
  showSizeChanger: true,
  showTotal: (t) => `共 ${t} 条`,
}))

const tableColumns = computed<TableColumnsType<UserRow>>(() => [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Role', dataIndex: 'role', key: 'role' },
  { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
  { title: 'Actions', key: 'actions', width: 180 },
])

async function fetchList(extra: Partial<GetUsersParams> = {}) {
  loading.value = true
  try {
    const params: GetUsersParams = {
      name: query.name,
      role: query.role,
      page: paginationState.current,
      pageSize: paginationState.pageSize,
      ...extra,
    }

    const resp = (await getUsers(params)) as GetUsersResp
    if (resp?.code !== 0 || !resp?.data) {
      message.error(resp?.message || '获取列表失败')
      return
    }

    rows.value = resp.data.rows
    paginationState.total = resp.data.total
  } finally {
    loading.value = false
  }
}

async function onSearch() {
  paginationState.current = 1
  query.name = searchForm.name
  query.role = searchForm.role
  await fetchList({ page: 1 })
}

async function onReset() {
  searchForm.name = ''
  searchForm.role = undefined
  await onSearch()
}

async function onTableChange(p: TablePaginationConfig) {
  paginationState.current = p.current ?? 1
  paginationState.pageSize = p.pageSize ?? 10
  await fetchList()
}

const editModal = reactive({
  open: false,
  saving: false,
  record: null as UserRow | null,
  role: undefined as UserRole | undefined,
})

function openEdit(record: UserRow) {
  editModal.record = record
  editModal.role = record.role
  editModal.open = true
}

function onCancelEdit() {
  editModal.open = false
  editModal.record = null
  editModal.role = undefined
}

async function onSave() {
  if (!editModal.record) return
  if (!editModal.role) {
    message.warning('请选择角色')
    return
  }

  editModal.saving = true
  try {
    const resp = (await updateUserRole(editModal.record.id, editModal.role)) as UpdateUserRoleResp
    if (resp?.code !== 0) {
      message.error(resp?.message || '保存失败')
      return
    }

    message.success('保存成功')
    onCancelEdit()
    await fetchList()
  } finally {
    editModal.saving = false
  }
}

function onAdd() {
  message.info('新增：示例占位（请接入真实创建逻辑）')
}

async function onDelete(record: UserRow) {
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 400))
    message.success('删除成功')
    await fetchList()
  } finally {
    loading.value = false
  }
}

function onExport() {
  message.info('导出 CSV：前端实现（示例）')
}

async function onBatchDelete(ids: any[]) {
  console.log('批量删除 ids:', ids)
  message.info(`批量删除 ${ids.length} 项（示例）`)
  await fetchList()
}

function onBatchDeleteConfirm(ids: any[]) {
  onBatchDelete(ids)
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.page {
  padding: 16px;
}
</style>
