import { message, Button, Drawer, Slider, Modal, Tooltip } from 'antd';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  MenuOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  SyncOutlined,
  DeleteOutlined,
  ClearOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Outlet } from 'react-router';
import { useMusicStore } from '@/stores/musicStore';
import { isEmptyObject } from '@/utils/common/object_util';
import { formatMilliSeconds } from '@/utils/common/string_util';

const STATIC_URL = import.meta.env.VITE_STATIC_URL;

function MusicController() {
  const { t } = useTranslation();
  const [isLyricDrawerOpen, setIsLyricDrawerOpen] = useState(false);
  const [currentView, setCurrentView] = useState('music'); // 'music' or 'lyrics'
  const [isPlaylistDrawerOpen, setIsPlaylistDrawerOpen] = useState(false);

  // 从音乐状态管理中获取状态
  const {
    playList,
    playingMusic,
    playingMusicIndex,
    setPlayingMusicIndex,
    setPlayingMusic,
    isMusicPlaying,
    setIsMusicPlaying,
    playPosition,
    setPlayPosition,
    musicDuration,
    setMusicDuration,
    musicPlayMode,
    setMusicPlayMode,
    isMusicLoading,
    setIsMusicLoading,
    lyrics,
    nowLyricIndex,
    isHasTrans,
    resetPlayingMusic,
    removePlayList,
    setPlayList,
  } = useMusicStore();

  // 歌词显示状态
  const audioRef = useRef(null);

  const lyricContainerRef = useRef(null);
  const lyricItemRefs = useRef([]);

  // 播放当前音乐
  const playCurrentMusic = async () => {
    if (!playingMusic?.file_key) {
      return;
    }

    try {
      setIsMusicLoading(true);
      const url = STATIC_URL + playingMusic?.file_key;
      if (audioRef.current.src !== url) {
        audioRef.current.src = url;
      }
      await audioRef.current.play();
      setPlayingMusicIndex(
        playList.findIndex((item) => item.id === playingMusic.id),
      );
      setIsMusicPlaying(true);
    } catch (error) {
      console.error('播放失败:', error);
      message.error(t('music.unable_to_play'));
    } finally {
      setIsMusicLoading(false);
    }
  };

  // 暂停当前音乐
  const pauseCurrentMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    }
  };

  // 播放或暂停
  const playOrPause = () => {
    if (isEmptyObject(playingMusic)) {
      message.warning(t('music.no_music'));
      return;
    }

    if (isMusicPlaying) {
      pauseCurrentMusic();
    } else {
      playCurrentMusic();
    }
  };

  // 删除单个歌曲
  const handleRemoveSong = (item, event) => {
    event.stopPropagation();
    removePlayList([item]);
    message.success(t('music.removed_from_playlist'));
  };

  // 清空播放列表
  const handleClearPlaylist = () => {
    if (playList.length === 0) return;

    Modal.confirm({
      title: t('music.clear_playlist'),
      content: t('music.confirm_clear_playlist'),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk() {
        setPlayList([]);
        message.success(t('music.playlist_cleared'));
      },
    });
  };

  // 上一首
  const previousTrack = () => {
    if (playList.length === 0) {
      message.warning(t('music.no_music'));
      return;
    }

    const newIndex =
      playingMusicIndex === 0 ? playList.length - 1 : playingMusicIndex - 1;

    setPlayingMusic(playList[newIndex]);
  };

  // 下一首
  const nextTrack = () => {
    const { playList, playingMusicIndex, musicPlayMode } =
      useMusicStore.getState();

    if (playList.length === 0) {
      message.warning(t('music.no_music'));
      resetPlayingMusic();
      setPlayingMusic({});
      return;
    }
    if (playList.length === 1) {
      audioRef.current.play();
      return;
    }

    let newIndex =
      playingMusicIndex === playList.length - 1 ? 0 : playingMusicIndex + 1;

    if (musicPlayMode === 'random') {
      newIndex = Math.floor(Math.random() * playList.length);
    }

    setPlayingMusic(playList[newIndex]);
  };

  // 切换播放模式
  const MODES = [
    { mode: 'order', text: t('music.order_play') },
    { mode: 'single', text: t('music.single_play') },
    { mode: 'random', text: t('music.random_play') },
  ];
  const togglePlayMode = () => {
    const currentIndex = MODES.findIndex((item) => item.mode === musicPlayMode);
    const nextIndex = (currentIndex + 1) % MODES.length;
    setMusicPlayMode(MODES[nextIndex].mode);
    message.success(MODES[nextIndex].text);
  };

  // 处理进度条变化
  const handleProgressChange = (value) => {
    setPlayPosition(value);
    if (audioRef?.current) {
      audioRef.current.currentTime = value;
      if (!isMusicPlaying) {
        audioRef.current.play();
        setIsMusicPlaying(true);
      }
    }
  };

  // 更新播放位置
  const updateTimeupdate = (position) => {
    setPlayPosition(position);
  };

  // 更新音乐时长
  const updateDuration = (duration) => {
    setMusicDuration(duration);
  };

  // 播放结束
  const handleEnded = () => {
    setIsMusicPlaying(false);
    setPlayPosition(0);
    if (musicPlayMode === 'single') {
      audioRef.current.play();
    } else {
      nextTrack();
    }
  };

  // 处理错误
  const handleError = () => {
    setIsMusicPlaying(false);
    setIsMusicLoading(false);
  };

  // 当播放音乐改变时，加载并播放新音乐
  useEffect(() => {
    if (playingMusic?.id) {
      playCurrentMusic();
    }
  }, [playingMusic?.id]);

  // 格式化艺术家字符串
  const artistsString = useMemo(() => {
    if (Array.isArray(playingMusic?.artists)) {
      return playingMusic?.artists?.join(' / ') || t('music.empty_artist');
    }
    return playingMusic?.artist || t('music.empty_artist');
  }, [playingMusic?.artists, playingMusic?.artist, t]);

  // 渲染歌词行
  const renderLyricItem = (item, index) => {
    const isActive = nowLyricIndex === index;
    const isVisible = !['//', '本翻译作品'].some((hidden) =>
      item?.trans?.includes(hidden),
    );

    return (
      <div
        key={item?.id || item?.time || item?.startTime || index}
        ref={(el) => (lyricItemRefs.current[index] = el)}
        className={`
          lyric-item py-3 px-6 text-center cursor-pointer transition-all duration-300
          ${
            isActive
              ? 'text-white text-xl font-bold scale-110'
              : 'text-white text-base'
          }
          ${Math.abs(nowLyricIndex - index) <= 2 ? 'opacity-80' : 'opacity-30'}
        `}
      >
        <div className="lyric-text">{item?.lyric || ''}</div>
        {isHasTrans && isVisible && (
          <div className="trans-text text-sm text-gray-200 mt-1">
            {item.trans}
          </div>
        )}
      </div>
    );
  };

  // 自动滚动到当前歌词
  useEffect(() => {
    if (nowLyricIndex >= 0 && lyricItemRefs.current[nowLyricIndex]) {
      const container = lyricContainerRef.current;
      const item = lyricItemRefs.current[nowLyricIndex];
      if (container && item) {
        const containerHeight = container.clientHeight;
        const itemTop = item.offsetTop;
        const itemHeight = item.clientHeight;

        // 计算滚动位置，使当前歌词位于视口中央
        const targetScrollTop = itemTop - containerHeight / 2 + itemHeight / 2;

        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth',
        });
      }
    }
  }, [nowLyricIndex, lyrics]);

  // 清空ref数组当歌词改变时
  useEffect(() => {
    lyricItemRefs.current = [];
  }, [lyrics]);

  // 初始化音频实例
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();

      audioRef.current.addEventListener('timeupdate', (e) => {
        updateTimeupdate(e.target.currentTime);
      });
      audioRef.current.addEventListener('loadedmetadata', (e) => {
        updateDuration(e.target.duration);
      });
      audioRef.current.addEventListener('ended', () => {
        handleEnded();
      });
      audioRef.current.addEventListener('error', () => {
        handleError();
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateTimeupdate);
        audioRef.current.removeEventListener('loadedmetadata', updateDuration);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current.pause();
        audioRef.current.src = '';
        resetPlayingMusic();
        setPlayingMusic({});
      }
    };
  }, []);

  // 当前时间和总时长格式化
  const currentTimeFormatted = useMemo(
    () => formatMilliSeconds(playPosition),
    [playPosition],
  );

  const durationFormatted = useMemo(
    () => formatMilliSeconds(musicDuration),
    [musicDuration],
  );

  // 获取音乐封面URL
  const getMusicCoverUrl = () => {
    if (playingMusic?.musicExtra?.music_cover) {
      return STATIC_URL + playingMusic.musicExtra.music_cover;
    }
    return './music_cover.jpg';
  };

  const getMusicBg = () => {
    if (playingMusic?.musicExtra?.music_cover) {
      return STATIC_URL + playingMusic.musicExtra.music_cover;
    }
    return './player_bg.jpg';
  };

  const musicCoverUrl = getMusicCoverUrl();
  const musicBgUrl = getMusicBg();

  // 页面基本结构
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div>
        <Outlet />
      </div>
      {/* 音乐播放控制器 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] z-50">
        {/* 控制区域 */}
        <div className="px-4 pt-4 grid grid-cols-3 items-center">
          {/* 左侧：歌曲信息 */}
          <div
            className="col-span-1 flex items-center space-x-3 cursor-pointer"
            onClick={() => setIsLyricDrawerOpen(true)}
          >
            <div className="music-cover w-12 h-12 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <img
                src={
                  playingMusic?.musicExtra?.music_cover
                    ? STATIC_URL + playingMusic.musicExtra.music_cover
                    : './music_cover.jpg'
                }
                alt={playingMusic.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="music-info max-w-xs">
              <div className="music-title text-sm font-medium truncate">
                {playingMusic?.title || t('music.currentPlaying')}
              </div>
              <div className="music-artist text-xs text-gray-500 truncate">
                {playingMusic?.artist || t('music.artist')}
              </div>
            </div>
          </div>

          {/* 中间：播放控制按钮 */}
          <div className="col-span-1 flex items-center justify-center space-x-4">
            {/* 播放模式切换 */}
            <Tooltip title={t(`music.${musicPlayMode}_play`)}>
              <Button
                type="text"
                icon={<SyncOutlined style={{ color: '#434343' }} />}
                onClick={togglePlayMode}
                size="large"
              />
            </Tooltip>

            {/* 上一首 */}
            <Button
              type="text"
              icon={
                <StepBackwardOutlined
                  style={{ fontSize: '24px', color: '#434343' }}
                />
              }
              onClick={previousTrack}
              size="large"
            />

            {/* 播放/暂停 */}
            <Button
              type="text"
              size="large"
              icon={
                isMusicPlaying ? (
                  <PauseCircleOutlined
                    style={{ fontSize: '28px', color: '#434343' }}
                  />
                ) : (
                  <PlayCircleOutlined
                    style={{ fontSize: '28px', color: '#434343' }}
                  />
                )
              }
              onClick={playOrPause}
              loading={isMusicLoading}
            />

            {/* 下一首 */}
            <Button
              type="text"
              icon={
                <StepForwardOutlined
                  style={{ fontSize: '24px', color: '#434343' }}
                />
              }
              onClick={nextTrack}
              size="large"
            />

            {/* 等待播放 */}
            <Button
              type="text"
              icon={<MenuOutlined color="#434343" />}
              onClick={() => setIsPlaylistDrawerOpen(true)}
              size="large"
            />
          </div>

          {/* 右侧：时间和菜单 */}
          <div className="col-span-1 flex items-center space-x-3 justify-end">
            {/* 当前播放时间 */}
            <span className="text-xs text-gray-500">
              {currentTimeFormatted}
            </span>
            <span className="text-xs text-gray-500">/</span>
            <span className="text-xs text-gray-500">{durationFormatted}</span>
          </div>
        </div>
        {/* 进度条 */}
        <div className="px-4 w-full">
          <Slider
            value={Math.floor(playPosition) || 0}
            max={Math.floor(musicDuration) || 100}
            onChange={handleProgressChange}
            tooltip={{ formatter: (value) => formatMilliSeconds(value) }}
            className="music-progress-slider"
          />
        </div>
      </div>
      {/* 歌词抽屉 */}
      <Drawer
        placement="bottom"
        onClose={() => setIsLyricDrawerOpen(false)}
        open={isLyricDrawerOpen}
        height="100%"
        className="lyric-drawer"
        title={null}
        styles={{
          header: {
            display: 'none',
          },
          body: {
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
          },
        }}
      >
        <div
          className="h-full relative"
          style={{
            backgroundImage: `url(${musicBgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* 自定义关闭按钮 */}
          <div className="absolute top-4 left-4 z-20">
            <Button
              type="text"
              size="large"
              onClick={() => setIsLyricDrawerOpen(false)}
              className="text-white hover:bg-white/20 backdrop-blur-sm"
              icon={<CloseOutlined style={{ color: 'white' }} />}
            />
          </div>

          <div
            className="absolute inset-0 h-full"
            style={{
              background:
                'linear-gradient(rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.2))',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
            }}
          >
            <div className="h-full relative z-10">
              {/* 桌面端：左右分栏布局 */}
              <div className="hidden md:flex h-full">
                {/* 左侧：音乐信息、控制和进度条 */}
                <div className="w-1/2 h-full flex flex-col pt-24">
                  <div className="flex-1 flex flex-col p-6">
                    {/* 歌曲封面 */}
                    <div className="flex justify-center mb-6">
                      <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl">
                        <img
                          src={musicCoverUrl}
                          alt={playingMusic.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* 歌曲信息 */}
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-2">
                        {playingMusic?.title || t('music.currentPlaying')}
                      </h2>
                      <p className="text-lg text-gray-100 dark:text-gray-400">
                        {artistsString}
                      </p>
                      {playingMusic?.album && (
                        <p className="text-sm text-gray-200 dark:text-gray-500 mt-1">
                          专辑：{playingMusic.album}
                        </p>
                      )}
                    </div>

                    {/* 进度条 */}
                    <div className="mb-6 px-36">
                      <Slider
                        value={Math.floor(playPosition) || 0}
                        max={Math.floor(musicDuration) || 100}
                        onChange={handleProgressChange}
                        tooltip={{
                          formatter: (value) => formatMilliSeconds(value),
                        }}
                        className="music-progress-slider"
                      />
                      <div className="flex justify-between text-sm text-gray-200 mt-2">
                        <span>{currentTimeFormatted}</span>
                        <span>{durationFormatted}</span>
                      </div>
                    </div>
                  </div>

                  {/* 播放控制 - 固定在底部 */}
                  <div className="pb-8 col-span-1 flex items-center justify-center space-x-8">
                    {/* 播放模式切换 */}
                    <Tooltip title={t(`music.${musicPlayMode}_play`)}>
                      <Button
                        type="text"
                        icon={<SyncOutlined style={{ color: 'white' }} />}
                        onClick={togglePlayMode}
                        size="large"
                      />
                    </Tooltip>

                    {/* 上一首 */}
                    <Button
                      type="text"
                      icon={
                        <StepBackwardOutlined
                          style={{ fontSize: '24px', color: 'white' }}
                        />
                      }
                      onClick={previousTrack}
                      size="large"
                    />

                    {/* 播放/暂停 */}
                    <Button
                      type="text"
                      size="large"
                      icon={
                        isMusicPlaying ? (
                          <PauseCircleOutlined
                            style={{ fontSize: '28px', color: 'white' }}
                          />
                        ) : (
                          <PlayCircleOutlined
                            style={{ fontSize: '28px', color: 'white' }}
                          />
                        )
                      }
                      onClick={playOrPause}
                      loading={isMusicLoading}
                    />

                    {/* 下一首 */}
                    <Button
                      type="text"
                      icon={
                        <StepForwardOutlined
                          style={{ fontSize: '24px', color: 'white' }}
                        />
                      }
                      onClick={nextTrack}
                      size="large"
                    />

                    {/* 等待播放 */}
                    <Button
                      type="text"
                      icon={<MenuOutlined style={{ color: 'white' }} />}
                      onClick={() => setIsPlaylistDrawerOpen(true)}
                      size="large"
                    />
                  </div>
                </div>

                {/* 右侧：歌词显示 */}
                <div className="w-1/2 h-full flex flex-col">
                  <div className="flex-1 overflow-hidden">
                    <div
                      ref={lyricContainerRef}
                      className="h-full overflow-y-auto scrollbar-hide"
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                      }}
                    >
                      {lyrics.length > 0 ? (
                        <div className="space-y-1">
                          {lyrics.map((item, index) =>
                            renderLyricItem(item, index),
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-200 p-6">
                          <div className="text-center">
                            <div>{t('music.noLyrics')}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 移动端：单栏切换布局 */}
              <div className="md:hidden h-full">
                {/* 移动端视图切换按钮 */}
                <div className="absolute top-4 right-4 z-20 flex space-x-2">
                  <Button
                    type={currentView === 'music' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => setCurrentView('music')}
                    className="backdrop-blur-sm"
                  >
                    {t('music.music_tab')}
                  </Button>
                  <Button
                    type={currentView === 'lyrics' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => setCurrentView('lyrics')}
                    className="backdrop-blur-sm"
                  >
                    {t('music.lyrics_tab')}
                  </Button>
                </div>

                {currentView === 'music' ? (
                  <div className="h-full flex flex-col pt-16">
                    <div className="flex-1 flex flex-col p-4">
                      {/* 歌曲封面 */}
                      <div className="flex justify-center mb-6">
                        <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl">
                          <img
                            src={musicCoverUrl}
                            alt={playingMusic.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* 歌曲信息 */}
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-white dark:text-gray-100 mb-2">
                          {playingMusic?.title || t('music.currentPlaying')}
                        </h2>
                        <p className="text-base text-gray-100 dark:text-gray-400">
                          {artistsString}
                        </p>
                        {playingMusic?.album && (
                          <p className="text-sm text-gray-200 dark:text-gray-500 mt-1">
                            专辑：{playingMusic.album}
                          </p>
                        )}
                      </div>

                      {/* 进度条 */}
                      <div className="mb-6">
                        <Slider
                          value={Math.floor(playPosition) || 0}
                          max={Math.floor(musicDuration) || 100}
                          onChange={handleProgressChange}
                          tooltip={{
                            formatter: (value) => formatMilliSeconds(value),
                          }}
                          className="music-progress-slider"
                        />
                        <div className="flex justify-between text-sm text-gray-200 mt-2">
                          <span>{currentTimeFormatted}</span>
                          <span>{durationFormatted}</span>
                        </div>
                      </div>
                    </div>

                    {/* 播放控制 - 固定在底部 */}
                    <div className="pb-8 col-span-1 flex items-center justify-center space-x-8">
                      {/* 播放模式切换 */}
                      <Tooltip title={t(`music.${musicPlayMode}_play`)}>
                        <Button
                          type="text"
                          icon={<SyncOutlined style={{ color: 'white' }} />}
                          onClick={togglePlayMode}
                          size="large"
                        />
                      </Tooltip>

                      {/* 上一首 */}
                      <Button
                        type="text"
                        icon={
                          <StepBackwardOutlined
                            style={{ fontSize: '24px', color: 'white' }}
                          />
                        }
                        onClick={previousTrack}
                        size="large"
                      />

                      {/* 播放/暂停 */}
                      <Button
                        type="text"
                        size="large"
                        icon={
                          isMusicPlaying ? (
                            <PauseCircleOutlined
                              style={{ fontSize: '28px', color: 'white' }}
                            />
                          ) : (
                            <PlayCircleOutlined
                              style={{ fontSize: '28px', color: 'white' }}
                            />
                          )
                        }
                        onClick={playOrPause}
                        loading={isMusicLoading}
                      />

                      {/* 下一首 */}
                      <Button
                        type="text"
                        icon={
                          <StepForwardOutlined
                            style={{ fontSize: '24px', color: 'white' }}
                          />
                        }
                        onClick={nextTrack}
                        size="large"
                      />

                      {/* 等待播放 */}
                      <Button
                        type="text"
                        icon={<MenuOutlined style={{ color: 'white' }} />}
                        onClick={() => setIsPlaylistDrawerOpen(true)}
                        size="large"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col pt-16">
                    <div className="flex-1 overflow-hidden">
                      <div
                        ref={lyricContainerRef}
                        className="h-full overflow-y-auto scrollbar-hide"
                        style={{
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                        }}
                      >
                        {lyrics.length > 0 ? (
                          <div className="space-y-1 p-4 pt-4">
                            {lyrics.map((item, index) =>
                              renderLyricItem(item, index),
                            )}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-200 p-4">
                            <div className="text-center">
                              <div>{t('music.noLyrics')}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Drawer>

      {/* 播放列表抽屉 */}
      <Drawer
        placement="right"
        onClose={() => setIsPlaylistDrawerOpen(false)}
        open={isPlaylistDrawerOpen}
        width={400}
        className="playlist-drawer"
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-white dark:text-gray-100">
              {t('music.playlist')}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-800 dark:text-gray-400">
                {playList.length} {t('music.songs_count')}
              </span>
              {playList.length > 0 && (
                <Button
                  type="text"
                  icon={<ClearOutlined />}
                  onClick={handleClearPlaylist}
                  className="text-gray-200 hover:text-white"
                  title={t('music.clear_playlist')}
                />
              )}
            </div>
          </div>
        }
        styles={{
          header: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          },
          body: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
          },
        }}
      >
        <div className="h-full flex flex-col">
          {playList.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {playList.map((item, index) => {
                  const isCurrent = playingMusic?.id === item.id;
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 group ${
                        isCurrent
                          ? 'bg-blue-500/20 border border-blue-500/30'
                          : 'bg-white/5 hover:bg-white/10 border border-gray-400/30'
                      }`}
                      onClick={() => {
                        setPlayingMusic(item);
                        setIsPlaylistDrawerOpen(false);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium truncate ${
                              isCurrent
                                ? 'text-blue-400'
                                : 'text-gray-800 dark:text-gray-100'
                            }`}
                          >
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {item?.artist || t('music.unknown_artist')}
                          </div>
                          {item.album && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                              {t('music.album_label', { album: item.album })}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex items-center space-x-2">
                          {isCurrent && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          )}
                          <Button
                            type="text"
                            icon={
                              <DeleteOutlined
                                style={{
                                  fontSize: '18px',
                                  color: '#262626',
                                }}
                              />
                            }
                            onClick={(event) => handleRemoveSong(item, event)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <div>{t('music.no_songs_in_playlist')}</div>
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}

export default MusicController;
