import '@/i18n/index';
import './styles/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Root from './router/index';

const root = document.getElementById('root');

createRoot(root).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
