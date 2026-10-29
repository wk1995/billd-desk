export interface VideoMetric {
  id: string;
  stage: '采集' | '发送' | '接收';
  width?: number;
  height?: number;
  fps?: number;
  bitrateKbps?: number;
  codec?: string;
  limitation?: string;
  framesDropped?: number;
}
export interface VideoSample {
  timestamp: number;
  bytes?: number;
  frames?: number;
}

/** RTP 累计计数差分；首个样本和计数重置时不伪造速率。 */
export function collectVideoMetrics(
  stats: RTCStatsReport,
  previous: Map<string, VideoSample>
): VideoMetric[] {
  const metrics: VideoMetric[] = [];
  const activeIds = new Set<string>();
  stats.forEach((report) => {
    if (report.kind !== 'video') return;
    if (report.type === 'media-source') {
      metrics.push({
        id: report.id,
        stage: '采集',
        width: report.width,
        height: report.height,
        fps: report.framesPerSecond,
      });
      return;
    }
    if (!['outbound-rtp', 'inbound-rtp'].includes(report.type)) return;
    const outgoing = report.type === 'outbound-rtp';
    const bytes = outgoing ? report.bytesSent : report.bytesReceived;
    const frames = outgoing ? report.framesEncoded : report.framesDecoded;
    const before = previous.get(report.id);
    const elapsed = before ? report.timestamp - before.timestamp : 0;
    const rate = (now?: number, old?: number) =>
      elapsed > 0 && now !== undefined && old !== undefined && now >= old
        ? (now - old) / elapsed
        : undefined;
    const byteRate = rate(bytes, before?.bytes);
    const frameRate = rate(frames, before?.frames);
    metrics.push({
      id: report.id,
      stage: outgoing ? '发送' : '接收',
      width: report.frameWidth,
      height: report.frameHeight,
      fps: frameRate === undefined ? report.framesPerSecond : frameRate * 1000,
      bitrateKbps: byteRate === undefined ? undefined : byteRate * 8,
      codec: stats.get(report.codecId)?.mimeType,
      limitation: outgoing ? report.qualityLimitationReason : undefined,
      framesDropped: outgoing ? undefined : report.framesDropped,
    });
    previous.set(report.id, { timestamp: report.timestamp, bytes, frames });
    activeIds.add(report.id);
  });
  previous.forEach((_, id) => {
    if (!activeIds.has(id)) previous.delete(id);
  });
  return metrics;
}
