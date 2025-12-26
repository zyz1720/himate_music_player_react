import { persist } from 'zustand/middleware';
import { create } from 'zustand';

const defaultState = {
  locale: 'zh-CN',
};

const store = (set) => ({
  ...defaultState,
  setLocale: (locale) => {
    return set((state) => ({ locale: locale ?? state.locale }));
  },
});

const persistedStore = persist(store, { name: 'settingStore' });

export const useSettingStore = create(persistedStore);
