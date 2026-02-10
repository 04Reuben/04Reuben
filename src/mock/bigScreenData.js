export const bigScreenMock = {
  station: {
    name: '光伏电站 - A区',
    code: 'PV-A-001',
    location: '宁夏·银川',
    capacityMW: 120,
    runningDays: 236,
    onlineRate: 98.6,
    healthIndex: 92,
    updatedAt: '2026-02-06 14:08:21',
  },

  trend: {
    categories: ['热斑', '隐裂', '遮挡', '破损', '污染', '接线异常', '逆变器告警', '其他'],
    values: [32, 18, 14, 12, 10, 8, 6, 4],
  },

  donut: {
    total: 104,
    segments: [
      { name: '已闭环', value: 62 },
      { name: '处理中', value: 28 },
      { name: '待派单', value: 14 },
    ],
  },

  defectCards: [
    { label: '今日新增', value: 8 },
    { label: '未处理', value: 14 },
    { label: '处理中', value: 28 },
    { label: '已闭环', value: 62 },
    { label: '高危', value: 6 },
    { label: '复检待确认', value: 9 },
  ],

  defectTable: {
    columns: [
      { key: 'type', title: '缺陷类型' },
      { key: 'count', title: '数量' },
      { key: 'rate', title: '占比' },
    ],
    rows: [
      { type: '热斑', count: 32, rate: '30.8%' },
      { type: '隐裂', count: 18, rate: '17.3%' },
      { type: '遮挡', count: 14, rate: '13.5%' },
      { type: '破损', count: 12, rate: '11.5%' },
      { type: '污染', count: 10, rate: '9.6%' },
      { type: '接线异常', count: 8, rate: '7.7%' },
      { type: '逆变器告警', count: 6, rate: '5.8%' },
      { type: '其他', count: 4, rate: '3.8%' },
    ],
  },

  recentTasks: {
    emptyText: '暂无最近任务',
  },

  map: {
    imageAlt: '航拍占位图',
    hotAreas: [
      {
        id: 'A1',
        name: '1#方阵-东南角',
        status: '高亮关注',
        x: 18,
        y: 36,
        w: 22,
        h: 18,
        tip: '热斑疑似：12处\n建议：派单复检',
      },
      {
        id: 'B2',
        name: '2#方阵-中部',
        status: '复检中',
        x: 58,
        y: 52,
        w: 26,
        h: 20,
        tip: '隐裂疑似：6处\n建议：复检确认',
      },
      {
        id: 'C3',
        name: '3#方阵-西北角',
        status: '待确认',
        x: 14,
        y: 18,
        w: 22,
        h: 18,
        tip: '遮挡疑似：3处\n建议：复检确认',
      },
    ],
  },
}
