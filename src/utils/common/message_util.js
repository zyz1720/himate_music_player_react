import { message as AntDMessage } from 'antd';

const messageCache = new Map();

export const showErrorMessage = (message) => {
  const now = Date.now();
  const cacheItem = messageCache.get(message);

  if (cacheItem && now - cacheItem < 1000) {
    return;
  }

  AntDMessage.error(message);
  messageCache.set(message, now);

  setTimeout(() => {
    messageCache.delete(message);
  }, 1000);
};
