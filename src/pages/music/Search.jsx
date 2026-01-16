import { Empty, Spin, message } from 'antd';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import {
  SearchOutlined,
  PlayCircleOutlined,
  PlusCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { getMusic } from '@/api/music';
import { useTranslation } from 'react-i18next';
import { useMusicStore } from '@/stores/musicStore';
import CustomTable from '@/components/common/CustomTable';

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

  // 无限滚动功能由CustomTable内部实现

  return (
    <div className="">
      {/* 搜索框 - 固定在顶部 */}
      <div className="sticky top-0 z-10 pt-4 max-md:px-4">
        <div className="max-w-xl mx-auto relative">
          <input
            type="text"
            placeholder={t('music.searchPlaceholder')}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(keyword)}
            className="w-full px-4 py-2 rounded-full backdrop-blur-[10px] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder:text-white text-sm"
          />
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="cursor-pointer absolute right-12 top-1/2 transform -translate-y-1/2 text-white hover:text-white transition-colors"
            >
              <CloseOutlined />
            </button>
          )}
          <button
            onClick={() => handleSearch(keyword)}
            className="absolute right-0 top-0 h-full px-3 text-white rounded-r-full hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <SearchOutlined />
          </button>
        </div>
      </div>

      {/* 搜索结果 - 可滚动区域 */}
      <div className="max-w-7xl mx-auto px-4 min-h-[calc(100vh-80px)] pb-20">
        {searchResults.length > 0 && (
          <div className="mb-4 max-md:mt-4">
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 border border-white hover:border-blue-600 hover:text-blue-600 text-white rounded-lg transition-colors"
              onClick={() => {
                setPlayList(searchResults);
                setPlayingMusic(searchResults[0]);
                message.success(t('music.add_success'));
              }}
            >
              <PlayCircleOutlined />
              <span className="text-xs font-bold">{t('music.playAll')}</span>
            </button>
          </div>
        )}

        {loading && searchResults.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : searchResults.length > 0 ? (
          <div className="h-[calc(100vh-210px)]">
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
              dataSource={searchResults}
              rowKey="id"
              rowClassName={(record) =>
                record.id === playingMusic?.id
                  ? 'bg-white/5 backdrop-blur-[10px] border border-white/10'
                  : ''
              }
              hasMore={hasMore}
              loading={loading}
              onLoadMore={loadMore}
            />
          </div>
        ) : keyword ? (
          <Empty description={<span>{t('music.noResults')}</span>} />
        ) : null}
      </div>
    </div>
  );
}

export default SearchPage;
