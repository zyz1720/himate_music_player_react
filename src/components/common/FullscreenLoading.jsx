import { useTranslation } from 'react-i18next';
import { Spin } from 'antd';

function FullscreenLoading() {
  const { t } = useTranslation();
  const primaryColor = '#1890ff';
  const isDark = false;

  // 波浪SVG路径数据
  const wavePath1 =
    'M0,96L48,117.3C96,139,192,181,288,176C384,171,480,117,576,112C672,107,768,149,864,170.7C960,192,1056,192,1152,170.7C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z';
  const wavePath2 =
    'M0,128L48,149.3C96,171,192,213,288,213.3C384,213,480,171,576,149.3C672,128,768,128,864,149.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z';
  const wavePath3 =
    'M0,192L48,186.7C96,181,192,171,288,181.3C384,192,480,224,576,213.3C672,203,768,149,864,149.3C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z';

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center bg-gradient-to-br ${
        isDark ? 'from-gray-950 to-gray-900' : 'from-gray-50 to-gray-100'
      } z-999 fullscreen-fade`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="wave wave-1 absolute bottom-0 left-0 w-full h-1/2"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill={`rgba(${hexToRgb(primaryColor)}, 0.1)`}
            fillOpacity="1"
            d={wavePath1}
          />
        </svg>
        <svg
          className="wave wave-2 absolute bottom-0 left-0 w-full h-3/5"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill={`rgba(${hexToRgb(primaryColor)}, 0.15)`}
            fillOpacity="1"
            d={wavePath2}
          />
        </svg>
        <svg
          className="wave wave-3 absolute bottom-0 left-0 w-full h-4/5"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill={`rgba(${hexToRgb(primaryColor)}, 0.2)`}
            fillOpacity="1"
            d={wavePath3}
          />
        </svg>
      </div>

      {/* 加载内容 - 响应式设计，在小屏幕上调整大小 */}
      <div className="relative z-2 text-center max-w-sm w-full px-6">
        <div>
          <div className="flex justify-center mb-4">
            <Spin
              size="large"
              style={{ color: primaryColor }}
              className="transform transition-transform hover:scale-110"
            />
          </div>
          <p
            className="text-sm sm:text-base font-medium animate-pulse mt-2"
            style={{ color: primaryColor }}
          >
            {t('common.loading')}
          </p>
        </div>
      </div>

      <style>{`
        /* 防止页面滚动 */
        body:has(.fixed.inset-0) {
          overflow: hidden;
        }

       /* 淡入淡出动画 */
        .fullscreen-fade {
          opacity: 0;
          transform: scale(0.98);
          animation: fadeIn 0.6s cubic-bezier(.4,0,.2,1) forwards;
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .wave {
          transform: translateY(10px);
          animation: wave 4s ease-in-out infinite alternate;
        }
        
        .wave-1 {
          animation-delay: 0s;
          z-index: 1;
        }
        
        .wave-2 {
          animation-delay: 2s;
          z-index: 2;
        }
        
        .wave-3 {
          animation-delay: 4s;
          z-index: 3;
        }
        
        @keyframes wave {
          0% { transform: translateY(10px) translateX(0); }
          50% { transform: translateY(20px) translateX(-10px); }
          100% { transform: translateY(0px) translateX(10px); }
        }
        
        /* 响应式调整波浪尺寸 */
        @media (max-width: 640px) {
          .wave-1 {
            height: 35%;
          }
          .wave-2 {
            height: 45%;
          }
          .wave-3 {
            height: 55%;
          }
        }
        
        @media (max-height: 480px) {
          .wave {
            height: 50% !important;
          }
        }
      `}</style>
    </div>
  );
}

// 辅助函数：将HEX颜色转换为RGB格式
function hexToRgb(hex) {
  // 移除可能的 # 前缀
  hex = hex.replace('#', '');

  // 解析RGB值
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}

export default FullscreenLoading;
