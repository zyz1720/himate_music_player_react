import { useEffect, useRef } from 'react';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const CustomTable = ({
  columns,
  dataSource,
  rowKey,
  rowClassName,
  hasMore = false,
  loading = false,
  onLoadMore,
}) => {
  const observerRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!hasMore || loading || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    const target = observerRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, loading, onLoadMore]);

  return (
    <div className="h-full overflow-x-auto overflow-y-auto scrollbar-hide">
      <table className="w-full border-collapse">
        {/* 表头 */}
        <thead>
          <tr>
            {columns.map((column, colIndex) => (
              <th
                key={colIndex}
                className="text-white bg-white/5 backdrop-blur-[10px] border border-white/10 p-2 text-left"
                style={{ width: column.width }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        {/* 表格主体 */}
        <tbody>
          {dataSource.map((record, rowIndex) => (
            <motion.tr
              key={record[rowKey]}
              className={`border-b border-white/10 ${
                rowClassName ? rowClassName(record) : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: (rowIndex % 10) * 0.05,
                ease: 'easeOut',
              }}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="p-2"
                  style={{ width: column.width }}
                >
                  {column.render
                    ? column.render(record[column.dataIndex], record, rowIndex)
                    : record[column.dataIndex]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
      {/* 无限滚动触发元素 */}
      {hasMore && (
        <div
          ref={observerRef}
          className="flex justify-center items-center py-4"
        >
          <Spin size="small" />
          <span className="ml-2 text-sm text-gray-500">
            {t('music.loading')}
          </span>
        </div>
      )}
    </div>
  );
};

export default CustomTable;
