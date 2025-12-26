import React from 'react';

const routes = [
  {
    path: '/music',
    key: 'music',
    element: React.createElement(
      React.lazy(() => import('@/pages/music/Music')),
    ),
  },
  {
    path: '/search',
    key: 'search',
    element: React.createElement(
      React.lazy(() => import('@/pages/music/Search')),
    ),
  },
  {
    path: '/playlist/:id',
    key: 'playlist',
    element: React.createElement(
      React.lazy(() => import('@/pages/music/PlaylistDetail')),
    ),
  },
];

export default routes;
