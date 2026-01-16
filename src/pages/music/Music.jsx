import { message, Row, Col, Avatar, Button, Dropdown } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SearchOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { getFavorites, getOneselfFavorites } from '@/api/music';
import { useUserStore } from '@/stores/userStore';
import { usePageStore } from '@/stores/pageStore';

const STATIC_URL = import.meta.env.VITE_STATIC_URL;
const MotionCol = motion(Col);

function Music() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userInfo, clearUserStore } = useUserStore();
  const scrollContainerRef = useRef(null);

  const { activeTab, setActiveTab } = usePageStore();
  const [searchText, setSearchText] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [total, setTotal] = useState(0);
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
        setTotal(data.total || 0);
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
    <div className="h-screen flex flex-col">
      {/* 固定顶部搜索框 */}
      <div className="flex-shrink-0 px-4 pt-4">
        <div className="flex justify-between items-center mx-auto">
          <div className="flex-1 max-w-xl mx-auto">
            <div className="relative w-full mx-auto">
              <input
                type="text"
                placeholder={t('music.searchPlaceholder')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 pl-10 rounded-full backdrop-blur-[10px] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder:text-white text-sm"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <SearchOutlined style={{ fontSize: 16, color: 'white' }} />
              </div>
            </div>
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

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* 歌单类型切换 */}
        <div className="flex-shrink-0 max-w-7xl mx-auto px-4 w-full">
          {/* 自定义Tabs组件 */}
          <div className="mb-6">
            <div className="flex border-b border-white/20">
              {[
                {
                  key: 'myFavorites',
                  label: t('music.myPlaylist'),
                },
                {
                  key: 'discover',
                  label: t('music.discoverPlaylist'),
                },
              ].map((item) => (
                <motion.button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === item.key
                      ? 'text-white border-b-2 border-blue-500'
                      : 'text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0.5, y: 10 }}
                  animate={{
                    opacity: activeTab === item.key ? 1 : 0.6,
                    y: 0,
                    color: activeTab === item.key ? 'white' : 'white',
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  {item.label +
                    (total && activeTab === item.key ? `(${total})` : '')}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* 歌单列表滚动区域 */}
        <motion.div
          ref={scrollContainerRef}
          className="h-[calc(100vh-230px)] overflow-y-auto overflow-x-hidden px-4 pb-10 scrollbar-hide"
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 1 }}
        >
          <div className="max-w-7xl mx-auto">
            <Row gutter={[20, 20]}>
              {playlists.map((favorites) => (
                <MotionCol
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                  key={favorites.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    mass: 0.8,
                    delay: Math.random() * 0.1,
                  }}
                >
                  <div
                    onClick={() => navigate(`/playlist/${favorites.id}`)}
                    className="h-full bg-white/5 backdrop-blur-[10px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-white/10"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        alt={favorites.favorites_name}
                        src={
                          favorites?.favorites_cover
                            ? `${STATIC_URL}${favorites.favorites_cover}`
                            : './image_empty.jpg'
                        }
                        className="h-40 w-full object-cover transition-all duration-500 hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-lg font-medium line-clamp-1 text-white">
                        {favorites.favorites_name}
                      </div>
                      <div className="text-xs text-white/90">
                        {favorites.musicCount || 0} {t('music.trackCount')}
                      </div>
                    </div>
                  </div>
                </MotionCol>
              ))}
            </Row>

            {/* 加载更多指示器 */}
            {hasMore && (
              <div className="load-more flex justify-center mt-8 pb-4">
                <Button
                  loading={loading}
                  onClick={handleLoadMore}
                  type="primary"
                >
                  {t('music.loadMore')}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Music;
