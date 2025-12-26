/**
 * 将下划线分隔的字符串转换为驼峰命名
 * @param {string} str - 下划线分隔的字符串
 * @returns {string} 驼峰命名的字符串
 */
export function toCamelCase(str) {
  return str.replace(/(_\w)/g, (match) => match[1].toUpperCase());
}

/**
 * 将下划线分隔的字符串转换为驼峰命名，并首字母大写
 * @param {string} str - 下划线分隔的字符串
 * @returns {string} 驼峰命名的字符串，首字母大写
 */
export function toFirstUpperCase(str) {
  const camelCaseName = toCamelCase(str);
  return camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1);
}

/**
 * 将字符串复制到剪贴板
 * @param {string} str - 要复制的字符串
 * @returns {boolean} - 是否复制成功
 */
export async function copyToClipboard(str) {
  try {
    if (!navigator.clipboard) {
      console.error('Clipboard API not supported');
      return false;
    }
    await navigator.clipboard.writeText(str);
    console.log('Text copied to clipboard');
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

/**
 * 判断是否为空字符串
 * @param {string} str 字符串
 * @returns {boolean} 是否为空字符串
 */
export const isEmptyString = (str) => {
  return str === null || str === undefined || str === '' || str.trim() === '';
};

/**
 * 将毫秒转换为分秒格式
 * @param {number} ms 毫秒
 * @returns {string} 分秒格式字符串
 */
export const formatMilliSeconds = (ms) => {
  const totalSeconds = Math.floor(ms);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
};
