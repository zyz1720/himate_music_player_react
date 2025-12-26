import { useUserStore } from '@/stores/userStore.js';
import { useSettingStore } from '@/stores/settingStore.js';
import { showErrorMessage } from '@/utils/common/message_util.js';
import axios from 'axios';
import i18n from 'i18next';

const baseUrl = import.meta.env.VITE_BASE_URL;
const apiPrefix = import.meta.env.VITE_API_PREFIX;

const instance = axios.create({
  baseURL: baseUrl + apiPrefix,
  timeout: 30000,
});

// 请求拦截器修改为接受store作为参数
instance.interceptors.request.use(
  function (config) {
    const { tokenType, userToken } = useUserStore.getState();
    const { locale } = useSettingStore.getState();
    if (tokenType && userToken) {
      config.headers.Authorization = `${tokenType} ${userToken}`;
    }
    config.headers['x-custom-lang'] = locale.split('-')[0];
    return config;
  },
  function (error) {
    console.error(error);
    return Promise.reject(error);
  },
);

// 响应拦截器
instance.interceptors.response.use(
  function (res) {
    if (res.data.code === 0) {
      return res.data;
    } else {
      return Promise.resolve(res.data);
    }
  },
  function (error) {
    console.error('axios error ' + error);

    const { refreshUserToken } = useUserStore.getState();

    let { message, response } = error;

    let responseMsg = response?.data?.message;

    if (message == 'Network Error') {
      message = i18n.t('http.error');
    } else if (message.includes('timeout')) {
      message = i18n.t('http.timeout');
    } else if (message.includes('Request failed with status code')) {
      const code = message.substr(message.length - 3);
      const knownCodes = ['400', '401', '403', '404'];

      if (code == '401') {
        refreshUserToken();
        return Promise.reject(error);
      }
      message = knownCodes.includes(code)
        ? i18n.t(`http.${code}`)
        : i18n.t('http.code', { code: code });
    }

    showErrorMessage(responseMsg || message);
    return Promise.reject(error);
  },
);

export default instance;
