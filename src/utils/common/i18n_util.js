/**
 * Load all translation files and structure them for i18next
 * @returns {Object} i18next resources object
 */

export function loadLangs() {
  // 使用 Vite 的 import.meta.glob 批量导入所有翻译文件
  const translationFiles = import.meta.glob('@/i18n/langs/**/*.json', {
    eager: true,
  });

  // 构建资源对象，只使用默认命名空间
  const resources = {};

  // 遍历所有导入的文件
  Object.entries(translationFiles).forEach(([path, module]) => {
    // 从路径中提取语言代码，例如从 './locales/zh-CN/http.json' 中提取 'zh-CN'
    const match = path.match(/\/langs\/(\w+(?:-\w+)?)(?:\/.+)?\.json$/);

    if (match && match[1]) {
      const langCode = match[1];
      if (!resources[langCode]) {
        resources[langCode] = { translation: {} };
      }
      if (module.default) {
        const langs = {};
        const fileName = match[0].split('/').pop().replace('.json', '');
        langs[fileName] = module.default;
        Object.assign(resources[langCode].translation, langs);
      }
    }
  });
  return resources;
}
