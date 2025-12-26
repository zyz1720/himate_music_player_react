import { Table, Typography, Button, Spin, Empty, message } from 'antd';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { PlayCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { getFavoritesDetail, getMusicFromFavorites } from '@/api/music';
import { useMusicStore } from '@/stores/musicStore';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const STATIC_URL = import.meta.env.VITE_STATIC_URL;

function PlaylistDetail() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [playDetails, setPlayDetails] = useState(null);
  const [musicList, setMusicList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

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

  // 无限滚动 - 使用 Intersection Observer API
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMusicList();
        }
      },
      { threshold: 0.1 },
    );

    const target = document.getElementById('infinite-scroll-trigger');
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, loading, musicList.length]);

  useEffect(() => {
    loadPlaylistDetail();
    loadMusicList(true);
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
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
                className="w-32 h-32 object-cover border border-gray-300 dark:border-gray-600 rounded-md"
                alt={playDetails.name}
                src={
                  playDetails?.favorites_cover
                    ? `${STATIC_URL}${playDetails?.favorites_cover}`
                    : './image_empty.jpg'
                }
              />
              <div className="ml-4">
                <Title level={4}>{playDetails.favorites_name}</Title>
                <Text type="secondary">
                  {playDetails.favorites_remarks || t('music.noDescription')}
                </Text>
                <div className="playDetails-stats mt-4">
                  <Text>
                    {total} {t('music.trackCount')}
                  </Text>
                  <Text type="secondary" className="mx-4">
                    {t('music.createTime')}{' '}
                    {dayjs(playDetails.create_time).format('YYYY/MM/DD')}{' '}
                  </Text>
                  <Button
                    icon={<PlayCircleOutlined />}
                    onClick={() => {
                      setPlayList(musicList);
                      setPlayingMusic(musicList[0]);
                      message.success(t('music.add_success'));
                    }}
                  >
                    {t('music.playAll')}
                  </Button>
                </div>
              </div>
            </div>

            {/* 歌曲列表 */}
            <div className="mt-4">
              {musicList.length > 0 ? (
                <>
                  <Table
                    columns={[
                      {
                        title: t('music.number'),
                        width: 60,
                        render: (_, __, index) => index + 1,
                      },
                      {
                        title: t('music.songName'),
                        dataIndex: 'title',
                        width: 320,
                        key: 'title',
                      },
                      {
                        title: t('music.artist'),
                        dataIndex: 'artist',
                        width: 320,
                        key: 'artist',
                        render: (artist) => (
                          <div className="text-xs text-gray-500 line-clamp-1">
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
                          <div className="text-xs text-gray-500 line-clamp-1">
                            {album || t('music.unknownAlbum')}
                          </div>
                        ),
                      },
                      {
                        title: t('music.operation'),
                        width: 120,
                        fixed: 'right',
                        key: 'operation',
                        render: (_, record) => (
                          <div className="space-x-4">
                            <Button
                              type="text"
                              icon={
                                <PlusCircleOutlined
                                  style={{ fontSize: '20px', color: '#bfbfbf' }}
                                />
                              }
                              iconPlacement="start"
                              shape="circle"
                              onClick={() => {
                                addPlayList([record]);
                                message.success(t('music.add_success'));
                              }}
                            />
                            <Button
                              type="text"
                              icon={
                                <PlayCircleOutlined
                                  style={{ fontSize: '20px', color: '#bfbfbf' }}
                                />
                              }
                              iconPlacement="start"
                              shape="circle"
                              onClick={() => {
                                setPlayingMusic(record);
                                addPlayList([record]);
                              }}
                            />
                          </div>
                        ),
                      },
                    ]}
                    dataSource={musicList}
                    rowKey="id"
                    pagination={false} // 禁用分页
                    rowClassName={(record) =>
                      record.id === playingMusic?.id ? 'bg-blue-50' : ''
                    }
                    className="music-table"
                  />
                  {/* 无限滚动触发元素 */}
                  {hasMore && (
                    <div
                      id="infinite-scroll-trigger"
                      className="flex justify-center items-center py-4"
                    >
                      <Spin size="small" />
                      <span className="ml-2 text-sm text-gray-500">
                        {t('music.loading')}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <Empty description={t('music.noMusicInPlaylist')} />
              )}
            </div>
          </>
        ) : (
          <Empty description={t('music.playlistNotFound')} />
        )}
      </div>
    </div>
  );
}

export default PlaylistDetail;
