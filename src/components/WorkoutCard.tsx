import React from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { trainingPlan } from '../data/trainingPlan';

interface WorkoutCardProps {
  date: Date;
  variant: 'center' | 'adjacent';
  isNext?: boolean;
  onClick?: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ date, variant, isNext, onClick }) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const dateString = date.toISOString().split('T')[0];
  const workout = trainingPlan[dateString];
  
  const getCardClasses = () => {
    let baseClasses = "bg-gray-800 border border-gray-600 rounded-xl p-4 text-center shadow-xl transition-all duration-500 ease-out flex flex-col justify-center relative";

    if (variant === 'adjacent') {
      baseClasses += " transform scale-85 opacity-60 cursor-pointer hover:opacity-90 hover:scale-95 hover:shadow-2xl h-64 overflow-hidden";
    } else {
      baseClasses += " border-2 border-blue-500 transform scale-100 opacity-100 min-h-80 animate-fade-in";
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
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 bg-black/30 rounded-xl backdrop-blur-sm">
          {onClick && (
            <div className="text-white transform hover:scale-110 transition-transform duration-200">
              {isNext ? (
                <ChevronRight size={32} className="mx-auto animate-pulse" />
              ) : (
                <ChevronLeft size={32} className="mx-auto animate-pulse" />
              )}
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
          {variant === 'center' && workout.details && (
            <>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:scale-105 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 mx-auto mb-3"
              >
                {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
              {showDetails && (
                <div
                  className="text-left text-sm leading-relaxed text-gray-300 mt-4 bg-gray-900/50 rounded-lg p-4 border border-gray-600 animate-slide-down"
                  dangerouslySetInnerHTML={formatDetails(workout.details)}
                />
              )}
            </>
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