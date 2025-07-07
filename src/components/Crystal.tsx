import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, PanInfo, useAnimation } from 'framer-motion';
import { Gift } from '../types/Gift';
import { Gem } from 'lucide-react';

interface CrystalProps {
  gift: Gift;
  size: number;
  position: { x: number; y: number };
  onClick: () => void;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onDragMove: (id: string, x: number, y: number) => void;
  isDragging: boolean;
  zIndex: number;
  entryDelay: number;
}

const Crystal: React.FC<CrystalProps> = ({ 
  gift, 
  size, 
  position, 
  onClick, 
  onDragStart,
  onDragEnd,
  onDragMove,
  isDragging,
  zIndex,
  entryDelay
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const dragStartTime = useRef(0);
  const crystalRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  
  // Smooth motion values for position with physics-based springs
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);
  const smoothX = useSpring(x, { 
    stiffness: 300, 
    damping: 30,
    mass: 0.8
  });
  const smoothY = useSpring(y, { 
    stiffness: 300, 
    damping: 30,
    mass: 0.8
  });
  
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

  // Organic entry animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasEntered(true);
      controls.start({
        scale: 1,
        opacity: 1,
        rotate: 0,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 20,
          mass: 1,
          duration: 0.8
        }
      });
    }, entryDelay);

    return () => clearTimeout(timer);
  }, [entryDelay, controls]);

  // Update position smoothly when props change
  useEffect(() => {
    if (!isDragging) {
      x.set(position.x);
      y.set(position.y);
    }
  }, [position.x, position.y, isDragging, x, y]);

  const handleDragStart = useCallback(() => {
    dragStartTime.current = Date.now();
    onDragStart(gift.id);
  }, [gift.id, onDragStart]);

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const newX = position.x + info.offset.x;
    const newY = position.y + info.offset.y;
    onDragMove(gift.id, newX, newY);
  }, [gift.id, position.x, position.y, onDragMove]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragDuration = Date.now() - dragStartTime.current;
    
    // Determine if this was a tap or a drag
    if (dragDuration < 200 && Math.abs(info.offset.x) < 10 && Math.abs(info.offset.y) < 10) {
      // Short tap - trigger click
      onClick();
    } else {
      // Drag - update position
      const newX = position.x + info.offset.x;
      const newY = position.y + info.offset.y;
      onDragEnd(gift.id, newX, newY);
    }
  }, [gift.id, position.x, position.y, onClick, onDragEnd]);

  // Physics-based movement constraints
  const constraints = {
    left: -window.innerWidth * 0.4,
    right: window.innerWidth * 0.4,
    top: -window.innerHeight * 0.4,
    bottom: window.innerHeight * 0.4
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
        zIndex: isDragging ? 1000 : zIndex + 10,
        left: -size / 2,
        top: -size / 2,
      }}
      initial={{ 
        scale: 0, 
        opacity: 0, 
        rotate: -180,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }}
      animate={controls}
      whileHover={{ 
        scale: isDragging ? 1.15 : 1.05,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      whileTap={{ 
        scale: 1.1,
        transition: { type: "spring", stiffness: 600, damping: 20 }
      }}
      drag
      dragConstraints={constraints}
      dragElastic={0.05}
      dragMomentum={false}
      dragTransition={{ 
        power: 0.2, 
        timeConstant: 300,
        modifyTarget: (target) => Math.round(target)
      }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      <div className="relative w-full h-full">
        {/* Crystal Shape with SVG */}
        <motion.svg
          width={size}
          height={size}
          className="absolute inset-0"
          animate={{
            filter: isDragging 
              ? `drop-shadow(0 0 ${size/2}px ${glowColor}) drop-shadow(0 12px 24px rgba(0,0,0,0.5))`
              : isHovering
              ? `drop-shadow(0 0 ${size/3}px ${glowColor}) drop-shadow(0 4px 8px rgba(0,0,0,0.3))`
              : `drop-shadow(0 0 ${size/6}px ${glowColor}) drop-shadow(0 2px 4px rgba(0,0,0,0.2))`
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <defs>
            <radialGradient id={`gradient-${gift.id}`} cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor={isPositive ? 'rgba(0, 255, 136, 0.5)' : 
                                         isNegative ? 'rgba(255, 71, 87, 0.5)' : 
                                         'rgba(255, 255, 255, 0.3)'} />
              <stop offset="50%" stopColor={isPositive ? 'rgba(0, 255, 136, 0.3)' : 
                                           isNegative ? 'rgba(255, 71, 87, 0.3)' : 
                                           'rgba(255, 255, 255, 0.15)'} />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0.9)" />
            </radialGradient>
            
            <filter id={`glow-${gift.id}`}>
              <feGaussianBlur stdDeviation={isDragging ? "6" : "3"} result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id={`inner-glow-${gift.id}`}>
              <feGaussianBlur stdDeviation="2" result="innerGlow"/>
              <feComposite in="innerGlow" in2="SourceGraphic" operator="multiply"/>
            </filter>
          </defs>
          
          <motion.path
            d={nonagonPath}
            fill={`url(#gradient-${gift.id})`}
            stroke={borderColor}
            strokeWidth={isDragging ? "3" : "2"}
            filter={`url(#glow-${gift.id})`}
            animate={{
              strokeWidth: isDragging ? 3 : isHovering ? 2.5 : 2,
              opacity: hasEntered ? 1 : 0
            }}
            transition={{ duration: 0.2 }}
          />
        </motion.svg>

        {/* Content */}
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center text-white p-2"
          animate={{
            scale: isDragging ? 1.1 : 1,
            opacity: hasEntered ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-center space-y-1">
            {/* Icon */}
            <motion.div 
              className="text-lg mb-1"
              animate={{
                scale: isDragging ? 1.2 : isHovering ? 1.1 : 1,
                rotate: isDragging ? [0, 5, -5, 0] : 0
              }}
              transition={{ 
                scale: { duration: 0.2 },
                rotate: { duration: 0.5, repeat: isDragging ? Infinity : 0 }
              }}
            >
              {gift.icon}
            </motion.div>
            
            {/* Name */}
            <div className="text-xs font-semibold truncate max-w-full">{gift.name}</div>
            
            {/* Percentage Change */}
            <motion.div 
              className={`text-xs font-bold ${
                isPositive ? 'text-green-400' : 
                isNegative ? 'text-red-400' : 
                'text-gray-400'
              }`}
              animate={{
                scale: isDragging ? 1.1 : 1
              }}
            >
              {gift.percentChange > 0 ? '+' : ''}{gift.percentChange.toFixed(1)}%
            </motion.div>
            
            {/* Price */}
            <div className="flex items-center justify-center text-xs">
              <Gem className="w-3 h-3 mr-1 text-blue-400" />
              <span className="font-semibold">{gift.price.toFixed(0)}</span>
            </div>
          </div>
        </motion.div>

        {/* Drag indicator with physics-based animation */}
        {isDragging && (
          <motion.div
            className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full"
            initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
            animate={{ 
              opacity: [0.4, 0.8, 0.4], 
              scale: [0.9, 1.1, 0.9],
              rotate: 360
            }}
            transition={{
              opacity: { duration: 1.5, repeat: Infinity },
              scale: { duration: 1.5, repeat: Infinity },
              rotate: { duration: 3, repeat: Infinity, ease: "linear" }
            }}
            exit={{ opacity: 0, scale: 0.8 }}
          />
        )}

        {/* Magnetic field visualization when dragging */}
        {isDragging && (
          <motion.div
            className="absolute inset-0 rounded-full border border-white/20"
            style={{
              width: size * 2,
              height: size * 2,
              left: -size / 2,
              top: -size / 2,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0], 
              scale: [0.5, 1.5, 2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(Crystal);