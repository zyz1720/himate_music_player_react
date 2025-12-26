/**
 * 移除对象中的空值（null、undefined、空字符串）
 * @param {Object} obj - 初始对象
 * @returns {Object} 移除空值的对象
 * @example
 * const obj = { a: 1, b: null, c: undefined, d: '', e: 'hello' };
 * removeEmptyValues(obj); // { a: 1, e: 'hello' }
 */

export function removeEmptyValues(obj) {
  const clonedObj = { ...obj };
  return Object.fromEntries(
    Object.entries(clonedObj).filter(
      ([_, value]) => value !== null && value !== undefined && value !== '',
    ),
  );
}

/**
 * 将 URLSearchParams 对象转换为对象
 * @param {URLSearchParams} searchParams - URLSearchParams 对象
 * @returns {Object} 转换后的对象
 * @example
 * const searchParams = new URLSearchParams('a=1&b=2&c=3');
 * searchParamsToObject(searchParams); // { a: '1', b: '2', c: '3' }
 */
export function searchParamsToObject(searchParams) {
  return Object.fromEntries(searchParams.entries());
}

/**
 * 将对象转换为字符串，键值对之间用冒号分隔
 * @param {Object} obj - 初始对象
 * @returns {string} 转换后的字符串
 * @example
 * const obj = { a: 1, b: 2, c: 3 };
 * formatToObjectStr(obj); // 'a:1,b:2,c:3'
 */
export function formatToObjectStr(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return '';
  }
  return JSON.stringify(obj).replace(/"([^"]+)":/g, '$1:');
}

/**
 * 将对象转换为枚举字符串
 * @param {Object} obj - 初始对象
 * @returns {string} 转换后的枚举字符串
 * @example
 * const obj = { a: '1', b: '2', c: '3' };
 * objectToEnumStr(obj); // 'a:1 b:2 c:3'
 */
export function objectToEnumStr(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  return Object.entries(obj || {})
    .map(([key, value]) => `${key}:${value}`)
    .join('\n');
}

/**
 * 检查对象是否为空（不包含任何属性）
 * @param {Object} obj - 初始对象
 * @returns {boolean} 如果对象为空则返回 true，否则返回 false
 * @example
 * const obj = {};
 * isEmptyObject(obj); // true
 * const obj2 = { a: 1 };
 * isEmptyObject(obj2); // false
 */
export function isEmptyObject(obj) {
  return Object.keys(obj || {}).length === 0;
}

/**
 * 只保留分页参数
 * @param {Object} obj - 初始对象
 * @returns {Object} 只包含分页参数的对象
 * @example
 * const obj = { page: 1, pageSize: 10 };
 * onlyPageParams(obj); // { page: 1, pageSize: 10 }
 * const obj2 = { a: 1, b: 2 };
 * onlyPageParams(obj2); // {}
 */
export function onlyPageParams(params) {
  const { current = 1, pageSize = 10 } = params || {};
  return { current, pageSize };
}

/** 
格式化带有文件的表单数据，将文件数组转换为文件对象
* @param {Object} obj - 初始对象
* @returns {Object} 格式化后的对象
*/
export function formatWithFiles(obj) {
  const newForm = { ...obj };
  Object.entries(newForm).forEach(([key, value]) => {
    if (key.endsWith('_files') && Array.isArray(value) && value.length > 0) {
      newForm[key.replace('_files', '')] =
        value?.length > 1
          ? value.map((item) => item?.response || '')
          : value[0]?.response || '';
      delete newForm[key];
    }
  });
  return newForm;
}
