import { getMusicDetail } from '@/api/music';
import { create } from 'zustand';
import { isEmptyObject } from '@/utils/common/object_util';
import { formatLrc } from '@/utils/common/lyric_util';

const defaultState = {
  playingMusic: {}, // 当前播放音乐
  playList: [], // 播放列表
  musicPlayMode: 'order', // 播放模式
};

const defaultPlayingMusicState = {
  playPosition: 0, // 播放位置
  lyrics: [], // 歌词列表
  nowLyricIndex: -1, // 当前歌词索引
  isMusicPlaying: false, // 音乐是否正在播放
  isMusicLoading: false, // 音乐是否正在加载
  musicDuration: 0, // 音乐总时长
  playingMusicIndex: 0, // 当前播放音乐的索引
  isHasYrc: false, // 是否有歌词
  isHasTrans: false, // 是否有翻译,
};

export const useMusicStore = create((set) => ({
  ...defaultState,
  ...defaultPlayingMusicState,
  setPlayingMusic: (music) => {
    if (!music || isEmptyObject(music)) {
      return set({ playingMusic: {} });
    }
    if (typeof music?.id === 'string') {
      return set({ playingMusic: music });
    }
    getMusicDetail(music?.id).then((res) => {
      if (res.code === 0) {
        set({ playingMusic: res.data || {} });
        const musicExtra = res.data?.musicExtra;
        if (musicExtra) {
          const { lyrics, haveTrans, haveYrc } = formatLrc(musicExtra);
          set({
            lyrics,
            isHasTrans: haveTrans,
            isHasYrc: haveYrc,
          });
        }
      }
    });
  },
  setPlayList: (list = []) => set({ playList: list }),
  addPlayList: (list = []) =>
    set((state) => {
      const newPlayList = [];
      list.forEach((item) => {
        if (!state.playList.some((e) => e?.id === item?.id)) {
          newPlayList.push(item);
        }
      });
      return { playList: [...state.playList, ...newPlayList] };
    }),
  unshiftPlayList: (list = []) =>
    set((state) => {
      const newPlayList = [];
      list.forEach((item) => {
        if (!state.playList.some((e) => e?.id === item?.id)) {
          newPlayList.unshift(item);
        }
      });
      return { playList: [...newPlayList, ...state.playList] };
    }),
  removePlayList: (list = []) =>
    set((state) => {
      const newPlayList = [...state.playList];
      list.forEach((item) => {
        const index = state.playList.findIndex((e) => e?.id === item?.id);
        if (index > -1) {
          newPlayList.splice(index, 1);
        }
      });
      return { playList: newPlayList };
    }),
  setIsMusicPlaying: (flag) => set({ isMusicPlaying: flag ?? false }),
  setIsMusicLoading: (flag) => set({ isMusicLoading: flag ?? false }),
  setMusicDuration: (duration) => set({ musicDuration: duration || 0 }),
  setPlayingMusicIndex: (index) => set({ playingMusicIndex: index || 0 }),
  setPlayPosition: (position) =>
    set((state) => {
      if (position === state.playPosition) {
        return state;
      }
      state.playPosition = position;
      const _Lyrics = state.lyrics;

      if (_Lyrics.length === 0) {
        const newState = {
          ...state,
          nowLyricIndex: -1,
        };
        return newState;
      }

      for (let i = 0; i < _Lyrics.length; i++) {
        const matchTime = state.isHasYrc
          ? _Lyrics[i].startTime
          : _Lyrics[i].time;
        if (matchTime > position * 1000) {
          const newState = {
            ...state,
            nowLyricIndex: i - 1,
          };
          return newState;
        }
      }
      const newState = {
        ...state,
        nowLyricIndex: _Lyrics.length - 1,
      };
      return newState;
    }),
  resetPlayingMusic: () => set(defaultPlayingMusicState),
  setMusicPlayMode: (mode) => set({ musicPlayMode: mode || 'order' }),
}));
