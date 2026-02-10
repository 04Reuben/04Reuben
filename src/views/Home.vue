<template>
  <div class="dashboard">
    <a-tour v-model:open="tourOpen" :steps="tourSteps" @close="onTourClose" />

    <a-row justify="space-between" align="middle" style="margin-bottom: 16px">
      <a-col>
        <a-typography-title :level="4" style="margin: 0">Dashboard</a-typography-title>
      </a-col>
      <a-col>
        <a-button :loading="loading" @click="refresh"> 刷新 </a-button>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card :bordered="false">
          <a-skeleton :loading="loading" active>
            <a-statistic title="Users" :value="stats.users" />
          </a-skeleton>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card :bordered="false">
          <a-skeleton :loading="loading" active>
            <a-statistic title="Orders" :value="stats.orders" />
          </a-skeleton>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card :bordered="false">
          <a-skeleton :loading="loading" active>
            <a-statistic title="Conversion" :value="stats.conversion" suffix="%" :precision="2" />
          </a-skeleton>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card :bordered="false">
          <a-skeleton :loading="loading" active>
            <a-statistic title="Errors" :value="stats.errors" />
          </a-skeleton>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :xs="24" :md="12">
        <a-card :bordered="false" title="快捷操作" class="guide-shortcuts">
          <a-skeleton :loading="loading" active>
            <a-space wrap>
              <a-button type="primary" @click="go('/form')">新建表单</a-button>
              <a-button @click="go('/list')">打开列表</a-button>
              <a-button @click="viewLogs">查看日志</a-button>
            </a-space>
          </a-skeleton>
        </a-card>
      </a-col>

      <a-col :xs="24" :md="12">
        <a-card :bordered="false" title="待办">
          <a-skeleton :loading="loading" active>
            <a-list :data-source="todos" :locale="{ emptyText: '暂无待办' }">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-space>
                    <a-checkbox
                      :checked="item.done"
                      @change="(e) => toggleTodo(item.id, e.target.checked)"
                    />
                    <span :class="{ done: item.done }">{{ item.title }}</span>
                  </a-space>
                </a-list-item>
              </template>
            </a-list>
          </a-skeleton>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :xs="24" :md="14">
        <a-card :bordered="false" title="访问趋势">
          <a-skeleton :loading="loading" active>
            <LineChart :option="visitChartOption" height="280px" />
          </a-skeleton>
        </a-card>
      </a-col>

      <a-col :xs="24" :md="10">
        <a-card :bordered="false" title="最近活动">
          <a-skeleton :loading="loading" active>
            <a-timeline>
              <a-timeline-item v-for="act in activities" :key="act.id">
                <div class="activity-item">
                  <div class="activity-title">{{ act.title }}</div>
                  <div class="activity-time">{{ act.time }}</div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </a-skeleton>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import LineChart from '../components/Charts/LineChart.vue'

interface DashboardStats {
  users: number
  orders: number
  conversion: number
  errors: number
}

interface TodoItem {
  id: string
  title: string
  done: boolean
}

interface ActivityItem {
  id: string
  title: string
  time: string
}

interface VisitTrend {
  dates: string[]
  values: number[]
}

type TourStep = {
  title: string
  description: string
  target: () => HTMLElement
}

const LS_TODOS_KEY = 'dashboard_todos'
const LS_TOUR_KEY = 'dashboard_tour_done'

const router = useRouter()
const loading = ref(false)

const stats = reactive<DashboardStats>({
  users: 0,
  orders: 0,
  conversion: 0,
  errors: 0,
})

const todos = ref<TodoItem[]>([])
const activities = ref<ActivityItem[]>([])
const visitTrend = ref<VisitTrend>({ dates: [], values: [] })

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function nowString() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatMMDD(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function genMockStats(): DashboardStats {
  return {
    users: randInt(1200, 5600),
    orders: randInt(80, 420),
    conversion: Number((Math.random() * 8 + 1).toFixed(2)),
    errors: randInt(0, 12),
  }
}

function genDefaultTodos(): TodoItem[] {
  return [
    { id: 't1', title: '检查今日订单异常', done: false },
    { id: 't2', title: '更新表单校验规则', done: false },
    { id: 't3', title: '回访关键客户', done: true },
    { id: 't4', title: '整理本周发布计划', done: false },
  ]
}

function genActivities(): ActivityItem[] {
  const base = [
    '登录系统',
    '查看 Dashboard',
    '打开用户列表',
    '更新用户角色',
    '导出 CSV 报表',
    '创建新表单',
    '切换主题',
    '批量删除用户',
  ]

  return Array.from({ length: 6 }).map((_, idx) => {
    const title = base[randInt(0, base.length - 1)]
    return {
      id: `a_${Date.now()}_${idx}`,
      title,
      time: nowString(),
    }
  })
}

function genVisitTrend(days = 7): VisitTrend {
  const dates: string[] = []
  const values: number[] = []

  const today = new Date()
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(formatMMDD(d))
    values.push(randInt(800, 5200))
  }

  return { dates, values }
}

function loadTodos(): TodoItem[] {
  const raw = localStorage.getItem(LS_TODOS_KEY)
  if (!raw) return genDefaultTodos()
  try {
    const parsed = JSON.parse(raw) as TodoItem[]
    if (!Array.isArray(parsed)) return genDefaultTodos()
    return parsed
  } catch {
    return genDefaultTodos()
  }
}

function saveTodos(list: TodoItem[]) {
  localStorage.setItem(LS_TODOS_KEY, JSON.stringify(list))
}

function toggleTodo(id: string, done: boolean) {
  const next = todos.value.map((t) => (t.id === id ? { ...t, done } : t))
  todos.value = next
  saveTodos(next)
}

function go(path: string) {
  router.push(path)
}

function viewLogs() {
  message.info('查看日志：示例占位（可接入 /logs 页面）')
}

const visitChartOption = computed(() => {
  return {
    grid: { left: 12, right: 12, top: 24, bottom: 12, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: visitTrend.value.dates,
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisTick: { show: false },
      splitLine: { lineStyle: { type: 'dashed' } },
    },
    series: [
      {
        name: 'Visits',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: visitTrend.value.values,
        areaStyle: { opacity: 0.08 },
        lineStyle: { width: 2 },
      },
    ],
  }
})

async function refresh() {
  loading.value = true
  try {
    await delay(600)

    const s = genMockStats()
    stats.users = s.users
    stats.orders = s.orders
    stats.conversion = s.conversion
    stats.errors = s.errors

    activities.value = genActivities()
    visitTrend.value = genVisitTrend(7)

    message.success('数据已刷新')
  } finally {
    loading.value = false
  }
}

watch(
  todos,
  (val) => {
    saveTodos(val)
  },
  { deep: true },
)

// Tour 引导
const tourOpen = ref(false)

const tourSteps = computed<TourStep[]>(() => {
  return [
    {
      title: '菜单导航',
      description: '从这里快速访问各个模块页面。',
      target: () => document.querySelector('.guide-menu') as HTMLElement,
    },
    {
      title: '主题切换',
      description: '支持 Light/Dark 主题切换，并会自动保存。',
      target: () => document.querySelector('.guide-theme') as HTMLElement,
    },
    {
      title: '用户菜单',
      description: '在这里查看用户信息、退出登录。',
      target: () => document.querySelector('.guide-user') as HTMLElement,
    },
    {
      title: '快捷操作',
      description: '常用入口一键直达，提高效率。',
      target: () => document.querySelector('.guide-shortcuts') as HTMLElement,
    },
  ]
})

function onTourClose() {
  localStorage.setItem(LS_TOUR_KEY, '1')
  tourOpen.value = false
}

onMounted(async () => {
  todos.value = loadTodos()
  activities.value = genActivities()
  visitTrend.value = genVisitTrend(7)
  await refresh()

  await nextTick()
  const done = localStorage.getItem(LS_TOUR_KEY)
  if (!done) {
    tourOpen.value = true
  }
})
</script>

<style scoped>
.dashboard {
  width: 100%;
}
.done {
  color: rgba(0, 0, 0, 0.45);
  text-decoration: line-through;
}
.activity-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.activity-title {
  font-weight: 500;
}
.activity-time {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
  white-space: nowrap;
}
</style>
