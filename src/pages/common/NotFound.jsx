import { Result, Button } from 'antd';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Result
      status="404"
      title="404"
      subTitle={t('common.notfound')}
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          {t('common.goback')}
        </Button>
      }
    />
  );
}

export default NotFound;
