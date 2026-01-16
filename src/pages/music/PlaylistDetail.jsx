import { Typography, Spin, Empty, message, Drawer, Button } from 'antd';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import {
  PlayCircleOutlined,
  PlusCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { getFavoritesDetail, getMusicFromFavorites } from '@/api/music';
import { useMusicStore } from '@/stores/musicStore';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import CustomTable from '@/components/common/CustomTable';

const { Title, Text } = Typography;
const STATIC_URL = import.meta.env.VITE_STATIC_URL;

function PlaylistDetail() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [playDetails, setPlayDetails] = useState({});
  const [musicList, setMusicList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const { addPlayList, setPlayList, playingMusic, setPlayingMusic } =
    useMusicStore();

  // 加载歌单详情
  const loadPlaylistDetail = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await getFavoritesDetail(id);
      if (response.code === 0) {
        setPlayDetails(response.data);
      }
    } catch (error) {
      console.error('加载歌单详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载歌单中的歌曲
  const loadMusicList = async (refresh = false) => {
    if (!id || loading) return;

    setLoading(true);
    try {
      const page = refresh ? 1 : currentPage;
      const response = await getMusicFromFavorites(id, {
        current: page,
        pageSize,
      });

      if (response.code === 0) {
        const data = response.data;
        setTotal(data.total || 0);
        if (refresh) {
          setMusicList(data.list || []);
        } else {
          setMusicList((prev) => [...prev, ...(data.list || [])]);
        }
        setCurrentPage(page + 1);
        setHasMore((data.list || []).length === pageSize);
      }
    } catch (error) {
      console.error('加载歌单歌曲失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylistDetail();
    loadMusicList(true);
  }, [id]);

  return (
    <div className="min-h-screen pb-20">
      {/* 歌单详情 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && !playDetails ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : playDetails ? (
          <>
            {/* 歌单封面和基本信息 */}
            <div className="flex items-center">
              <img
                className="w-32 h-32 object-cover border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:scale-105 transition-transform"
                alt={playDetails.favorites_name}
                src={
                  playDetails?.favorites_cover
                    ? `${STATIC_URL}${playDetails?.favorites_cover}`
                    : './image_empty.jpg'
                }
                onClick={() => setIsDetailDrawerOpen(true)}
              />
              <div className="ml-4">
                <Title
                  style={{ color: 'white' }}
                  className="line-clamp-2"
                  level={4}
                >
                  {playDetails.favorites_name}
                </Title>
                <Text
                  type="secondary"
                  style={{ color: 'white' }}
                  className="line-clamp-2"
                >
                  {playDetails.favorites_remarks || t('music.noDescription')}
                </Text>
                <div className="mt-4 md:flex md:items-center space-y-3 md:space-y-0">
                  <Text style={{ color: 'white' }}>
                    {total} {t('music.trackCount')}
                  </Text>
                  <Text
                    type="secondary"
                    className="mx-4"
                    style={{ color: 'white' }}
                  >
                    {t('music.createTime')}{' '}
                    {dayjs(playDetails.create_time).format('YYYY/MM/DD')}{' '}
                  </Text>
                  <button
                    className="max-md:mt-2 flex items-center justify-center gap-2 px-4 py-2 border border-white hover:border-blue-600 hover:text-blue-600 text-white rounded-lg transition-colors"
                    onClick={() => {
                      setPlayList(musicList);
                      setPlayingMusic(musicList[0]);
                      message.success(t('music.add_success'));
                    }}
                  >
                    <PlayCircleOutlined />
                    <span className="text-xs">{t('music.playAll')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 歌曲列表 */}
            <div className="mt-4">
              {musicList.length > 0 ? (
                <div className="h-[calc(100vh-280px)]">
                  <CustomTable
                    columns={[
                      {
                        title: t('music.number'),
                        width: 60,
                        render: (_, __, index) => (
                          <span style={{ color: '#ffffff' }}>{index + 1}</span>
                        ),
                      },
                      {
                        title: t('music.songName'),
                        dataIndex: 'title',
                        width: 320,
                        key: 'title',
                        render: (title) => (
                          <span style={{ color: '#ffffff' }}>{title}</span>
                        ),
                      },
                      {
                        title: t('music.artist'),
                        dataIndex: 'artist',
                        width: 320,
                        key: 'artist',
                        render: (artist) => (
                          <div className="text-xs text-white line-clamp-1">
                            {artist}
                          </div>
                        ),
                      },
                      {
                        title: t('music.album'),
                        dataIndex: 'album',
                        width: 320,
                        key: 'album',
                        render: (album) => (
                          <div className="text-xs text-white line-clamp-1">
                            {album || t('music.unknownAlbum')}
                          </div>
                        ),
                      },
                      {
                        title: t('music.operation'),
                        width: 120,
                        key: 'operation',
                        render: (_, record) => (
                          <div className="space-x-4 flex items-center">
                            <div
                              className="cursor-pointer flex items-center justify-center p-2 hover:bg-black/10 rounded-full"
                              onClick={() => {
                                setPlayingMusic(record);
                                addPlayList([record]);
                              }}
                            >
                              <PlayCircleOutlined
                                style={{ fontSize: '20px', color: '#ffffff' }}
                              />
                            </div>
                            <div
                              className="cursor-pointer flex items-center justify-center p-2 hover:bg-black/10 rounded-full"
                              onClick={() => {
                                addPlayList([record]);
                                message.success(t('music.add_success'));
                              }}
                            >
                              <PlusCircleOutlined
                                style={{ fontSize: '20px', color: '#ffffff' }}
                              />
                            </div>
                          </div>
                        ),
                      },
                    ]}
                    dataSource={musicList}
                    rowKey="id"
                    rowClassName={(record) =>
                      record.id === playingMusic?.id
                        ? 'bg-white/5 backdrop-blur-[10px] border border-white/10'
                        : ''
                    }
                    hasMore={hasMore}
                    loading={loading}
                    onLoadMore={loadMusicList}
                  />
                </div>
              ) : (
                <Empty description={t('music.noMusicInPlaylist')} />
              )}
            </div>
          </>
        ) : (
          <Empty description={t('music.playlistNotFound')} />
        )}
      </div>

      <Drawer
        placement="top"
        onClose={() => setIsDetailDrawerOpen(false)}
        open={isDetailDrawerOpen}
        height="100%"
        title={null}
        styles={{
          header: {
            display: 'none',
          },
          body: {
            padding: 0,
          },
        }}
      >
        <div
          className="h-full relative"
          style={{
            backgroundImage: `url(${
              playDetails?.favorites_cover
                ? `${STATIC_URL}${playDetails?.favorites_cover}`
                : './image_empty.jpg'
            })`,
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
              onClick={() => setIsDetailDrawerOpen(false)}
              className="text-white hover:bg-white/20 backdrop-blur-sm"
              icon={<CloseOutlined style={{ color: 'white' }} />}
            />
          </div>
          <div
            className="absolute inset-0 h-full"
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(50px)',
              WebkitBackdropFilter: 'blur(50px)',
            }}
          >
            <div className="p-8 flex flex-col items-center overflow-y-auto scrollbar-hide">
              <img
                className="w-64 h-64 object-cover rounded-md shadow-lg"
                alt={playDetails.favorites_name}
                src={
                  playDetails?.favorites_cover
                    ? `${STATIC_URL}${playDetails?.favorites_cover}`
                    : './image_empty.jpg'
                }
                onClick={() => setIsDetailDrawerOpen(true)}
              />
              <Title
                style={{ color: 'white' }}
                className="mt-4"
                level={4}
              >
                {playDetails.favorites_name}
              </Title>
              <Text type="secondary" style={{ color: 'white' }}>
                {playDetails.favorites_remarks || t('music.noDescription')}
              </Text>
              <div className="mt-4 md:flex md:items-center space-y-3 md:space-y-0">
                <Text style={{ color: 'white' }}>
                  {total} {t('music.trackCount')}
                </Text>
                <Text
                  type="secondary"
                  className="mx-4"
                  style={{ color: 'white' }}
                >
                  {t('music.createTime')}{' '}
                  {dayjs(playDetails.create_time).format('YYYY/MM/DD')}{' '}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default PlaylistDetail;
