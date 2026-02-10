<template>
  <div ref="elRef" class="chart" :style="{ height, width }" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsType, SetOptionOpts } from 'echarts/core'

// 默认注册渲染器；图表/组件请在 option 内使用的系列按需在页面或此处扩展注册
// 这里保持通用组件的最小可运行能力
// eslint-disable-next-line import/no-named-as-default-member
if ((echarts as any).use) {
  echarts.use([CanvasRenderer])
}

type ECOption = echarts.EChartsOption

const props = withDefaults(
  defineProps<{
    option: ECOption
    height?: string
    width?: string
    autoResize?: boolean
    setOptionOpts?: SetOptionOpts
  }>(),
  {
    height: '260px',
    width: '100%',
    autoResize: true,
    setOptionOpts: () => ({ notMerge: true, lazyUpdate: true }),
  },
)

const elRef = ref<HTMLDivElement | null>(null)
const chartRef = shallowRef<EChartsType | null>(null)

let ro: ResizeObserver | null = null
let rafId: number | null = null

function initChart() {
  const el = elRef.value
  if (!el) return

  if (!chartRef.value) {
    chartRef.value = echarts.init(el)
  }

  chartRef.value.setOption(props.option, props.setOptionOpts)
}

function scheduleResize() {
  if (!chartRef.value) return
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    chartRef.value?.resize()
  })
}

onMounted(() => {
  initChart()

  if (props.autoResize && elRef.value) {
    ro = new ResizeObserver(() => {
      scheduleResize()
    })
    ro.observe(elRef.value)
  }
})

watch(
  () => props.option,
  () => {
    if (!chartRef.value) {
      initChart()
      return
    }
    chartRef.value.setOption(props.option, props.setOptionOpts)
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null

  if (ro && elRef.value) {
    ro.unobserve(elRef.value)
  }
  ro = null

  if (chartRef.value) {
    chartRef.value.dispose()
    chartRef.value = null
  }
})
</script>

<style scoped>
.chart {
  display: block;
}
</style>
