/**
 * 下载文件
 * @param {Blob} content - 文件内容
 * @param {string} fileName - 文件名
 */
export function downloadFile(content, fileName) {
  // 创建下载链接
  const url = window.URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  // 触发点击事件
  link.click();

  // 清理
  window.URL.revokeObjectURL(url);
}