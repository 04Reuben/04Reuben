<template>
  <div class="device-string-page">
    <a-card class="device-string-card" :bordered="false">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-radio-group v-model:value="filterState.type" class="toolbar-radio">
            <a-radio value="string">组串</a-radio>
          </a-radio-group>

          <a-input
            v-model:value="filterState.keyword"
            class="toolbar-input"
            placeholder="请输入名称"
            allow-clear
            @pressEnter="onQuery"
          />
          <a-button type="primary" class="toolbar-query" :loading="loading" @click="onQuery">
            查询
          </a-button>
        </div>

        <div class="toolbar-right">
          <a-button class="btn-outline" @click="onBatchBind">
            <template #icon>
              <LinkOutlined />
            </template>
            批量绑定
          </a-button>
          <a-button class="btn-outline" @click="onQuickEdit">
            <template #icon>
              <FormOutlined />
            </template>
            快速编辑
          </a-button>
          <a-button type="primary" class="btn-primary" @click="onVisualModel">
            <template #icon>
              <ApartmentOutlined />
            </template>
            可视化建模
          </a-button>
        </div>
      </div>

      <div class="table-wrap">
        <a-table
          class="ruben-table"
          :columns="columns"
          :data-source="tableData"
          :loading="loading"
          :pagination="false"
          :row-selection="rowSelection"
          :row-key="(record) => record.id"
          :scroll="{ x: 1200 }"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'index'">
              {{ (paginationState.current - 1) * paginationState.pageSize + index + 1 }}
            </template>

            <template v-else-if="column.key === 'actions'">
              <div class="cell-actions">
                <a-button type="link" class="action-edit" @click="openEdit(record)">
                  修改
                  <EditOutlined class="action-icon" />
                </a-button>
              </div>
            </template>
          </template>
        </a-table>
      </div>

      <div class="pagination-bar">
        <div class="page-info">当前第 [{{ paginationState.current }}] 页 / 共 [{{ totalPages }}] 页</div>

        <div class="page-controls">
          <a-input
            v-model:value="gotoInput"
            class="goto-input"
            :maxlength="3"
            @pressEnter="onGo"
          />
          <a-button class="go-btn" @click="onGo">GO</a-button>

          <a-button class="page-btn" :disabled="paginationState.current === 1" @click="toFirst">
            首页
          </a-button>
          <a-button class="page-btn icon" :disabled="paginationState.current === 1" @click="toPrev">
            <LeftOutlined />
          </a-button>

          <a-button class="page-btn current">
            {{ paginationState.current }}
          </a-button>

          <a-button
            class="page-btn icon"
            :disabled="paginationState.current === totalPages"
            @click="toNext"
          >
            <RightOutlined />
          </a-button>
          <a-button
            class="page-btn"
            :disabled="paginationState.current === totalPages"
            @click="toLast"
          >
            末页
          </a-button>
        </div>
      </div>
    </a-card>

    <a-modal
      v-model:open="editModal.open"
      title="修改"
      :confirm-loading="editModal.saving"
      @ok="onSave"
      @cancel="onCancelEdit"
      destroy-on-close
    >
      <a-form layout="vertical">
        <a-form-item label="组串编号">
          <a-input v-model:value="editModal.form.stringNo" />
        </a-form-item>
        <a-form-item label="逆变器编号">
          <a-input v-model:value="editModal.form.inverterNo" />
        </a-form-item>
        <a-form-item label="组串型号">
          <a-input v-model:value="editModal.form.model" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import {
  ApartmentOutlined,
  EditOutlined,
  FormOutlined,
  LeftOutlined,
  LinkOutlined,
  RightOutlined,
} from '@ant-design/icons-vue'

type StringRow = {
  id: string
  stringNo: string
  inverterNo: string
  voltage: number
  current: number
  tilt: number
  model: string
  createdAt: string
}

const filterState = reactive({
  type: 'string',
  keyword: '',
})

const loading = ref(false)

const paginationState = reactive({
  current: 1,
  pageSize: 10,
  total: 610,
})

const totalPages = computed(() => Math.ceil(paginationState.total / paginationState.pageSize))

const selectedRowKeys = ref<string[]>([])

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys.map(String)
  },
}))

const columns = computed<TableColumnsType<StringRow>>(() => [
  {
    title: '序号',
    key: 'index',
    width: 80,
    align: 'center',
  },
  {
    title: '组串编号',
    dataIndex: 'stringNo',
    key: 'stringNo',
    align: 'center',
  },
  {
    title: '逆变器编号',
    dataIndex: 'inverterNo',
    key: 'inverterNo',
    align: 'center',
  },
  {
    title: '电压(V)',
    dataIndex: 'voltage',
    key: 'voltage',
    align: 'center',
  },
  {
    title: '电流(A)',
    dataIndex: 'current',
    key: 'current',
    align: 'center',
  },
  {
    title: '面板倾斜角度(°)',
    dataIndex: 'tilt',
    key: 'tilt',
    align: 'center',
  },
  {
    title: '组串型号',
    dataIndex: 'model',
    key: 'model',
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    align: 'center',
  },
])

const tableData = ref<StringRow[]>([])

function mockRow(seed: number): StringRow {
  const idx = (paginationState.current - 1) * paginationState.pageSize + seed
  const n = (idx % 3) + 1

  const voltageList = [220, 190, 216]
  const currentList = [1100, 2932, 1823]
  const tiltList = [35, 28, 45]
  const modelList = ['Y028', 'ZX-027', 'BN-23']

  return {
    id: `device_string_${idx}`,
    stringNo: `组串${n}`,
    inverterNo: `逆变器${n}`,
    voltage: voltageList[(n - 1) % 3],
    current: currentList[(n - 1) % 3],
    tilt: tiltList[(n - 1) % 3],
    model: modelList[(n - 1) % 3],
    createdAt: '2022-09-22  12:09',
  }
}

async function fetchList() {
  loading.value = true
  try {
    await new Promise((r) => setTimeout(r, 300))
    tableData.value = Array.from({ length: paginationState.pageSize }).map((_, i) => mockRow(i + 1))
  } finally {
    loading.value = false
  }
}

function onQuery() {
  paginationState.current = 1
  selectedRowKeys.value = []
  fetchList()
}

function setPage(p: number) {
  const next = Math.min(Math.max(1, p), totalPages.value)
  if (next === paginationState.current) return
  paginationState.current = next
  selectedRowKeys.value = []
  fetchList()
}

function toFirst() {
  setPage(1)
}

function toLast() {
  setPage(totalPages.value)
}

function toPrev() {
  setPage(paginationState.current - 1)
}

function toNext() {
  setPage(paginationState.current + 1)
}

const gotoInput = ref('3')
watch(
  () => paginationState.current,
  (v) => {
    gotoInput.value = String(v)
  },
  { immediate: true },
)

function onGo() {
  const n = Number(gotoInput.value)
  if (!Number.isFinite(n) || n <= 0) {
    message.warning('请输入有效页码')
    return
  }
  setPage(n)
}

const editModal = reactive({
  open: false,
  saving: false,
  recordId: '' as string,
  form: {
    stringNo: '',
    inverterNo: '',
    model: '',
  },
})

function openEdit(record: StringRow) {
  editModal.recordId = record.id
  editModal.form.stringNo = record.stringNo
  editModal.form.inverterNo = record.inverterNo
  editModal.form.model = record.model
  editModal.open = true
}

function onCancelEdit() {
  editModal.open = false
  editModal.recordId = ''
  editModal.form.stringNo = ''
  editModal.form.inverterNo = ''
  editModal.form.model = ''
}

async function onSave() {
  editModal.saving = true
  try {
    await new Promise((r) => setTimeout(r, 300))
    message.success('保存成功（mock）')
    onCancelEdit()
    fetchList()
  } finally {
    editModal.saving = false
  }
}

function onBatchBind() {
  message.info('批量绑定：mock')
}

function onQuickEdit() {
  message.info('快速编辑：mock')
}

function onVisualModel() {
  message.info('可视化建模：mock')
}

fetchList()
</script>

<style scoped>
.device-string-page {
  padding: 0;
}

.device-string-card {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 4px 14px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-radio {
  margin-right: 4px;
}

.toolbar-input {
  width: 180px;
}

.toolbar-query {
  height: 32px;
  padding: 0 18px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.btn-outline {
  border-color: #b7cffc;
  color: #1677ff;
  background: #ffffff;
}

.btn-primary {
  padding: 0 18px;
}

.table-wrap {
  margin-top: 12px;
}

:deep(.ruben-table .ant-table) {
  border-radius: 6px;
}

:deep(.ruben-table .ant-table-thead > tr > th) {
  background: #f3f6fb;
  color: rgba(0, 0, 0, 0.65);
  font-size: 12px;
  font-weight: 500;
  padding: 12px 8px;
}

:deep(.ruben-table .ant-table-tbody > tr > td) {
  padding: 12px 8px;
  font-size: 13px;
}

:deep(.ruben-table .ant-table-tbody > tr:nth-child(even) > td) {
  background: #f7fbff;
}

:deep(.ruben-table .ant-table-tbody > tr:hover > td) {
  background: #eaf3ff;
}

:deep(.ruben-table .ant-checkbox-wrapper) {
  transform: translateY(1px);
}

.cell-actions {
  display: flex;
  justify-content: flex-end;
  padding-right: 6px;
}

.action-edit {
  padding: 0;
}

.action-icon {
  font-size: 12px;
  margin-left: 4px;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 4px 0;
}

.page-info {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.goto-input {
  width: 52px;
  height: 32px;
  text-align: center;
}

:deep(.goto-input input) {
  text-align: center;
  padding: 0 8px;
}

.go-btn {
  height: 32px;
  padding: 0 10px;
}

.page-btn {
  height: 32px;
  padding: 0 12px;
  border-color: #c8ceda;
  color: rgba(0, 0, 0, 0.65);
  background: #fff;
}

.page-btn.icon {
  width: 36px;
  padding: 0;
}

.page-btn.current {
  border-color: #1677ff;
  color: #1677ff;
}
</style>
