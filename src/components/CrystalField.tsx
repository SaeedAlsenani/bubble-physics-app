import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Crystal from './Crystal';
import { Gift } from '../types/Gift';

interface CrystalFieldProps {
  gifts: Gift[];
  onCrystalClick: (gift: Gift) => void;
  searchQuery: string;
  showSmallChanges: boolean;
}

interface CrystalPosition {
  id: string;
  x: number;
  y: number;
  size: number;
  zIndex: number;
}

const CrystalField: React.FC<CrystalFieldProps> = ({ 
  gifts, 
  onCrystalClick, 
  searchQuery, 
  showSmallChanges 
}) => {
  // الحالة والمراجع
  const [crystalPositions, setCrystalPositions] = useState<CrystalPosition[]>([]);
  const fieldRef = React.useRef<HTMLDivElement>(null);
  const collisionGrid = React.useRef<boolean[][]>([]);
  const gridCellSize = 30; // حجم خلية شبكة الاصطدام

  // فلترة الهدايا باستخدام useMemo لتحسين الأداء
  const filteredGifts = useMemo(() => {
    return gifts.filter(gift => {
      const matchesSearch = gift.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSmallChanges = showSmallChanges || Math.abs(gift.percentChange) >= 2;
      return matchesSearch && matchesSmallChanges;
    });
  }, [gifts, searchQuery, showSmallChanges]);

  // حساب حجم البلورة مع الحدود الجديدة
  const getCrystalSize = useCallback((gift: Gift) => {
    const baseSize = 60;
    const changeMultiplier = Math.min(Math.abs(gift.percentChange) / 10, 2);
    const volumeMultiplier = Math.min(gift.volume / 1000, 1.5);
    const rarityMultiplier = {
      common: 1,
      rare: 1.2,
      epic: 1.4,
      legendary: 1.6
    }[gift.rarity];
    
    return Math.max(20, Math.min(150, 
      baseSize + (changeMultiplier * 15) + (volumeMultiplier * 10) + (rarityMultiplier * 5)
    );
  }, []);

  // إنشاء شبكة الاصطدام
  const initializeCollisionGrid = useCallback((width: number, height: number) => {
    const cols = Math.ceil(width / gridCellSize);
    const rows = Math.ceil(height / gridCellSize);
    collisionGrid.current = Array(rows).fill(false).map(() => Array(cols).fill(false));
  }, []);

  // التحقق من الموقع المتاح
  const isPositionAvailable = useCallback((x: number, y: number, size: number) => {
    if (!collisionGrid.current.length) return true;
    
    const radius = size / 2;
    const buffer = 5; // مسافة أمان بين البلورات
    
    const startCol = Math.max(0, Math.floor((x - radius - buffer) / gridCellSize));
    const endCol = Math.min(collisionGrid.current[0].length - 1, 
      Math.floor((x + radius + buffer) / gridCellSize));
    
    const startRow = Math.max(0, Math.floor((y - radius - buffer) / gridCellSize));
    const endRow = Math.min(collisionGrid.current.length - 1, 
      Math.floor((y + radius + buffer) / gridCellSize));
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        if (collisionGrid.current[row][col]) {
          return false;
        }
      }
    }
    return true;
  }, []);

  // حجز الموقع في شبكة الاصطدام
  const reservePosition = useCallback((x: number, y: number, size: number) => {
    if (!collisionGrid.current.length) return;
    
    const radius = size / 2;
    const startCol = Math.max(0, Math.floor((x - radius) / gridCellSize));
    const endCol = Math.min(collisionGrid.current[0].length - 1, 
      Math.floor((x + radius) / gridCellSize));
    
    const startRow = Math.max(0, Math.floor((y - radius) / gridCellSize));
    const endRow = Math.min(collisionGrid.current.length - 1, 
      Math.floor((y + radius) / gridCellSize));
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        collisionGrid.current[row][col] = true;
      }
    }
  }, []);

  // توليد المواقع مع منع التداخل
  const generatePositions = useCallback(() => {
    const container = fieldRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    initializeCollisionGrid(width, height);
    
    const positions: CrystalPosition[] = [];
    const margin = 50;
    const maxAttempts = 100;
    
    // ترتيب البلورات بحجم تنازلي لتحسين التوزيع
    const sortedGifts = [...filteredGifts].sort((a, b) => 
      getCrystalSize(b) - getCrystalSize(a)
    );

    sortedGifts.forEach((gift, index) => {
      const size = getCrystalSize(gift);
      let x, y;
      let attempts = 0;
      let positionFound = false;
      
      do {
        x = margin + Math.random() * (width - 2 * margin);
        y = margin + Math.random() * (height - 2 * margin);
        attempts++;
        
        if (isPositionAvailable(x, y, size)) {
          reservePosition(x, y, size);
          positions.push({
            id: gift.id,
            x,
            y,
            size,
            zIndex: positions.length
          });
          positionFound = true;
        }
      } while (!positionFound && attempts < maxAttempts);
      
      // إذا فشلنا في إيجاد موقع، نضعها في مكان عشوائي مع تعديل
      if (!positionFound) {
        x = margin + Math.random() * (width - 2 * margin);
        y = margin + Math.random() * (height - 2 * margin);
        reservePosition(x, y, size);
        positions.push({
          id: gift.id,
          x,
          y,
          size,
          zIndex: positions.length
        });
      }
    });
    
    setCrystalPositions(positions);
  }, [filteredGifts, getCrystalSize, initializeCollisionGrid, isPositionAvailable, reservePosition]);

  // تحديث المواقع عند تغيير البيانات أو حجم النافذة
  useEffect(() => {
    generatePositions();
    
    const handleResize = () => {
      generatePositions();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [generatePositions]);

  // تحديث موقع البلورة مع التحقق من الاصطدام
  const updateCrystalPosition = useCallback((id: string, newX: number, newY: number) => {
    setCrystalPositions(prev => {
      const updated = [...prev];
      const crystalIndex = updated.findIndex(pos => pos.id === id);
      
      if (crystalIndex === -1) return prev;
      
      const crystal = updated[crystalIndex];
      const newPosition = { ...crystal, x: newX, y: newY };
      
      // التحقق من الاصطدام مع البلورات الأخرى
      const hasCollision = updated.some((pos, index) => {
        if (index === crystalIndex || pos.id === id) return false;
        
        const distance = Math.sqrt(
          Math.pow(newX - pos.x, 2) + 
          Math.pow(newY - pos.y, 2)
        );
        const minDistance = (newPosition.size + pos.size) / 2 + 10;
        
        return distance < minDistance;
      });
      
      if (!hasCollision) {
        updated[crystalIndex] = newPosition;
      }
      
      return updated;
    });
  }, []);

  // تأثيرات الجسيمات المحسنة
  const renderParticles = useMemo(() => {
    return Array.from({ length: Math.min(12, filteredGifts.length * 0.5) }).map((_, i) => (
      <motion.div
        key={`particle-${i}`}
        className="absolute w-1 h-1 bg-white/20 rounded-full pointer-events-none"
        style={{
          left: `${10 + (i * 8) % 90}%`,
          top: `${15 + (i % 7) * 12}%`,
        }}
        animate={{
          y: [0, -15, 0],
          opacity: [0.1, 0.4, 0.1],
          scale: [1, 1.3, 1]
        }}
        transition={{
          duration: 5 + i,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.2
        }}
      />
    ));
  }, [filteredGifts.length]);

  return (
    <motion.div
      ref={fieldRef}
      id="crystal-field"
      className="relative flex-1 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* تأثيرات الإضاءة الخلفية المحسنة */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.03),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(239,68,68,0.03),transparent_70%)]" />
      
      {/* البلورات مع نظام فيزيائي محسن */}
      {crystalPositions.map((position) => {
        const gift = filteredGifts.find(g => g.id === position.id);
        if (!gift) return null;
        
        return (
          <Crystal
            key={gift.id}
            gift={gift}
            size={position.size}
            position={{ x: position.x, y: position.y }}
            onClick={() => onCrystalClick(gift)}
            onDragEnd={(x, y) => updateCrystalPosition(gift.id, x, y)}
            isLayoutStable={true}
          />
        );
      })}
      
      {/* حالة عدم وجود نتائج */}
      {filteredGifts.length === 0 && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center space-y-4">
            <motion.div 
              animate={{ y: [-10, 0, -10] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-6xl"
            >
              💎
            </motion.div>
            <div className="text-gray-400 text-lg">No crystals found</div>
            <div className="text-gray-500 text-sm">Try adjusting your search or filters</div>
          </div>
        </motion.div>
      )}
      
      {/* جسيمات عائمة مع تحسين الأداء */}
      {renderParticles}
    </motion.div>
  );
};

export default CrystalField;
