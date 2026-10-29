<template>
  <div class="rtc-quality">
    <div>实时画面（每秒更新，码率为实际视频 RTP 速率）</div>
    <div v-if="!metrics.length">等待视频统计…</div>
    <table v-else>
      <thead>
        <tr>
          <th>阶段</th>
          <th>分辨率</th>
          <th>kbps</th>
          <th>fps</th>
          <th>编码 / 限制</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in metrics"
          :key="row.id"
        >
          <td>{{ row.stage }}</td>
          <td>
            {{ row.width && row.height ? `${row.width}×${row.height}` : '—' }}
          </td>
          <td>{{ number(row.bitrateKbps) }}</td>
          <td>{{ number(row.fps) }}</td>
          <td>
            {{ row.codec || '—' }} {{ row.limitation || ''
            }}<span v-if="row.framesDropped !== undefined">
              丢帧 {{ row.framesDropped }}</span
            >
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="display">显示：{{ display }}</div>
  </div>
</template>
<script setup lang="ts">
import type { VideoMetric } from '@/utils/network/videoStats';

defineProps<{ metrics: VideoMetric[]; display?: string }>();
const number = (value?: number) =>
  value === undefined ? '—' : value.toFixed(1);
</script>
<style scoped>
.rtc-quality {
  font-size: 12px;
  line-height: 1.6;
  margin: 8px 0;
  overflow-x: auto;
}
table {
  border-collapse: collapse;
  width: 100%;
}
th,
td {
  padding: 3px 6px;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid #ddd;
}
</style>
