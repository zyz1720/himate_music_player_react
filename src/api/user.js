import instance from '@/utils/request/axios_instance';

/* 用户信息 */
export const getUserInfo = () => instance.get('app/user/info');
