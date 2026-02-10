<template>
  <div class="page">
    <a-page-header title="创建工单 / 创建用户" sub-title="支持草稿、联动校验与附件上传">
      <template #extra>
        <a-space>
          <a-button :disabled="submitLoading" @click="saveDraftManually">保存草稿</a-button>
          <a-button type="primary" :loading="submitLoading" @click="onSubmit">提交</a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-row :gutter="16">
      <a-col :xs="24" :lg="16">
        <a-form ref="formRef" :model="form" layout="vertical" :rules="rules">
          <a-card title="基础信息" :bordered="false" style="margin-bottom: 16px">
            <a-row :gutter="16">
              <a-col :xs="24" :md="12">
                <a-form-item label="标题" name="title">
                  <a-input v-model:value="form.title" placeholder="请输入标题" />
                </a-form-item>
              </a-col>

              <a-col :xs="24" :md="12">
                <a-form-item label="分类" name="category">
                  <a-select
                    v-model:value="form.category"
                    placeholder="请选择分类"
                    :options="categoryOptions"
                  />
                </a-form-item>
              </a-col>

              <a-col :xs="24" :md="12">
                <a-form-item label="优先级" name="priority">
                  <a-select
                    v-model:value="form.priority"
                    placeholder="请选择优先级"
                    :options="priorityOptions"
                  />
                </a-form-item>
              </a-col>

              <a-col :xs="24" :md="12">
                <a-form-item label="负责人" name="assignee">
                  <a-select
                    v-model:value="form.assignee"
                    placeholder="请选择负责人"
                    :options="assigneeOptions"
                    show-search
                    :filter-option="filterOption"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>

          <a-card title="详情" :bordered="false" style="margin-bottom: 16px">
            <a-form-item label="描述" name="description">
              <a-textarea v-model:value="form.description" :rows="4" placeholder="请输入描述" />
            </a-form-item>

            <a-form-item label="标签" name="tags">
              <a-select
                v-model:value="form.tags"
                mode="multiple"
                placeholder="请选择标签"
                :options="tagOptions"
              />
            </a-form-item>
          </a-card>

          <a-card title="附件" :bordered="false" style="margin-bottom: 16px">
            <a-form-item label="上传附件" name="attachments">
              <a-upload
                v-model:file-list="fileList"
                :before-upload="beforeUpload"
                :accept="acceptTypes"
                :max-count="5"
              >
                <a-button>选择文件</a-button>
              </a-upload>
              <div class="hint">支持 png/jpg/pdf，单文件最大 5MB，最多 5 个</div>
            </a-form-item>
          </a-card>
        </a-form>
      </a-col>

      <a-col :xs="24" :lg="8">
        <a-card title="实时预览" :bordered="false">
          <a-descriptions :column="1" size="small">
            <a-descriptions-item label="标题">{{ form.title || '-' }}</a-descriptions-item>
            <a-descriptions-item label="分类">{{ form.category || '-' }}</a-descriptions-item>
            <a-descriptions-item label="优先级">{{ form.priority || '-' }}</a-descriptions-item>
            <a-descriptions-item label="标签">
              <template v-if="form.tags.length">
                <a-space wrap>
                  <a-tag v-for="t in form.tags" :key="t">{{ t }}</a-tag>
                </a-space>
              </template>
              <template v-else>-</template>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>

    <a-modal
      v-model:open="draftModalOpen"
      title="检测到草稿"
      ok-text="恢复"
      cancel-text="丢弃"
      @ok="restoreDraft"
      @cancel="discardDraft"
    >
      <div>发现上次未提交的草稿，是否恢复？</div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import type { FormInstance, UploadFile } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { useDraftForm } from '../hooks/useDraftForm'

type Category = 'Bug' | 'Feature' | 'Task'

type Priority = 'Low' | 'Medium' | 'High'

type Tag = 'frontend' | 'backend' | 'urgent' | 'customer'

type Assignee = 'Alice' | 'Bob' | 'Cindy' | 'David'

interface TicketForm {
  title: string
  category?: Category
  priority?: Priority
  assignee?: Assignee
  description: string
  tags: Tag[]
}

const DRAFT_KEY = 'draft_ticket_form'

const formRef = ref<FormInstance | null>(null)

const form = reactive<TicketForm>({
  title: '',
  category: undefined,
  priority: undefined,
  assignee: undefined,
  description: '',
  tags: [],
})

const categoryOptions = [
  { label: 'Bug', value: 'Bug' },
  { label: 'Feature', value: 'Feature' },
  { label: 'Task', value: 'Task' },
] as const

const priorityOptions = [
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
] as const

const assigneeOptions = [
  { label: 'Alice', value: 'Alice' },
  { label: 'Bob', value: 'Bob' },
  { label: 'Cindy', value: 'Cindy' },
  { label: 'David', value: 'David' },
] as const

const tagOptions = [
  { label: 'frontend', value: 'frontend' },
  { label: 'backend', value: 'backend' },
  { label: 'urgent', value: 'urgent' },
  { label: 'customer', value: 'customer' },
] as const

const rules = computed(() => {
  return {
    title: [{ required: true, message: '请输入标题' }],
    category: [{ required: true, message: '请选择分类' }],
    priority: [{ required: true, message: '请选择优先级' }],
    assignee: [{ required: true, message: '请选择负责人' }],
    description: [
      {
        validator: async () => {
          if (form.priority === 'High' && !form.description.trim()) {
            return Promise.reject(new Error('优先级为 High 时必须填写描述'))
          }
          return Promise.resolve()
        },
        trigger: ['change', 'blur'],
      },
    ],
  }
})

const submitLoading = ref(false)

const acceptTypes = '.png,.jpg,.jpeg,.pdf'
const fileList = ref<UploadFile[]>([])

function filterOption(input: string, option: any) {
  return String(option?.label || '').toLowerCase().includes(input.toLowerCase())
}

function beforeUpload(file: File) {
  const isAllowedType = ['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)
  if (!isAllowedType) {
    message.error('仅支持 png/jpg/pdf 文件')
    return false
  }

  const isLt5M = file.size / 1024 / 1024 <= 5
  if (!isLt5M) {
    message.error('单文件最大 5MB')
    return false
  }

  return false
}

watch(
  () => form.category,
  (val) => {
    if (val === 'Bug' && !form.priority) {
      form.priority = 'High'
    }
  },
)

const { draftExists, loadDraft, clearDraft } = useDraftForm(DRAFT_KEY, form, { debounceMs: 800 })

const draftModalOpen = ref(false)

function applyDraft(draft: Partial<TicketForm>) {
  form.title = draft.title ?? ''
  form.category = draft.category
  form.priority = draft.priority
  form.assignee = draft.assignee
  form.description = draft.description ?? ''
  form.tags = (draft.tags ?? []) as Tag[]
}

function restoreDraft() {
  const draft = loadDraft()
  if (draft) {
    applyDraft(draft)
    message.success('草稿已恢复')
  }
  draftModalOpen.value = false
}

function discardDraft() {
  clearDraft()
  draftModalOpen.value = false
  message.info('草稿已丢弃')
}

function saveDraftManually() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    message.success('草稿已保存')
  } catch {
    message.error('草稿保存失败')
  }
}

async function onSubmit() {
  if (!formRef.value) return

  submitLoading.value = true
  try {
    await formRef.value.validate()

    await new Promise((resolve, reject) => {
      setTimeout(() => {
        const ok = Math.random() > 0.2
        ok ? resolve(true) : reject(new Error('mock 提交失败'))
      }, 800)
    })

    message.success('提交成功')
    clearDraft()

    formRef.value.resetFields()
    fileList.value = []
  } catch (e: any) {
    if (e?.errorFields) {
      message.error('请完善表单后再提交')
    } else {
      message.error(e?.message || '提交失败')
    }
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  if (draftExists.value) {
    draftModalOpen.value = true
  }
})
</script>

<style scoped>
.page {
  padding: 16px;
}
.hint {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
</style>
