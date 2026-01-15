import { useMemo } from 'react';

const CircleProgress = ({ 
  progress = 0, 
  size = 48, 
  strokeWidth = 4, 
  color = '#1890ff', 
  bgColor = 'rgba(255, 255, 255, 0.2)'
}) => {
  // 计算圆环参数
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const strokeDashoffset = useMemo(() => {
    const normalizedProgress = Math.max(0, Math.min(1, progress));
    return circumference - (normalizedProgress * circumference);
  }, [progress, circumference]);

  return (
    <div className="w-full h-full">
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* 背景圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* 进度圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
    </div>
  );
};

export default CircleProgress;