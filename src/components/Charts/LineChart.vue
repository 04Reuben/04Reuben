<template>
  <div ref="elRef" class="chart" :style="{ height, width }" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsType, SetOptionOpts } from 'echarts/core'

// 按需注册（避免全量引入）
echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

type ECOption = echarts.EChartsOption

const props = withDefaults(
  defineProps<{
    option: ECOption
    height?: string
    width?: string
    /**
     * 是否开启自动 resize（基于 ResizeObserver）
     * 适用于布局变化场景，默认开启
     */
    autoResize?: boolean
    /**
     * setOption 的附加参数
     */
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
    // 防止重复 init，仅更新 option
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
