<template>
  <a-card :bordered="false">
    <template #title>
      <a-space>
        <span>{{ title }}</span>
        <slot name="extra" />
      </a-space>
    </template>

    <template #extra>
      <a-space>
        <a-button v-if="allowExport" @click="onExport">导出 CSV</a-button>
        <a-button v-if="allowColumnSetting" @click="openColumnSetting">列设置</a-button>
        <slot name="toolbar" />
      </a-space>
    </template>

    <a-table
      v-bind="$attrs"
      :row-key="rowKey"
      :row-selection="rowSelection ? { selectedRowKeys, onChange: onSelectChange } : undefined"
      :columns="visibleColumns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      @change="onTableChange"
    >
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </a-table>

    <!-- 批量操作栏 -->
    <div v-if="rowSelection && selectedRowKeys.length > 0" class="pro-table-batch-bar">
      <a-space>
        <span>已选择 {{ selectedRowKeys.length }} 项</span>
        <a-button @click="clearSelection">取消选择</a-button>
        <slot name="batchActions" :selectedRowKeys="selectedRowKeys" :selectedRows="selectedRows" />
      </a-space>
    </div>

    <!-- 列设置抽屉 -->
    <a-drawer
      v-model:open="columnDrawerOpen"
      title="列设置"
      placement="right"
      @close="onColumnDrawerClose"
    >
      <a-space direction="vertical" style="width: 100%">
        <a-checkbox
          :indeterminate="indeterminate"
          :checked="checkAll"
          @change="onCheckAllChange"
        >
          全选
        </a-checkbox>
        <a-divider />
        <a-checkbox-group v-model:value="checkedColumns" @change="onCheckedChange">
          <a-space direction="vertical">
            <a-checkbox v-for="col in columns" :key="col.key || col.dataIndex" :value="col.key || col.dataIndex">
              {{ col.title }}
            </a-checkbox>
          </a-space>
        </a-checkbox-group>
      </a-space>
    </a-drawer>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue'

type ProTableColumn = {
  key?: string
  dataIndex?: string
  title: string
  visible?: boolean
  [k: string]: any
}

type ExportToCsvOptions = {
  filename?: string
}

const props = withDefaults(defineProps<{
  title?: string
  columns: ProTableColumn[]
  dataSource: any[]
  loading?: boolean
  pagination?: TablePaginationConfig
  rowSelection?: boolean
  allowExport?: boolean
  allowColumnSetting?: boolean
  storageKey?: string
}>(), {
  title: '',
  loading: false,
  rowSelection: false,
  allowExport: true,
  allowColumnSetting: true,
  storageKey: 'pro-table-columns',
})

const emit = defineEmits<{
  change: [pagination: TablePaginationConfig, filters: any, sorter: any]
  export: []
  batchDelete: [ids: any[]]
}>()

const selectedRowKeys = ref<any[]>([])
const columnDrawerOpen = ref(false)
const checkedColumns = ref<string[]>([])

const visibleColumns = computed(() => {
  return props.columns.filter((col) => {
    const key = col.key || col.dataIndex
    const visible = col.visible !== false
    const checked = checkedColumns.value.includes(key)
    return visible && checked
  })
})

const selectedRows = computed(() => {
  return props.dataSource.filter((row) => selectedRowKeys.value.includes(row.id))
})

const indeterminate = computed(() => {
  const allKeys = props.columns.map((c) => c.key || c.dataIndex)
  const checkedLen = checkedColumns.value.length
  return checkedLen > 0 && checkedLen < allKeys.length
})

const checkAll = computed(() => {
  const allKeys = props.columns.map((c) => c.key || c.dataIndex)
  return allKeys.every((k) => checkedColumns.value.includes(k))
})

function onSelectChange(keys: any[]) {
  selectedRowKeys.value = keys
}

function clearSelection() {
  selectedRowKeys.value = []
}

function onTableChange(pagination: TablePaginationConfig, filters: any, sorter: any) {
  emit('change', pagination, filters, sorter)
}

function onExport() {
  emit('export')
  exportToCsv(props.dataSource, { filename: `${props.title || 'export'}.csv` })
}

function openColumnSetting() {
  columnDrawerOpen.value = true
}

function onColumnDrawerClose() {
  saveColumnSettings()
}

function onCheckAllChange(e: any) {
  const allKeys = props.columns.map((c) => c.key || c.dataIndex)
  checkedColumns.value = e.target.checked ? allKeys : []
}

function onCheckedChange() {
  // 保存逻辑在抽屉关闭时统一触发
}

function loadColumnSettings() {
  const key = props.storageKey
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      checkedColumns.value = JSON.parse(saved)
    } catch {
      checkedColumns.value = props.columns.map((c) => c.key || c.dataIndex)
    }
  } else {
    checkedColumns.value = props.columns.map((c) => c.key || c.dataIndex)
  }
}

function saveColumnSettings() {
  const key = props.storageKey
  localStorage.setItem(key, JSON.stringify(checkedColumns.value))
}

function exportToCsv(data: any[], opts: ExportToCsvOptions = {}) {
  if (!data || data.length === 0) {
    return
  }
  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')
  const csvRows = data.map((row) => headers.map((h) => row[h]).join(','))
  const csvContent = [csvHeaders, ...csvRows].join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', opts.filename || 'export.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  loadColumnSettings()
})
</script>

<style scoped>
.pro-table-batch-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}
</style>
