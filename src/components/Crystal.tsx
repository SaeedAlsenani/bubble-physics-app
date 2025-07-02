import React from 'react';
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
  const isPositive = gift.percentChange > 0;
  const isNegative = gift.percentChange < 0;
  
  const glowColor = isPositive ? 'rgba(0, 255, 136, 0.6)' : 
                   isNegative ? 'rgba(255, 71, 87, 0.6)' : 
                   'rgba(255, 255, 255, 0.3)';
  
  const borderColor = isPositive ? '#00ff88' : 
                     isNegative ? '#ff4757' : 
                     '#666';

  // Create nonagon path (9-sided polygon)
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

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        filter: `drop-shadow(0 0 ${size/6}px ${glowColor})`
      }}
      whileHover={{ 
        scale: 1.1,
        filter: `drop-shadow(0 0 ${size/4}px ${glowColor})`
      }}
      whileTap={{ scale: 0.95 }}
      drag
      dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
      onDragEnd={(_, info) => {
        onDragEnd(position.x + info.offset.x, position.y + info.offset.y);
      }}
      onClick={onClick}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="relative w-full h-full">
        {/* Crystal Shape with SVG */}
        <svg
          width={size}
          height={size}
          className="absolute inset-0"
          style={{ filter: `drop-shadow(0 0 ${size/8}px ${glowColor})` }}
        >
          <defs>
            <radialGradient id={`gradient-${gift.id}`} cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor={isPositive ? 'rgba(0, 255, 136, 0.4)' : 
                                         isNegative ? 'rgba(255, 71, 87, 0.4)' : 
                                         'rgba(255, 255, 255, 0.2)'} />
              <stop offset="50%" stopColor={isPositive ? 'rgba(0, 255, 136, 0.2)' : 
                                           isNegative ? 'rgba(255, 71, 87, 0.2)' : 
                                           'rgba(255, 255, 255, 0.1)'} />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0.8)" />
            </radialGradient>
          </defs>
          
          <path
            d={nonagonPath}
            fill={`url(#gradient-${gift.id})`}
            stroke={borderColor}
            strokeWidth="2"
            className="transition-all duration-300"
          />
        </svg>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2">
          <div className="text-center space-y-1">
            {/* Icon */}
            <div className="text-lg mb-1">{gift.icon}</div>
            
            {/* Name */}
            <div className="text-xs font-semibold truncate max-w-full">{gift.name}</div>
            
            {/* Percentage Change */}
            <div className={`text-xs font-bold ${
              isPositive ? 'text-green-400' : 
              isNegative ? 'text-red-400' : 
              'text-gray-400'
            }`}>
              {gift.percentChange > 0 ? '+' : ''}{gift.percentChange.toFixed(1)}%
            </div>
            
            {/* Price */}
            <div className="flex items-center justify-center text-xs">
              <Gem className="w-3 h-3 mr-1 text-blue-400" />
              <span className="font-semibold">{gift.price.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Floating animation */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            y: [0, -3, 0],
            rotate: [0, 1, -1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
};

export default Crystal;