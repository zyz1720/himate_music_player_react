import { Input, Button, Table, Empty, Spin, message } from 'antd';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import {
  SearchOutlined,
  PlayCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { getMusic } from '@/api/music';
import { useTranslation } from 'react-i18next';
import { useMusicStore } from '@/stores/musicStore';

const { Search } = Input;

function SearchPage() {
  const location = useLocation();
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12;

  const { addPlayList, setPlayList, playingMusic, setPlayingMusic } =
    useMusicStore();

  // 从URL参数获取搜索关键词
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchKeyword = params.get('keyword');
    if (searchKeyword) {
      setKeyword(searchKeyword);
      handleSearch(searchKeyword);
    }
  }, [location.search]);

  // 搜索功能
  const handleSearch = async (value) => {
    if (!value.trim()) return;

    setLoading(true);
    try {
      // 这里假设getMusic API支持搜索参数
      const response = await getMusic({
        keyword: value,
        current: 1,
        pageSize,
      });

      if (response.code === 0) {
        setSearchResults(response.data.list || []);
        setCurrentPage(2);
        setHasMore((response.data.list || []).length === pageSize);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载更多
  const loadMore = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const response = await getMusic({
        keyword,
        current: currentPage,
        pageSize,
      });

      if (response.code === 0) {
        setSearchResults((prev) => [...prev, ...(response.data.list || [])]);
        setCurrentPage((prev) => prev + 1);
        setHasMore((response.data.list || []).length === pageSize);
      }
    } catch (error) {
      console.error('加载更多失败:', error);
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
          loadMore();
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
  }, [hasMore, loading, searchResults.length]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* 搜索框 - 固定在顶部 */}
      <div className="sticky top-0 z-10 p-4 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-xl mx-auto">
          <Search
            placeholder={t('music.searchPlaceholder')}
            allowClear
            enterButton={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            className="search-input w-full md:w-1/2 lg:w-1/3 mx-auto"
          />
        </div>
      </div>

      {/* 搜索结果 - 可滚动区域 */}
      <div className="max-w-7xl mx-auto px-4 py-6 min-h-[calc(100vh-80px)] pb-20">
        {searchResults.length > 0 && (
          <Button
            icon={<PlayCircleOutlined />}
            onClick={() => {
              setPlayList(searchResults);
              setPlayingMusic(searchResults[0]);
              message.success(t('music.add_success'));
            }}
          >
            {t('music.playAll')}
          </Button>
        )}

        {loading && searchResults.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : searchResults.length > 0 ? (
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
                      {album || '-'}
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
              dataSource={searchResults}
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
        ) : keyword ? (
          <Empty description={<span>{t('music.noResults')}</span>} />
        ) : null}
      </div>
    </div>
  );
}

export default SearchPage;
