import React, { useRef } from 'react';
import WorkoutCard from './WorkoutCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DailyViewProps {
  currentDate: Date;
  onChangeDay: (direction: number) => void;
}

const DailyView: React.FC<DailyViewProps> = ({ currentDate, onChangeDay }) => {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const diff = touchEndX.current - touchStartX.current;
    if (diff > 50) {
      onChangeDay(-1); // Swipe right = previous day
    } else if (diff < -50) {
      onChangeDay(1); // Swipe left = next day
    }
  };

  const getPrevDate = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 1);
    return prev;
  };

  const getNextDate = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 1);
    return next;
  };

  return (
    <div className="mb-8">
      {/* Navigation arrows for desktop */}
      <div className="hidden md:flex items-center justify-center gap-4 mb-6">
        <button 
          onClick={() => onChangeDay(-1)}
          className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors duration-200 border border-gray-600 hover:border-blue-500"
        >
          <ChevronLeft size={20} className="text-gray-300" />
        </button>
        
        <div className="flex-1 max-w-2xl">
          <WorkoutCard date={currentDate} variant="center" />
        </div>
        
        <button 
          onClick={() => onChangeDay(1)}
          className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors duration-200 border border-gray-600 hover:border-blue-500"
        >
          <ChevronRight size={20} className="text-gray-300" />
        </button>
      </div>
      
      {/* Desktop view with adjacent cards */}
      <div className="hidden md:flex items-center justify-center gap-4 mb-6">
        <div className="flex-1 max-w-xs">
          <WorkoutCard 
            date={getPrevDate()} 
            variant="adjacent" 
            onClick={() => onChangeDay(-1)} 
          />
        </div>
        
        <div className="flex-1 max-w-2xl">
          <WorkoutCard date={currentDate} variant="center" />
        </div>
        
        <div className="flex-1 max-w-xs">
          <WorkoutCard 
            date={getNextDate()} 
            variant="adjacent" 
            isNext={true}
            onClick={() => onChangeDay(1)} 
          />
        </div>
      </div>
      
      {/* Three-card view for mobile */}
      <div 
        className="md:hidden flex items-center justify-center gap-2 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      >
        <div className="flex-1 max-w-xs">
        <WorkoutCard 
          date={getPrevDate()} 
          variant="adjacent" 
          onClick={() => onChangeDay(-1)} 
        />
        </div>
        <div className="flex-1 max-w-md">
        <WorkoutCard date={currentDate} variant="center" />
        </div>
        <div className="flex-1 max-w-xs">
        <WorkoutCard 
          date={getNextDate()} 
          variant="adjacent" 
          isNext={true}
          onClick={() => onChangeDay(1)} 
        />
        </div>
      </div>
    </div>
  );
};

export default DailyView;