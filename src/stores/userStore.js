import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import { getUserInfo } from '@/api/user';
import { refreshToken } from '@/api/login';

const defaultState = {
  userToken: null,
  tokenType: null,
  refreshToken: null,
  userInfo: {},
  isLogin: false,
};

const store = (set, get) => ({
  ...defaultState,
  setUserInfo: async () => {
    const response = await getUserInfo();
    if (response.code === 0) {
      const { data } = response || {};
      return set((state) => ({ userInfo: data || state.userInfo }));
    }
  },
  login: (authInfo) => {
    const { access_token, token_type, refresh_token } = authInfo || {};
    set(() => ({
      userToken: access_token || null,
      tokenType: token_type || null,
      refreshToken: refresh_token || null,
      isLogin: true,
    }));
  },
  refreshUserToken: async () => {
    try {
      const response = await refreshToken({
        refresh_token: get().refreshToken,
      });
      if (response.code === 0) {
        const { access_token, token_type, refresh_token } = response || {};
        set(() => ({
          userToken: access_token || null,
          tokenType: token_type || null,
          refreshToken: refresh_token || null,
        }));
      } else {
        set(() => defaultState);
      }
    } catch (error) {
      console.warn(error);
      set(() => defaultState);
    }
  },
  clearUserStore: () =>
    set(() => {
      localStorage.removeItem('userStore');
      return defaultState;
    }),
});

const persistedStore = persist(store, { name: 'userStore' });

export const useUserStore = create(persistedStore);
