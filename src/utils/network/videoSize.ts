export type VideoDisplayMode = 'fit' | 'native';

/** 原始模式按物理像素 1:1 显示，窗口较小时允许滚动。 */
export function videoDisplaySize(
  width: number,
  height: number,
  wrapWidth: number,
  wrapHeight: number,
  pixelRatio: number,
  mode: VideoDisplayMode
) {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 };
  const ratio = pixelRatio > 0 ? pixelRatio : 1;
  const scale =
    mode === 'native'
      ? 1 / ratio
      : Math.max(0, Math.min(wrapWidth / width, wrapHeight / height));
  return { width: width * scale, height: height * scale };
}
