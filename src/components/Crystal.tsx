import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, PanInfo } from 'framer-motion';
import { Gift } from '../types/Gift';
import { Gem } from 'lucide-react';

interface CrystalProps {
  gift: Gift;
  size: number;
  position: { x: number; y: number };
  onClick: () => void;
  onDragEnd: (x: number, y: number) => void;
  isLayoutStable: boolean; // New prop to control when movement is allowed
}

const Crystal: React.FC<CrystalProps> = ({ 
  gift, 
  size, 
  position, 
  onClick, 
  onDragEnd,
  isLayoutStable 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dragStartTime = useRef(0);
  const crystalRef = useRef<HTMLDivElement>(null);
  
  // Smooth motion values for position
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);
  const smoothX = useSpring(x, { stiffness: 300, damping: 30 });
  const smoothY = useSpring(y, { stiffness: 300, damping: 30 });
  
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

  // Update position when props change
  useEffect(() => {
    if (!isDragging && isLayoutStable) {
      x.set(position.x);
      y.set(position.y);
    }
  }, [position.x, position.y, isLayoutStable, isDragging, x, y]);

  const handleDragStart = () => {
    dragStartTime.current = Date.now();
    setIsDragging(true);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragDuration = Date.now() - dragStartTime.current;
    setIsDragging(false);
    
    // Only trigger drag if it was a long press (> 200ms) and significant movement
    if (dragDuration > 200 && (Math.abs(info.offset.x) > 10 || Math.abs(info.offset.y) > 10)) {
      onDragEnd(position.x + info.offset.x, position.y + info.offset.y);
    } else {
      // Short tap - trigger click
      onClick();
    }
  };

  // Physics-based movement constraints
  const constraints = {
    left: -window.innerWidth * 0.5,
    right: window.innerWidth * 0.5,
    top: -window.innerHeight * 0.5,
    bottom: window.innerHeight * 0.5
  };

  return (
    <motion.div
      ref={crystalRef}
      className="absolute cursor-pointer select-none touch-none"
      style={{
        x: smoothX,
        y: smoothY,
        width: size,
        height: size,
        zIndex: isDragging ? 50 : isHovering ? 20 : 10,
        left: -size / 2,
        top: -size / 2,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isDragging ? 1.15 : isHovering ? 1.05 : 1, 
        opacity: 1,
        filter: isDragging 
          ? `drop-shadow(0 0 ${size/3}px ${glowColor}) drop-shadow(0 8px 16px rgba(0,0,0,0.4))`
          : isHovering
          ? `drop-shadow(0 0 ${size/4}px ${glowColor})`
          : `drop-shadow(0 0 ${size/6}px ${glowColor})`,
        transition: {
          filter: { duration: 0.2 }
        }
      }}
      exit={{ scale: 0, opacity: 0 }}
      drag={isLayoutStable}
      dragConstraints={constraints}
      dragElastic={0.1}
      dragMomentum={false}
      dragTransition={{ power: 0, timeConstant: 500 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      whileTap={{ scale: 1.1 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        mass: 0.8
      }}
    >
      <div className="relative w-full h-full">
        {/* Crystal Shape with SVG */}
        <svg
          width={size}
          height={size}
          className="absolute inset-0"
          style={{ 
            filter: isDragging 
              ? `drop-shadow(0 0 ${size/6}px ${glowColor}) drop-shadow(0 4px 8px rgba(0,0,0,0.3))`
              : `drop-shadow(0 0 ${size/8}px ${glowColor})`
          }}
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
            
            <filter id={`glow-${gift.id}`}>
              <feGaussianBlur stdDeviation={isDragging ? "4" : "2"} result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <path
            d={nonagonPath}
            fill={`url(#gradient-${gift.id})`}
            stroke={borderColor}
            strokeWidth={isDragging ? "3" : "2"}
            filter={`url(#glow-${gift.id})`}
            className="transition-all duration-200"
          />
        </svg>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2">
          <div className="text-center space-y-1">
            {/* Icon */}
            <div className={`text-lg mb-1 transition-transform duration-200 ${
              isDragging ? 'scale-110' : ''
            }`}>
              {gift.icon}
            </div>
            
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

        {/* Drag indicator */}
        {isDragging && (
          <motion.div
            className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default Crystal;
