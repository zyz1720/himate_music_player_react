import { message, QRCode, Button, Typography, Card } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { getLoginQrCode, getLoginStatus } from '@/api/login';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

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
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-200">
      <Card className="w-78 p-8">
        {/* 标题和Logo */}
        <div className="text-center mb-2">
          <img src={'./logo.png'} alt="Logo" className="h-20 mx-auto mb-4" />
          <Title level={3}>{t('login.title')}</Title>
        </div>

        {/* 二维码登录区域 */}
        <div className="text-center">
          <Text strong className="block mb-4">
            {t('login.scanQRCode')}
          </Text>

          {qrCodeId && !qrCodeExpired ? (
            <div className="justify-center items-center flex">
              <QRCode value={qrCodeId} />
            </div>
          ) : null}

          {qrCodeExpired ? (
            <>
              <Text type="warning" className="block mb-4">
                {t('login.qrCodeExpired')}
              </Text>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => getLoginQrCodeHandler()}
                disabled={isPolling && !qrCodeExpired}
              >
                {t('login.refreshQrCode')}
              </Button>
            </>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

export default Login;
