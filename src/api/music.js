import instance from '@/utils/request/axios_instance';

// 获取音乐列表
export const getMusic = (params) => instance.get('app/music', { params });

// 音乐详情
export const getMusicDetail = (id) => instance.get(`app/music/${id}/detail`);

// 获取收藏夹音乐列表
export const getMusicFromFavorites = (favoritesId, params) =>
  instance.get(`app/music/${favoritesId}/favorites`, { params });

// 获取歌单列表
export const getFavorites = (params) =>
  instance.get('app/favorites', { params });

// 获取自己的所有歌单
export const getOneselfFavorites = (params) =>
  instance.get('app/favorites/oneself', { params });

// 歌单详情
export const getFavoritesDetail = (id) =>
  instance.get(`app/favorites/${id}/detail`);
