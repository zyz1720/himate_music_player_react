import {
  Tabs,
  message,
  Input,
  Row,
  Col,
  Card,
  Avatar,
  Button,
  Dropdown,
} from 'antd';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { getFavorites, getOneselfFavorites } from '@/api/music';
import { useUserStore } from '@/stores/userStore';

const STATIC_URL = import.meta.env.VITE_STATIC_URL;

function Music() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userInfo, clearUserStore } = useUserStore();
  const scrollContainerRef = useRef(null);

  const [activeTab, setActiveTab] = useState('myFavorites'); // 'myFavorites' 或 'discover'
  const [searchText, setSearchText] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12;

  // 搜索功能
  const handleSearch = () => {
    if (searchText.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchText)}`);
    }
  };

  // 加载歌单数据
  const loadPlaylists = async (refresh = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const page = refresh ? 1 : currentPage;
      const params = { current: page, pageSize };
      let response;

      if (activeTab === 'myFavorites') {
        // 我的歌单
        response = await getOneselfFavorites(params);
      } else {
        // 发现歌单
        response = await getFavorites(params);
      }

      if (response.code === 0) {
        const data = response.data;
        if (refresh) {
          setPlaylists(data.list || []);
        } else {
          setPlaylists((prev) => [...prev, ...(data.list || [])]);
        }
        setCurrentPage(page + 1);
        setHasMore((data.list || []).length === pageSize);
      } else {
        message.error(response.message || t('music.loadPlaylistFailed'));
      }
    } catch (error) {
      console.error('加载歌单失败:', error);
      message.error(t('music.loadPlaylistFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 加载更多处理
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadPlaylists();
    }
  };

  // 切换标签时刷新数据
  useEffect(() => {
    setPlaylists([]);
    setCurrentPage(1);
    setHasMore(true);
    loadPlaylists(true);
  }, [activeTab]);

  // 初始加载
  useEffect(() => {
    loadPlaylists(true);
  }, []);

  // 无限滚动监听
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      
      // 当滚动到底部附近时触发加载更多
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        if (hasMore && !loading) {
          loadPlaylists();
        }
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  // 页面基本结构
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 固定顶部搜索框 */}
      <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mx-auto">
          <div className="flex-1 max-w-xl mx-auto">
            <Input
              placeholder={t('music.searchPlaceholder')}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={() => handleSearch()}
              className="search-input w-full md:w-1/2 lg:w-1/3 mx-auto"
            />
          </div>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: t('login.logout'),
                  onClick: () => {
                    clearUserStore();
                    navigate('/login');
                  },
                },
              ],
            }}
          >
            <div className="flex items-center">
              <Avatar
                src={
                  userInfo?.user_avatar
                    ? `${STATIC_URL}${userInfo.user_avatar}`
                    : './logo.png'
                }
                size={36}
              />
            </div>
          </Dropdown>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* 歌单类型切换 */}
        <div className="flex-shrink-0 max-w-7xl mx-auto px-4 py-4 w-full">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'myFavorites', label: t('music.myPlaylist') },
              { key: 'discover', label: t('music.discoverPlaylist') },
            ]}
            className="mb-6"
          />
        </div>

        {/* 歌单列表滚动区域 */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-24"
        >
          <div className="max-w-7xl mx-auto">
            <Row gutter={[16, 16]}>
              {playlists.map((favorites) => (
                <Col xs={24} sm={12} md={8} lg={6} key={favorites.id}>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={favorites.favorites_name}
                        src={
                          favorites?.favorites_cover
                            ? `${STATIC_URL}${favorites.favorites_cover}`
                            : './image_empty.jpg'
                        }
                        className="h-40 object-cover"
                      />
                    }
                    onClick={() => navigate(`/playlist/${favorites.id}`)}
                    className="h-full transition-all duration-300 hover:shadow-lg"
                  >
                    <Card.Meta
                      title={
                        <div className="text-xl font-medium line-clamp-1">
                          {favorites.favorites_name}
                        </div>
                      }
                      description={
                        <div className="text-sm text-gray-500">
                          {favorites.musicCount || 0} {t('music.trackCount')}
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {/* 加载更多指示器 */}
            {hasMore && (
              <div className="load-more flex justify-center mt-8 pb-4">
                <Button loading={loading} onClick={handleLoadMore} type="primary">
                  {t('music.loadMore')}
                </Button>
              </div>
            )}
            
            {/* 加载完成提示 */}
            {!hasMore && playlists.length > 0 && (
              <div className="text-center text-xs text-gray-500 mt-8 pb-4">
                {t('music.noMoreData')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Music;
