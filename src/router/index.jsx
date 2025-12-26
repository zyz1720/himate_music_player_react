import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from 'react-router';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '@/stores/userStore';
import { dayjsLocaleMap } from '@/constants/locale';
import React, { useEffect, Suspense } from 'react';
import routes from './routes';
import Login from '@/pages/auth/Login';
import NotFound from '@/pages/common/NotFound';
import FullscreenLoading from '@/components/common/FullscreenLoading';
import MusicController from '@/components/common/MusicController';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 递归渲染路由，支持父级路由自动重定向到第一个子路由
const renderRoutes = (routes) => {
  return routes.map((route) => {
    if (route.redirect) {
      return (
        <React.Fragment key={route.key}>
          <Route
            path={route.path}
            element={<Navigate to={route.redirect} replace />}
          />
          {renderRoutes(route.routes)}
        </React.Fragment>
      );
    }
    return <Route key={route.key} path={route.path} element={route.element} />;
  });
};

// 路由拦截器高阶组件
const AuthGuard = ({ children }) => {
  const { isLogin } = useUserStore();

  const whiteList = ['/login', '/notfound'];

  const { pathname } = useLocation();

  // 不需要权限的页面
  const notRequiredAuth = whiteList.includes(pathname);

  // 如果访问的是根路径，重定向到第一个子路由
  if (pathname === '/') {
    return <Navigate to="/music" replace />;
  }

  // 未登录且不在白名单中，重定向到登录页面
  if (!isLogin && !notRequiredAuth) {
    return <Navigate to="/login" replace state={{ from: pathname }} />;
  }

  // 已登录或在白名单中，允许访问
  return <Suspense fallback={<FullscreenLoading />}>{children}</Suspense>;
};

function Root() {
  const { i18n } = useTranslation();
  const { isLogin, setUserInfo } = useUserStore();

  useEffect(() => {
    dayjs.locale(dayjsLocaleMap['zh-cn']);
  }, [i18n]);

  useEffect(() => {
    if (isLogin) {
      setUserInfo();
    }
  }, [isLogin]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/notfound" element={<NotFound />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <MusicController />
            </AuthGuard>
          }
        >
          {renderRoutes(routes)}
        </Route>
        <Route path="*" element={<Navigate to="/notfound" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default Root;
