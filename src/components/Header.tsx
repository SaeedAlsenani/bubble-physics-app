import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, TrendingUp, TrendingDown, RefreshCw, Search } from 'lucide-react';
import { TrendData, TimeFilter } from '../types/Gift';

interface HeaderProps {
  trendData: TrendData;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  showSmallChanges: boolean;
  onToggleSmallChanges: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  lastUpdate: Date;
  onRefresh: () => void;
}

const Header: React.FC<HeaderProps> = ({
  trendData,
  timeFilter,
  onTimeFilterChange,
  showSmallChanges,
  onToggleSmallChanges,
  searchQuery,
  onSearchChange,
  lastUpdate,
  onRefresh
}) => {
  const timeFilters: { key: TimeFilter; label: string }[] = [
    { key: 'today', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: '30days', label: '30D' }, // اختصر النص ليتناسب مع الشاشات الصغيرة
    { key: 'alltime', label: 'All' }
  ];

  const handleTimeFilterChange = useCallback((filter: TimeFilter) => {
    onTimeFilterChange(filter);
  }, [onTimeFilterChange]);

  return (
    <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 p-3 space-y-3 w-full max-w-[100vw] overflow-x-hidden">
      {/* الصف العلوي - معدل ليتكيف مع الشاشات الصغيرة */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* عنصر القائمة المنسدلة */}
        <motion.div 
          className="flex items-center bg-gray-800/50 rounded-lg px-3 py-1.5 border border-gray-700 min-w-[100px]"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="text-white font-medium text-sm whitespace-nowrap">Gifts</span>
          <ChevronDown className="w-3.5 h-3.5 ml-1.5 text-gray-400" />
        </motion.div>

        {/* العدادات - معدلة للشاشات الصغيرة */}
        <div className="flex flex-wrap items-center gap-2">
          <motion.div 
            className="flex items-center bg-gray-800/50 rounded-lg px-2 py-1 border border-gray-700"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <TrendingUp className="w-3.5 h-3.5 text-green-400 mr-1" />
            <motion.span 
              className="text-green-400 font-bold text-sm"
              key={trendData.rising}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {trendData.rising}
            </motion.span>
          </motion.div>

          <motion.div 
            className="flex items-center bg-gray-800/50 rounded-lg px-2 py-1 border border-gray-700"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <TrendingDown className="w-3.5 h-3.5 text-red-400 mr-1" />
            <motion.span 
              className="text-red-400 font-bold text-sm"
              key={trendData.falling}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {trendData.falling}
            </motion.span>
          </motion.div>
        </div>
      </div>

      {/* صف الفلاتر الزمنية - متجاوب مع الشاشات الصغيرة */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {timeFilters.map((filter) => (
            <motion.button
              key={filter.key}
              className={`px-2.5 py-1.5 rounded-lg border text-xs ${
                timeFilter === filter.key
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-gray-800/50 text-gray-300 border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => handleTimeFilterChange(filter.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>

        {/* خيار التغييرات الصغيرة */}
        <div className="flex items-center">
          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showSmallChanges}
              onChange={onToggleSmallChanges}
              className="w-3.5 h-3.5 text-green-500 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
            />
            <span className="text-gray-300 text-xs whitespace-nowrap">Small changes</span>
          </label>
        </div>
      </div>

      {/* صف البحث والتحديث - متكيف تمامًا */}
      <div className="flex flex-wrap items-center gap-2 w-full">
        <div className="flex-1 min-w-[150px] relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search gifts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-8 pr-2.5 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
            aria-label="Search gifts"
          />
        </div>
        
        <motion.button
          onClick={onRefresh}
          className="flex items-center space-x-1.5 bg-gray-800/50 border border-gray-600 rounded-lg px-2 py-1.5 text-gray-300 hover:text-white transition-colors text-xs whitespace-nowrap"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97, rotate: 180 }}
          aria-label={`Refresh data, last updated at ${lastUpdate.toLocaleTimeString()}`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{lastUpdate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default React.memo(Header);
