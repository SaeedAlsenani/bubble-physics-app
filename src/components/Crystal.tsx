import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift } from '../types/Gift';
import { Gem } from 'lucide-react';

interface CrystalProps {
  gift: Gift;
  size: number;
  position: { x: number; y: number };
  onClick: () => void;
  onDragEnd: (x: number, y: number) => void;
}

const Crystal: React.FC<CrystalProps> = ({ gift, size, position, onClick, onDragEnd }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState(0);

  const isPositive = gift.percentChange > 0;
  const isNegative = gift.percentChange < 0;

  const glowColor = isPositive
    ? 'rgba(0, 255, 136, 0.6)'
    : isNegative
    ? 'rgba(255, 71, 87, 0.6)'
    : 'rgba(255, 255, 255, 0.3)';

  const borderColor = isPositive
    ? '#00ff88'
    : isNegative
    ? '#ff4757'
    : '#666';

  const createNonagonPath = (radius: number) => {
    const points = [];
    for (let i = 0; i < 9; i++) {
      const angle = (i * 2 * Math.PI) / 9 - Math.PI / 2;
      const x = radius + radius * Math.cos(angle);
      const y = radius + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return `M${points.join('L')}Z`;
  };

  const radius = size / 2;
  const nonagonPath = createNonagonPath(radius - 4);

  const handleDragStart = () => {
    setDragStartTime(Date.now());
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: any) => {
    const dragDuration = Date.now() - dragStartTime;
    setIsDragging(false);

    if (dragDuration > 200 && (Math.abs(info.offset.x) > 10 || Math.abs(info.offset.y) > 10)) {
      onDragEnd(position.x + info.offset.x, position.y + info.offset.y);
    } else {
      onClick();
    }
  };

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
        zIndex: isDragging ? 50 : 10,
        filter: isDragging
          ? `drop-shadow(0 0 ${size / 3}px ${glowColor}) drop-shadow(0 8px 16px rgba(0,0,0,0.4))`
          : `drop-shadow(0 0 ${size / 6}px ${glowColor})`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isDragging ? 1.15 : 1, opacity: 1 }}
      whileHover={{
        scale: 1.05,
        filter: `drop-shadow(0 0 ${size / 4}px ${glowColor})`,
      }}
      drag
      dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
      dragElastic={0}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        mass: 0.8,
      }}
    >
      <div className="relative w-full h-full">
        <svg
          width={size}
          height={size}
          className="absolute inset-0"
          style={{
            filter: isDragging
              ? `drop-shadow(0 0 ${size / 6}px ${glowColor}) drop-shadow(0 4px 8px rgba(0,0,0,0.3))`
              : `drop-shadow(0 0 ${size / 8}px ${glowColor})`,
          }}
        >
          <defs>
            <radialGradient id={`gradient-${gift.id}`} cx="50%" cy="30%" r="70%">
              <stop
                offset="0%"
                stopColor={
                  isPositive
                    ? 'rgba(0, 255, 136, 0.4)'
                    : isNegative
                    ? 'rgba(255, 71, 87, 0.4)'
                    : 'rgba(255, 255, 255, 0.2)'
                }
              />
              <stop
                offset="50%"
                stopColor={
                  isPositive
                    ? 'rgba(0, 255, 136, 0.2)'
                    : isNegative
                    ? 'rgba(255, 71, 87, 0.2)'
                    : 'rgba(255, 255, 255, 0.1)'
                }
              />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0.8)" />
            </radialGradient>

            <filter id={`glow-${gift.id}`}>
              <feGaussianBlur stdDeviation={isDragging ? '4' : '2'} result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d={nonagonPath}
            fill={`url(#gradient-${gift.id})`}
            stroke={borderColor}
            strokeWidth={isDragging ? '3' : '2'}
            filter={`url(#glow-${gift.id})`}
            className="transition-all duration-200"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2">
          <div className="text-center space-y-1">
            <div
              className={`text-lg mb-1 transition-transform duration-200 ${
                isDragging ? 'scale-110' : ''
              }`}
            >
              {gift.icon}
            </div>
            <div className="text-xs font-semibold truncate max-w-full">{gift.name}</div>
            <div
              className={`text-xs font-bold ${
                isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'
              }`}
            >
              {gift.percentChange > 0 ? '+' : ''}
              {gift.percentChange.toFixed(1)}%
            </div>
            <div className="flex items-center justify-center text-xs">
              <Gem className="w-3 h-3 mr-1 text-blue-400" />
              <span className="font-semibold">{gift.price.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Crystal;
