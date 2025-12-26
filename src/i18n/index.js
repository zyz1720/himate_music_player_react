import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useSettingStore } from '@/stores/settingStore';
import { loadLangs } from '@/utils/common/i18n_util';

const locale = useSettingStore.getState().locale;
const resources = loadLangs();

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'zh-CN',
  lng: locale || 'zh-CN',
  debug: process.env.NODE_ENV === 'development',
});

export default i18n;
