import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
}

const CrystalField: React.FC<CrystalFieldProps> = ({
gifts,
onCrystalClick,
searchQuery,
showSmallChanges
}) => {
const [crystalPositions, setCrystalPositions] = useState<CrystalPosition[]>([]);
const [fieldDimensions, setFieldDimensions] = useState({ width: 0, height: 0 });

// Filter gifts based on search and small changes toggle
const filteredGifts = gifts.filter(gift => {
const matchesSearch = gift.name.toLowerCase().includes(searchQuery.toLowerCase());
const matchesSmallChanges = showSmallChanges || Math.abs(gift.percentChange) >= 2;
return matchesSearch && matchesSmallChanges;
});

// Calculate crystal size based on various factors
const getCrystalSize = (gift: Gift) => {
const baseSize = 80;
const changeMultiplier = Math.min(Math.abs(gift.percentChange) / 10, 2);
const volumeMultiplier = Math.min(gift.volume / 1000, 1.5);
const rarityMultiplier = {
common: 1,
rare: 1.2,
epic: 1.4,
legendary: 1.6
}[gift.rarity];

return Math.max(60, Math.min(140, baseSize + (changeMultiplier * 20) + (volumeMultiplier * 15) + (rarityMultiplier * 10)));

};

// Generate organic positions for crystals
const generatePositions = () => {
const container = document.getElementById('crystal-field');
if (!container) return;

const rect = container.getBoundingClientRect();  
const width = rect.width;  
const height = rect.height;  
  
setFieldDimensions({ width, height });  

const positions: CrystalPosition[] = [];  
const margin = 100;  
  
filteredGifts.forEach((gift, index) => {  
  const size = getCrystalSize(gift);  
  let x, y;  
  let attempts = 0;  
    
  do {  
    x = margin + Math.random() * (width - 2 * margin);  
    y = margin + Math.random() * (height - 2 * margin);  
    attempts++;  
  } while (attempts < 50 && positions.some(pos => {  
    const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));  
    return distance < (size + pos.size) / 2 + 20;  
  }));  
    
  positions.push({  
    id: gift.id,  
    x,  
    y,  
    size  
  });  
});  
  
setCrystalPositions(positions);

};

// Initialize positions when gifts change
useEffect(() => {
generatePositions();
}, [filteredGifts]);

// Handle window resize
useEffect(() => {
const handleResize = () => generatePositions();
window.addEventListener('resize', handleResize);
return () => window.removeEventListener('resize', handleResize);
}, []);

// Update crystal position on drag
const updateCrystalPosition = (id: string, newX: number, newY: number) => {
setCrystalPositions(prev =>
prev.map(pos =>
pos.id === id ? { ...pos, x: newX, y: newY } : pos
)
);
};

return (
<motion.div
id="crystal-field"
className="relative flex-1 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden"
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.5 }}
>
{/* Ambient background effects */}
<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_50%)]" />
<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(239,68,68,0.05),transparent_50%)]" />

{/* Crystals */}  
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
      />  
    );  
  })}  
    
  {/* Empty state */}  
  {filteredGifts.length === 0 && (  
    <div className="absolute inset-0 flex items-center justify-center">  
      <div className="text-center space-y-4">  
        <div className="text-6xl">💎</div>  
        <div className="text-gray-400 text-lg">No crystals found</div>  
        <div className="text-gray-500 text-sm">Try adjusting your search or filters</div>  
      </div>  
    </div>  
  )}  
    
  {/* Floating particles for ambiance */}  
  {Array.from({ length: 8 }).map((_, i) => (  
    <motion.div  
      key={i}  
      className="absolute w-1 h-1 bg-white/20 rounded-full"  
      style={{  
        left: `${10 + i * 12}%`,  
        top: `${20 + (i % 3) * 30}%`,  
      }}  
      animate={{  
        y: [0, -20, 0],  
        opacity: [0.2, 0.6, 0.2],  
      }}  
      transition={{  
        duration: 4 + i * 0.5,  
        repeat: Infinity,  
        ease: "easeInOut",  
      }}  
    />  
  ))}  
</motion.div>

);
};

export default CrystalField;


