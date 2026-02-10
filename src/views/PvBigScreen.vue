<template>
  <div class="pv-screen">
    <div class="bg" />

    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-mark" />
        <div class="brand-title">光伏电站智慧巡检平台</div>
      </div>

      <div class="topbar-center">
        <div class="center-title">
          <span class="center-line left" />
          <span class="center-cap left" />
          <span class="center-text">光伏电站智慧巡检平台</span>
          <span class="center-cap right" />
          <span class="center-line right" />
        </div>
      </div>

      <div class="topbar-right">
        <div class="search">
          <span class="search-icon" />
          <input v-model="keyword" class="search-input" placeholder="搜索场站/方阵/设备" />
        </div>
        <button class="filter-btn" type="button">筛选</button>
        <div class="time">{{ data.station.updatedAt }}</div>
      </div>
    </header>

    <main class="content">
      <section class="col left">
        <div class="panel">
          <div class="panel-corner tl" />
          <div class="panel-corner tr" />
          <div class="panel-corner bl" />
          <div class="panel-corner br" />
          <div class="panel-hd">
            <div class="panel-title">缺陷趋势</div>
            <div class="panel-sub">近 7 日</div>
          </div>
          <div class="panel-bd">
            <LineChart :option="trendOption" height="240px" />
          </div>
        </div>

        <div class="panel">
          <div class="panel-corner tl" />
          <div class="panel-corner tr" />
          <div class="panel-corner bl" />
          <div class="panel-corner br" />
          <div class="panel-hd">
            <div class="panel-title">最近任务</div>
          </div>
          <div class="panel-bd">
            <div class="empty">
              <div class="empty-icon" />
              <div class="empty-text">{{ data.recentTasks.emptyText }}</div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-corner tl" />
          <div class="panel-corner tr" />
          <div class="panel-corner bl" />
          <div class="panel-corner br" />
          <div class="panel-hd">
            <div class="panel-title">缺陷汇总</div>
          </div>
          <div class="panel-bd">
            <div class="table">
              <div class="thead">
                <div class="tr">
                  <div class="th" v-for="c in data.defectTable.columns" :key="c.key">{{ c.title }}</div>
                </div>
              </div>
              <div class="tbody">
                <div class="tr" v-for="r in data.defectTable.rows" :key="r.type">
                  <div class="td">{{ r.type }}</div>
                  <div class="td num">{{ r.count }}</div>
                  <div class="td">{{ r.rate }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="col center">
        <div class="panel map">
          <div class="panel-hd">
            <div class="panel-title">航拍总览</div>
            <div class="panel-sub">点击区域查看详情</div>
          </div>
          <div class="panel-bd">
            <div class="map-wrap" @mousemove="onMapMove">
              <img class="map-img" :src="activeView.img" alt="航拍占位图" />

              <div
                v-for="a in visibleHotAreas"
                :key="a.id"
                class="hot"
                :style="hotStyle(a)"
                @mouseenter="onEnter(a)"
                @mouseleave="onLeave"
              />

              <div v-if="hovered" class="tooltip" :style="tooltipStyle">
                <div class="tooltip-title">{{ hovered.name }}</div>
                <div class="tooltip-body">{{ hovered.tip }}</div>
                <div class="tooltip-actions">
                  <button class="tooltip-btn" type="button">查看详情</button>
                  <button class="tooltip-btn" type="button">派单</button>
                  <button class="tooltip-btn" type="button">忽略</button>
                </div>
              </div>

              <button class="nav-arrow nav-left" type="button" @click="prevMap">
                <span class="arrow-icon" />
              </button>
              <button class="nav-arrow nav-right" type="button" @click="nextMap">
                <span class="arrow-icon" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="col right">
        <div class="panel">
          <div class="panel-hd">
            <div class="panel-title">场站信息</div>
          </div>
          <div class="panel-bd">
            <div class="kpi-grid">
              <div class="kpi">
                <div class="k">场站</div>
                <div class="v">{{ data.station.name }}</div>
              </div>
              <div class="kpi">
                <div class="k">装机容量</div>
                <div class="v">{{ data.station.capacityMW }} MW</div>
              </div>
              <div class="kpi">
                <div class="k">在线率</div>
                <div class="v">{{ data.station.onlineRate }}%</div>
              </div>
              <div class="kpi">
                <div class="k">健康指数</div>
                <div class="v">{{ data.station.healthIndex }}</div>
              </div>
              <div class="kpi">
                <div class="k">运行天数</div>
                <div class="v">{{ data.station.runningDays }}</div>
              </div>
              <div class="kpi">
                <div class="k">位置</div>
                <div class="v">{{ data.station.location }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-hd">
            <div class="panel-title">缺陷闭环</div>
            <div class="panel-sub">总计 {{ data.donut.total }}</div>
          </div>
          <div class="panel-bd">
            <div class="donut-wrap">
              <LineChart :option="donutOption" height="220px" />
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-hd">
            <div class="panel-title">缺陷统计</div>
          </div>
          <div class="panel-bd">
            <div class="mini-grid">
              <div class="mini" v-for="c in data.defectCards" :key="c.label">
                <div class="mini-v">{{ c.value }}</div>
                <div class="mini-k">{{ c.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="bottombar">
      <div class="mode">
        <button class="mode-btn" :class="{ active: mode === 'uav' }" type="button" @click="mode = 'uav'">
          无人机
        </button>
        <button class="mode-btn" :class="{ active: mode === 'robot' }" type="button" @click="mode = 'robot'">
          机器人
        </button>
      </div>

      <div class="hint">开发 Mock 数据 · 大屏布局复刻</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import LineChart from '../components/charts/LineChart.vue'
import { bigScreenMock } from '../mock/bigScreenData'

type MapView = {
  id: string
  img: string
}

type HotArea = {
  id: string
  name: string
  status: string
  x: number
  y: number
  w: number
  h: number
  tip: string
}

type HotAreaWithView = HotArea & { viewId: string }

const data = bigScreenMock

const keyword = ref('')
const mode = ref<'uav' | 'robot'>('uav')

const mapViews = ref<MapView[]>([
  { id: 'v1', img: 'https://picsum.photos/seed/pv-aerial-1/1600/900.jpg' },
  { id: 'v2', img: 'https://picsum.photos/seed/pv-aerial-2/1600/900.jpg' },
  { id: 'v3', img: 'https://picsum.photos/seed/pv-aerial-3/1600/900.jpg' },
])

const activeViewIdx = ref(0)
const activeView = computed(() => mapViews.value[activeViewIdx.value])

const mapHotAreas = computed<HotAreaWithView[]>(() => {
  const base = (data.map.hotAreas || []) as HotArea[]
  const v1 = base.map((a) => ({ ...a, viewId: 'v1' }))

  const v2: HotAreaWithView[] = [
    {
      id: 'C3',
      name: '3#方阵-西北角',
      status: '待确认',
      x: 14,
      y: 18,
      w: 22,
      h: 18,
      tip: '遮挡疑似：3处\n建议：复检确认',
      viewId: 'v2',
    },
    {
      id: 'D4',
      name: '4#方阵-中部',
      status: '高亮关注',
      x: 52,
      y: 44,
      w: 28,
      h: 22,
      tip: '热斑疑似：7处\n建议：派单复检',
      viewId: 'v2',
    },
    {
      id: 'E5',
      name: '5#方阵-东侧',
      status: '复检中',
      x: 76,
      y: 28,
      w: 18,
      h: 26,
      tip: '隐裂疑似：4处\n建议：复检确认',
      viewId: 'v2',
    },
  ]

  const v3: HotAreaWithView[] = [
    {
      id: 'F6',
      name: '6#方阵-南部',
      status: '复检中',
      x: 22,
      y: 60,
      w: 26,
      h: 22,
      tip: '污染疑似：5处\n建议：安排清洗',
      viewId: 'v3',
    },
    {
      id: 'G7',
      name: '7#方阵-中南部',
      status: '高亮关注',
      x: 56,
      y: 62,
      w: 26,
      h: 20,
      tip: '破损疑似：2处\n建议：现场确认',
      viewId: 'v3',
    },
    {
      id: 'H8',
      name: '8#方阵-东北角',
      status: '待确认',
      x: 70,
      y: 22,
      w: 18,
      h: 20,
      tip: '接线异常：1处\n建议：复检确认',
      viewId: 'v3',
    },
  ]

  return [...v1, ...v2, ...v3]
})

const visibleHotAreas = computed(() => {
  const vid = activeView.value?.id
  return mapHotAreas.value.filter((a) => a.viewId === vid)
})

const hovered = ref<HotAreaWithView | null>(null)
const tooltipStyle = ref<Record<string, string>>({})

function prevMap() {
  activeViewIdx.value = (activeViewIdx.value - 1 + mapViews.value.length) % mapViews.value.length
  hovered.value = null
}

function nextMap() {
  activeViewIdx.value = (activeViewIdx.value + 1) % mapViews.value.length
  hovered.value = null
}

function hotStyle(a: HotAreaWithView) {
  return {
    left: `${a.x}%`,
    top: `${a.y}%`,
    width: `${a.w}%`,
    height: `${a.h}%`,
  }
}

function onEnter(a: HotAreaWithView) {
  hovered.value = a
  tooltipStyle.value = calcTooltipStyle(a)
}

function onLeave() {
  hovered.value = null
}

function calcTooltipStyle(a: HotAreaWithView) {
  const left = a.x + a.w + 2
  const preferRight = left <= 82
  return {
    left: preferRight ? `calc(${a.x}% + ${a.w}% + 10px)` : `calc(${a.x}% - 10px)`,
    top: `calc(${a.y}% - 4px)`,
    transform: preferRight ? 'translateX(0)' : 'translateX(-100%)',
  }
}

function onMapMove(e: MouseEvent) {
  if (!hovered.value) return
  const a = hovered.value
  tooltipStyle.value = calcTooltipStyle(a)

  void e
}

const trendOption = computed(() => {
  return {
    grid: { left: 80, right: 16, top: 8, bottom: 12 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'var(--chart-tooltip-bg)',
      borderColor: 'var(--chart-tooltip-border)',
      textStyle: { color: 'var(--chart-tooltip-text)' },
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: 'var(--chart-axis-label)' },
      splitLine: { lineStyle: { color: 'var(--chart-axis-split)' } },
    },
    yAxis: {
      type: 'category',
      data: data.trend.categories,
      axisLabel: { color: 'var(--chart-axis-label)' },
      axisLine: { lineStyle: { color: 'var(--chart-axis-line)' } },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: data.trend.values,
        barWidth: 10,
        showBackground: true,
        backgroundStyle: { color: 'var(--chart-bar-bg)' },
        itemStyle: {
          borderRadius: [6, 6, 6, 6],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: 'var(--chart-bar-color-start)' },
              { offset: 1, color: 'var(--chart-bar-color-end)' },
            ],
          },
        },
      },
    ],
  }
})

const donutOption = computed(() => {
  const colors = ['var(--donut-color-1)', 'var(--donut-color-2)', 'var(--donut-color-3)']
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'var(--chart-tooltip-bg)',
      borderColor: 'var(--chart-tooltip-border)',
      textStyle: { color: 'var(--chart-tooltip-text)' },
    },
    legend: {
      orient: 'vertical',
      right: 8,
      top: 'middle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: 'var(--chart-legend-text)' },
    },
    series: [
      {
        name: '缺陷闭环',
        type: 'pie',
        radius: ['55%', '75%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: data.donut.segments.map((s, idx) => ({ ...s, itemStyle: { color: colors[idx] } })),
      },
      {
        name: '内圈',
        type: 'pie',
        radius: ['0%', '48%'],
        center: ['38%', '50%'],
        silent: true,
        label: {
          show: true,
          position: 'center',
          formatter: `${data.donut.total}`,
          color: 'var(--chart-tooltip-text)',
          fontSize: 28,
          fontWeight: 700,
        },
        data: [{ value: 1, name: 'total', itemStyle: { color: 'var(--donut-color-4)' } }],
      },
    ],
  }
})
</script>

<style scoped>
.pv-screen {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  color: var(--text-primary);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji',
    'Segoe UI Emoji';
}

.bg {
  position: absolute;
  inset: 0;
  background: var(--gradient-radial-1), var(--gradient-radial-2), var(--gradient-linear-1);
}
.bg::before {
  content: '';
  position: absolute;
  inset: -2px;
  background-image: var(--bg-pattern-1);
  background-size: var(--grid-size) var(--grid-size);
  opacity: var(--grid-opacity);
  transform: translateZ(0);
  pointer-events: none;
}
.bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-radial-5);
  pointer-events: none;
}

.topbar {
  position: relative;
  z-index: 2;
  height: var(--size-6xl);
  padding: 0 var(--gap-3xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--topbar-bg);
  border-bottom: var(--border-medium);
  box-shadow: var(--topbar-shadow), var(--topbar-shadow-inner);
}

.topbar::before {
  content: '';
  position: absolute;
  left: var(--gap-3xl);
  right: var(--gap-3xl);
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--topbar-line), transparent);
  opacity: 1;
}

.topbar::after {
  content: '';
  position: absolute;
  left: var(--gap-3xl);
  right: var(--gap-3xl);
  bottom: -1px;
  height: var(--size-xs);
  background: var(--gradient-radial-4);
  filter: var(--blur-sm);
  pointer-events: none;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: var(--gap-3xl);
  min-width: 360px;
}

.topbar-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(760px, calc(100vw - 360px - 360px - 120px));
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.center-title {
  width: 100%;
  height: var(--size-4xl);
  display: grid;
  grid-template-columns: 1fr var(--size-sm) auto var(--size-sm) 1fr;
  align-items: center;
  column-gap: var(--gap-lg);
}

.center-text {
  font-size: var(--font-xl);
  font-weight: var(--font-weight-black);
  letter-spacing: 4px;
  line-height: 1;
  padding: 0 var(--gap-sm);
  background: var(--gradient-linear-10);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: var(--glow-text), var(--glow-text-stronger);
}

.center-line {
  position: relative;
  height: 1px;
  background: var(--gradient-linear-3);
  filter: var(--chart-shadow);
}

.center-line.right {
  transform: scaleX(-1);
}

.center-cap {
  width: var(--size-sm);
  height: var(--size-sm);
  transform: rotate(45deg);
  border: var(--border-strongest);
  box-shadow: var(--glow-medium);
  background: var(--gradient-linear-8);
}

.center-cap.left {
  justify-self: end;
}

.center-cap.right {
  justify-self: start;
}

.brand-mark {
  width: var(--size-xs);
  height: var(--size-xl);
  border-radius: var(--radius-xs);
  background: var(--brand-gradient);
  box-shadow: var(--brand-shadow);
}

.brand-title {
  font-size: var(--font-lg);
  letter-spacing: 1px;
  font-weight: var(--font-weight-heavy);
  background: var(--gradient-linear-11);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: var(--glow-text);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--gap-3xl);
  min-width: 360px;
  justify-content: flex-end;
}

.search {
  height: var(--size-2xl);
  width: 220px;
  display: flex;
  align-items: center;
  gap: var(--gap-md);
  padding: 0 var(--gap-3xl);
  border-radius: var(--radius-sm);
  background: var(--input-bg);
  border: var(--border-heavy);
  box-shadow: var(--input-shadow);
}
.search-icon {
  width: var(--font-xs);
  height: var(--font-xs);
  border: 2px solid var(--search-icon-border);
  border-radius: var(--radius-full);
  position: relative;
}
.search-icon::after {
  content: '';
  position: absolute;
  width: var(--size-xs);
  height: 2px;
  background: var(--search-icon-shadow);
  right: -6px;
  bottom: -4px;
  transform: rotate(45deg);
  border-radius: var(--radius-xs);
}
.search-input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: var(--font-sm);
}
.search-input::placeholder {
  color: var(--text-placeholder);
}

.filter-btn {
  height: var(--size-2xl);
  padding: 0 var(--gap-3xl);
  border-radius: var(--radius-sm);
  background: var(--btn-bg-idle);
  border: var(--btn-border-idle);
  color: var(--btn-text-idle);
  cursor: pointer;
  font-size: var(--font-sm);
  font-weight: var(--font-weight-medium);
  letter-spacing: 1px;
}
.filter-btn:hover {
  border-color: var(--btn-border-hover);
  box-shadow: var(--btn-shadow-hover);
}

.time {
  padding-left: var(--gap-sm);
  font-size: var(--font-xs);
  color: var(--text-dim);
  letter-spacing: 0.5px;
}

.content {
  position: relative;
  z-index: 2;
  height: calc(100vh - 72px - 56px);
  padding: var(--gap-2xl) var(--gap-2xl) var(--gap-3xl);
  display: grid;
  grid-template-columns: 340px minmax(520px, 1fr) 340px;
  gap: var(--gap-2xl);
}

.col {
  display: flex;
  flex-direction: column;
  gap: var(--gap-2xl);
  min-height: 0;
}

.panel {
  position: relative;
  background:
    radial-gradient(circle at 20% 80%, rgba(0, 212, 255, var(--opacity-overlay-1)) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(38, 119, 255, var(--opacity-overlay-2)) 0%, transparent 50%),
    var(--gradient-linear-12);
  background-image:
    radial-gradient(circle at 20% 80%, rgba(0, 212, 255, var(--opacity-overlay-1)) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(38, 119, 255, var(--opacity-overlay-2)) 0%, transparent 50%),
    var(--gradient-linear-12),
    var(--bg-pattern-2);
  border: var(--border-thin);
  border-radius: var(--radius-sm);
  box-shadow: var(--panel-shadow-combined);
  overflow: hidden;
  backdrop-filter: blur(1px);
}

.panel::before,
.panel::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.panel::before {
  inset: 0;
  background:
    var(--gradient-linear-4) 0 0 / 100% 1px no-repeat,
    var(--gradient-linear-5) 0 0 / 1px 100% no-repeat,
    var(--gradient-linear-4) 100% 100% / 100% 1px no-repeat,
    var(--gradient-linear-5) 100% 100% / 1px 100% no-repeat;
  opacity: 0.75;
}

.panel::after {
  inset: -1px;
  border-radius: var(--radius-sm);
  box-shadow: var(--panel-shadow-inner-light), var(--panel-shadow-outer-glow);
}

.panel::before,
.panel::after {
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.panel > .panel-corner {
  position: absolute;
  width: var(--size-sm);
  height: var(--size-sm);
  border: var(--border-strong);
  box-shadow: var(--corner-shadow);
  pointer-events: none;
}

.panel > .panel-corner.tl {
  left: var(--gap-md);
  top: var(--gap-md);
  border-right: 0;
  border-bottom: 0;
}

.panel > .panel-corner.tr {
  right: var(--gap-md);
  top: var(--gap-md);
  border-left: 0;
  border-bottom: 0;
}

.panel > .panel-corner.bl {
  left: var(--gap-md);
  bottom: var(--gap-md);
  border-right: 0;
  border-top: 0;
}

.panel > .panel-corner.br {
  right: var(--gap-md);
  bottom: var(--gap-md);
  border-left: 0;
  border-top: 0;
}

.panel-hd {
  padding: var(--gap-lg) var(--gap-3xl) var(--gap-md);
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  position: relative;
  border-bottom: var(--border-dashed-dim);
  background: var(--panel-hd-bg);
}

.panel-hd::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--size-xs);
  background: var(--panel-hd-gradient);
  box-shadow: var(--panel-hd-shadow);
}

.panel-hd::after {
  content: '';
  position: absolute;
  left: var(--size-xs);
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 6px solid var(--panel-hd-arrow);
  filter: var(--panel-hd-arrow-shadow);
}

.panel-title {
  font-size: var(--font-md);
  font-weight: var(--font-weight-bold);
  letter-spacing: 1px;
  color: var(--text-primary);
}

.panel-sub {
  font-size: var(--font-xs);
  color: var(--text-very-weak);
}

.panel-bd {
  padding: 0 var(--gap-3xl) var(--gap-3xl);
}

.map {
  flex: 1;
  min-height: 0;
}

.map-wrap {
  position: relative;
  height: calc(100vh - 72px - 56px - 14px - 12px - 46px);
  min-height: 520px;
  border-radius: var(--map-corner-radius);
  overflow: hidden;
}

.map-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: var(--filter-saturate);
}

.hot {
  position: absolute;
  border: 2px solid var(--hot-border-idle);
  box-shadow: var(--glow-warning-medium), var(--glow-warning-inner-weak);
  border-radius: var(--radius-md);
  background: var(--hot-bg-idle);
  cursor: pointer;
  transition: var(--transition-base);
}

.hot:hover {
  background: var(--hot-bg-hover);
  box-shadow: var(--glow-warning-strong), var(--glow-warning-inner-strong);
  border-color: var(--hot-border-hover);
}

.tooltip {
  position: absolute;
  max-width: 260px;
  padding: 0;
  border-radius: var(--radius-xl);
  background: var(--tooltip-bg);
  border: var(--border-heavy);
  box-shadow: var(--tooltip-shadow), var(--tooltip-shadow-inner);
  white-space: pre-line;
  overflow: hidden;
  backdrop-filter: var(--blur-md);
}

.tooltip-title {
  padding: var(--gap-lg) var(--gap-3xl) var(--gap-md);
  font-size: var(--font-sm);
  font-weight: var(--font-weight-bold);
  background: var(--gradient-linear-6);
  border-bottom: var(--border-dashed);
}

.tooltip-body {
  padding: var(--gap-md) var(--gap-3xl) var(--gap-lg);
  font-size: var(--font-xs);
  color: var(--text-muted);
  line-height: 1.45;
}

.tooltip-actions {
  display: flex;
  gap: var(--gap-sm);
  padding: var(--gap-md) var(--gap-3xl) var(--gap-lg);
  background: rgba(0, 212, 255, var(--opacity-overlay-3));
  border-top: var(--border-dashed);
}

.tooltip-btn {
  flex: 1;
  height: var(--size-xl);
  padding: 0 var(--gap-lg);
  border-radius: var(--radius-sm);
  background: var(--btn-bg-hover);
  border: var(--btn-border-hover);
  color: var(--btn-text-hover);
  font-size: var(--font-xs);
  cursor: pointer;
  transition: var(--transition-base);
}

.tooltip-btn:hover {
  background: var(--btn-bg-active);
  border-color: var(--btn-border-active);
  box-shadow: var(--btn-shadow-active);
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: var(--size-3xl);
  height: var(--size-3xl);
  border-radius: var(--radius-full);
  background: var(--nav-bg);
  border: var(--nav-border);
  box-shadow: var(--nav-shadow), var(--nav-shadow-inner);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-base);
}

.nav-arrow:hover {
  background: var(--nav-bg-hover);
  border-color: var(--nav-border-hover);
  box-shadow: var(--nav-shadow-hover), var(--nav-shadow-hover-inner);
}

.nav-left {
  left: var(--gap-3xl);
}

.nav-right {
  right: var(--gap-3xl);
}

.arrow-icon {
  width: 0;
  height: 0;
  border-style: solid;
}

.nav-left .arrow-icon {
  border-width: 7px 12px 7px 0;
  border-right-color: rgba(0, 212, 255, 0.9);
}

.nav-right .arrow-icon {
  border-width: 7px 0 7px 12px;
  border-left-color: rgba(0, 212, 255, 0.9);
}

.empty {
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--gap-lg);
  opacity: 0.9;
}

.empty-icon {
  width: var(--size-3xl);
  height: var(--size-3xl);
  border-radius: var(--radius-full);
  border: var(--empty-icon-border);
  box-shadow: var(--empty-icon-shadow);
}

.empty-text {
  font-size: var(--font-xs);
  color: var(--text-weak);
}

.table {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: var(--border-dashed-dim);
}

.tr {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr 0.7fr;
}

.thead {
  background: var(--table-bg-header);
}

.th,
.td {
  padding: 9px var(--gap-lg);
  font-size: var(--font-xs);
  border-bottom: var(--border-dashed-dim);
}

.th {
  font-weight: var(--font-weight-bold);
  color: var(--text-placeholder);
}

.tbody .tr:last-child .td {
  border-bottom: none;
}

.tbody .tr:nth-child(2n) {
  background: var(--table-bg-row-hover);
}

.td {
  color: var(--text-dim);
}

.td.num {
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
}

.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gap-lg);
}

.kpi {
  padding: var(--gap-lg);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: var(--card-border);
}

.k {
  font-size: var(--font-xs);
  color: var(--text-very-weak);
  margin-bottom: var(--gap-sm);
}

.v {
  font-size: var(--font-md);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.donut-wrap {
  height: 220px;
}

.mini-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gap-lg);
}

.mini {
  padding: var(--gap-3xl) var(--gap-lg);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: var(--card-border);
  text-align: center;
}

.mini-v {
  font-size: var(--font-xl);
  font-weight: var(--font-weight-heavy);
  color: var(--primary);
  text-shadow: var(--glow-text);
}

.mini-k {
  margin-top: var(--gap-sm);
  font-size: var(--font-xs);
  color: var(--text-weak);
}

.bottombar {
  position: relative;
  z-index: 2;
  height: var(--size-5xl);
  padding: 0 var(--gap-2xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bottombar::before {
  content: '';
  position: absolute;
  left: var(--gap-2xl);
  right: var(--gap-2xl);
  top: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--bottombar-border), transparent);
  opacity: 0.9;
}

.mode {
  display: flex;
  gap: var(--gap-lg);
}

.mode-btn {
  height: var(--size-2xl);
  padding: 0 var(--gap-3xl);
  border-radius: var(--mode-btn-radius);
  background: var(--btn-bg-idle);
  border: var(--btn-border-idle);
  color: var(--btn-text-idle);
  cursor: pointer;
}

.mode-btn.active {
  background: var(--btn-bg-hover);
  border-color: var(--btn-border-hover);
  box-shadow: var(--btn-shadow-hover);
  color: var(--btn-text-hover);
}

.hint {
  font-size: var(--font-xs);
  color: var(--text-very-weak);
}

@media (max-width: 1280px) {
  .content {
    grid-template-columns: 320px minmax(420px, 1fr) 320px;
  }
  .search {
    width: 220px;
  }
}

@media (max-width: 1100px) {
  .content {
    grid-template-columns: 1fr;
  }
}
</style>