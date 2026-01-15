import { persist } from 'zustand/middleware';
import { create } from 'zustand';

const defaultState = {
  activeTab: 'myFavorites',
};

const store = (set) => ({
  ...defaultState,
  setActiveTab: (activeTab) => {
    return set((state) => ({ activeTab: activeTab ?? state.activeTab }));
  },
});

const persistedStore = persist(store, { name: 'pageStore' });

export const usePageStore = create(persistedStore);
