import instance from '@/utils/request/axios_instance';

/* 获取登录二维码信息 */
export const getLoginQrCode = () => instance.get('qrcode');

/* 获取登录二维码状态 */
export const getLoginStatus = (qrcode_id) =>
  instance.get(`qrcode/${qrcode_id}`);

// 刷新token
export const refreshToken = (data) => instance.post('login/refresh', data);
