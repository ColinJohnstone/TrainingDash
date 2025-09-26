import React from 'react';
import { trainingPlan } from '../data/trainingPlan';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WorkoutCardProps {
  date: Date;
  variant: 'center' | 'adjacent';
  onClick?: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ date, variant, onClick }) => {
  const dateString = date.toISOString().split('T')[0];
  const workout = trainingPlan[dateString];
  
  const getCardClasses = () => {
    let baseClasses = "bg-gray-800 border border-gray-600 rounded-xl p-4 text-center shadow-xl transition-all duration-300 flex flex-col justify-center relative";
    
    if (variant === 'adjacent') {
      baseClasses += " transform scale-85 opacity-60 cursor-pointer hover:opacity-80 hover:scale-90 h-64 overflow-hidden";
    } else {
      baseClasses += " border-2 border-blue-500 transform scale-100 opacity-100 min-h-80";
    }
    
    if (workout?.type === 'race') {
      baseClasses += " bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-500 shadow-yellow-500/20";
    } else if (!workout || workout.activity.toLowerCase().includes('rest') || workout.activity.toLowerCase().includes('recovery')) {
      baseClasses += " bg-gradient-to-br from-gray-700 to-gray-800";
    } else {
      baseClasses += " bg-gradient-to-br from-gray-800 to-gray-900";
    }
    
    return baseClasses;
  };

  const formatDetails = (details: string) => {
    return { __html: details.replace(/<br>/g, '<br/>') };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={getCardClasses()} onClick={onClick}>
      {variant === 'adjacent' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-xl">
          {onClick && (
            <div className="text-white">
              <ChevronLeft size={24} className="mx-auto" />
            </div>
          )}
        </div>
      )}
      
      <h2 className={`${variant === 'center' ? 'text-lg text-white font-semibold' : 'text-sm text-gray-300 font-medium'} mb-3`}>
        {variant === 'center' 
          ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
          : formatDate(date)
        }
      </h2>
      
      {workout ? (
        <>
          <div className={`${variant === 'center' ? 'text-xl' : 'text-base'} font-bold mb-3 text-white leading-tight`}>
            {workout.activity}
          </div>
          {workout.details && variant === 'center' && (
            <div 
              className="text-left text-sm leading-relaxed text-gray-300 mt-4"
              dangerouslySetInnerHTML={formatDetails(workout.details)}
            />
          )}
          {workout.type === 'race' && variant === 'center' && (
            <div className="mt-4 px-3 py-1 bg-yellow-600 text-yellow-100 rounded-full text-xs font-semibold inline-block">
              🏁 RACE DAY
            </div>
          )}
        </>
      ) : (
        <div className="text-gray-400 italic text-sm">No workout scheduled</div>
      )}
    </div>
  );
};

export default WorkoutCard;