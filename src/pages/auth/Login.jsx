import { message, QRCode } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { getLoginQrCode, getLoginStatus } from '@/api/login';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Aurora from '@/components/bits/Aurora';

function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useUserStore();

  const [qrCodeId, setQrCodeId] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [qrCodeExpired, setQrCodeExpired] = useState(false);
  const pollTimerRef = useRef(null);

  // 检查登录状态
  const checkLoginStatus = async (id) => {
    try {
      const response = await getLoginStatus(id);
      if (response.code === 0) {
        try {
          const userData = JSON.parse(response.data);
          login(userData);
          message.success(t('login.success'));
          navigate('/music');
          return true;
        } catch (e) {
          console.log('解析登录数据失败:', e);
          return false;
        }
      } else {
        setQrCodeExpired(true);
        stopPolling();
        return true;
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      stopPolling();
      return false;
    }
  };

  // 获取登录二维码
  const getLoginQrCodeHandler = async () => {
    try {
      stopPolling();
      const response = await getLoginQrCode();
      if (response.code === 0) {
        const { qrcode_id, created_at } = response.data;
        setQrCodeId(qrcode_id);
        setQrCodeExpired(dayjs(created_at).add(60, 'second').isBefore(dayjs()));
        startPolling(qrcode_id);
      }
    } catch (error) {
      console.error('获取二维码失败:', error);
      setQrCodeExpired(true);
    }
  };

  // 开始轮询
  const startPolling = (id) => {
    if (pollTimerRef.current) {
      stopPolling();
    }
    checkLoginStatus(id);
    pollTimerRef.current = setInterval(async () => {
      const shouldStop = await checkLoginStatus(id);
      if (shouldStop) {
        stopPolling();
      }
    }, 3000);

    setIsPolling(true);
  };

  // 停止轮询
  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setIsPolling(false);
  };

  useEffect(() => {
    getLoginQrCodeHandler();
    return () => stopPolling();
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <div className="w-full h-full relative">
        <Aurora colorStops={['#3b82f6', '#7cff67', '#5227FF']} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-78 p-8 bg-white/5 rounded-2xl z-10 backdrop-blur-[10px] border border-white/10">
          {/* 标题和Logo */}
          <div className="text-center mb-2">
            <img
              src={'./logo.png'}
              alt="Logo"
              className="h-20 mx-auto mb-4 rounded-2xl"
            />
            <h3 className="text-xl text-white font-bold mb-2">
              {t('login.title')}
            </h3>
          </div>

          {/* 二维码登录区域 */}
          <div className="text-center">
            <span className="block text-white font-bold mb-4">
              {t('login.scanQRCode')}
            </span>

            {qrCodeId && !qrCodeExpired ? (
              <div className="justify-center items-center flex">
                <QRCode value={qrCodeId} bgColor="#F0F0F0" />
              </div>
            ) : null}

            {qrCodeExpired ? (
              <>
                <span className="block text-xs text-yellow-600 mb-4">
                  {t('login.qrCodeExpired')}
                </span>
                <div className="flex justify-center items-center">
                  <button
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={() => getLoginQrCodeHandler()}
                    disabled={isPolling && !qrCodeExpired}
                  >
                    <span className="text-sm">
                      <ReloadOutlined className="mr-2" />{' '}
                      {t('login.refreshQrCode')}
                    </span>
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
