import React from 'react';
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
    { key: '30days', label: '30 Days' },
    { key: 'alltime', label: 'All time' }
  ];

  return (
    <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 p-4 space-y-4">
      {/* Top Row */}
      <div className="flex items-center justify-between">
        {/* Left: Gifts Dropdown */}
        <div className="flex items-center bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700">
          <span className="text-white font-medium">Gifts</span>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
        </div>

        {/* Right: Trend Counter */}
        <div className="flex items-center space-x-4">
          <motion.div 
            className="flex items-center bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <motion.span 
              className="text-green-400 font-bold text-lg"
              key={trendData.rising}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {trendData.rising}
            </motion.span>
          </motion.div>

          <motion.div 
            className="flex items-center bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
            <motion.span 
              className="text-red-400 font-bold text-lg"
              key={trendData.falling}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {trendData.falling}
            </motion.span>
          </motion.div>

          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Second Row: Time Filters and Options */}
      <div className="flex items-center justify-between">
        {/* Time Filter Tabs */}
        <div className="flex space-x-2">
          {timeFilters.map((filter) => (
            <motion.button
              key={filter.key}
              className={`px-4 py-2 rounded-lg border transition-all ${
                timeFilter === filter.key
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-gray-800/50 text-gray-300 border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => onTimeFilterChange(filter.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>

        {/* Show Small Changes Toggle */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSmallChanges}
              onChange={onToggleSmallChanges}
              className="w-4 h-4 text-green-500 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
            />
            <span className="text-gray-300 text-sm">Show small changes</span>
          </label>
        </div>
      </div>

      {/* Third Row: Search and Refresh */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search gifts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <motion.button
          onClick={onRefresh}
          className="flex items-center space-x-2 bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, rotate: 180 }}
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-xs">{lastUpdate.toLocaleTimeString()}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Header;
