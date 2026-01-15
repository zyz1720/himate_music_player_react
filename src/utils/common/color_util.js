/**
 * 判断颜色是否接近白色
 * @param {number[]} color - RGB颜色数组，值在0-1之间
 * @param {number} threshold - 阈值，默认0.9
 * @returns {boolean} - 是否接近白色
 */
export const isColorCloseToWhite = (color, threshold = 0.9) => {
  if (!Array.isArray(color) || color.length !== 3) {
    return false;
  }
  return color[0] > threshold && color[1] > threshold && color[2] > threshold;
};

/**
 * 获取图片的主颜色
 * @param {string} url - 图片 URL
 * @param {number} sampleSize - 采样像素数（默认 5）
 * @returns {Promise<{r: number, g: number, b: number} | null>} - 主颜色对象（RGB 格式）或 null
 */
export const getDominantColor = (url, sampleSize = 5) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const imageElement = new Image();
    imageElement.crossOrigin = 'anonymous';
    imageElement.src = url;

    // 等待图片加载完成
    imageElement.onload = () => {
      // 设置 canvas 尺寸
      canvas.width = imageElement.naturalWidth;
      canvas.height = imageElement.naturalHeight;

      // 绘制图片到 canvas
      ctx.drawImage(imageElement, 0, 0);

      // 获取像素数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 颜色统计对象
      const colorCount = {};
      let maxCount = 0;
      let dominantColor = null;

      // 抽样分析像素（提高性能）
      for (let i = 0; i < data.length; i += 4 * sampleSize) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 跳过透明像素
        if (data[i + 3] < 128) continue;

        // 将颜色值分组，避免微小差异
        const colorKey = `${Math.round(r / 10) * 10},${
          Math.round(g / 10) * 10
        },${Math.round(b / 10) * 10}`;

        colorCount[colorKey] = (colorCount[colorKey] || 0) + 1;

        if (colorCount[colorKey] > maxCount) {
          maxCount = colorCount[colorKey];
          dominantColor = colorKey.split(',').map(Number);
        }
      }

      resolve(
        dominantColor
          ? [
              Math.ceil((dominantColor[0] / 255) * 10) / 10,
              Math.ceil((dominantColor[1] / 255) * 10) / 10,
              Math.ceil((dominantColor[2] / 255) * 10) / 10,
            ]
          : null,
      );
    };
  });
};
