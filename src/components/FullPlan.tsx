import React, { useState, useEffect } from 'react';
import { trainingPlan } from '../data/trainingPlan';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekData {
  [key: number]: Array<{
    date: string;
    week: number;
    day: string;
    activity: string;
    details: string;
    type?: 'race';
  }>;
}

interface FullPlanProps {
  isVisible: boolean;
}

const FullPlan: React.FC<FullPlanProps> = ({ isVisible }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [weeks, setWeeks] = useState<WeekData>({});

  useEffect(() => {
    const weekData: WeekData = {};
    
    Object.entries(trainingPlan).forEach(([dateString, workout]) => {
      if (!weekData[workout.week]) {
        weekData[workout.week] = [];
      }
      weekData[workout.week].push({
        date: dateString,
        ...workout
      });
    });

    // Sort workouts within each week by date
    Object.keys(weekData).forEach(weekNum => {
      weekData[parseInt(weekNum)].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    setWeeks(weekData);
  }, []);

  const getWorkoutIcon = (activity: string) => {
    const activityLower = activity.toLowerCase();
    if (activityLower.includes('swim') || activityLower.includes('🏊')) return '🏊‍♂️';
    if (activityLower.includes('cycle') || activityLower.includes('bike') || activityLower.includes('🚴')) return '🚴‍♂️';
    if (activityLower.includes('run') || activityLower.includes('🏃')) return '🏃‍♂️';
    if (activityLower.includes('brick') || activityLower.includes('🔀')) return '🔀';
    if (activityLower.includes('rest') || activityLower.includes('✨')) return '✨';
    if (activityLower.includes('race') || activityLower.includes('🏁')) return '🏆';
    if (activityLower.includes('walk') || activityLower.includes('🚶')) return '🚶‍♂️';
    if (activityLower.includes('travel') || activityLower.includes('✈️')) return '✈️';
    if (activityLower.includes('prep') || activityLower.includes('📋')) return '📋';
    return '💪';
  };

  const getWorkoutColor = (activity: string) => {
    const activityLower = activity.toLowerCase();
    if (activityLower.includes('swim') || activityLower.includes('🏊')) return 'bg-blue-500/20 border-blue-400 text-blue-200';
    if (activityLower.includes('cycle') || activityLower.includes('bike') || activityLower.includes('🚴')) return 'bg-green-500/20 border-green-400 text-green-200';
    if (activityLower.includes('run') || activityLower.includes('🏃')) return 'bg-red-500/20 border-red-400 text-red-200';
    if (activityLower.includes('brick') || activityLower.includes('🔀')) return 'bg-purple-500/20 border-purple-400 text-purple-200';
    if (activityLower.includes('rest') || activityLower.includes('✨')) return 'bg-gray-500/20 border-gray-400 text-gray-300';
    if (activityLower.includes('race') || activityLower.includes('🏁')) return 'bg-yellow-500/30 border-yellow-400 text-yellow-200';
    if (activityLower.includes('walk') || activityLower.includes('🚶')) return 'bg-teal-500/20 border-teal-400 text-teal-200';
    return 'bg-indigo-500/20 border-indigo-400 text-indigo-200';
  };

  const extractDistance = (activity: string) => {
    // Extract distance/time from activity string
    const matches = activity.match(/(\d+(?:\.\d+)?)\s*(miles?|mi|yards?|yd|m|km|min|hours?|hr)/i);
    if (matches) {
      return matches[0];
    }
    
    // Look for time patterns like "15-18 miles"
    const rangeMatch = activity.match(/(\d+(?:\.\d+)?-\d+(?:\.\d+)?)\s*(miles?|mi|yards?|yd|m|km|min|hours?|hr)/i);
    if (rangeMatch) {
      return rangeMatch[0];
    }
    
    return '';
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getWorkoutForDate = (date: Date | null) => {
    if (!date) return null;
    const dateString = date.toISOString().split('T')[0];
    return trainingPlan[dateString];
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  if (!isVisible) return null;

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Calendar size={24} className="text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Training Calendar</h2>
      </div>
      
      {/* Legend */}
      <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Sport Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500/20 border border-blue-400 rounded"></div>
            <span className="text-blue-200">🏊‍♂️ Swimming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/20 border border-green-400 rounded"></div>
            <span className="text-green-200">🚴‍♂️ Cycling</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/20 border border-red-400 rounded"></div>
            <span className="text-red-200">🏃‍♂️ Running</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500/20 border border-purple-400 rounded"></div>
            <span className="text-purple-200">🔀 Brick</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500/30 border border-yellow-400 rounded"></div>
            <span className="text-yellow-200">🏆 Race Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500/20 border border-gray-400 rounded"></div>
            <span className="text-gray-300">✨ Rest</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-500/20 border border-teal-400 rounded"></div>
            <span className="text-teal-200">🚶‍♂️ Recovery</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-500/20 border border-indigo-400 rounded"></div>
            <span className="text-indigo-200">💪 Other</span>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => navigateMonth(-1)}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 border border-gray-600"
        >
          <ChevronLeft size={20} className="text-gray-300" />
        </button>
        <h3 className="text-xl font-bold text-white">{monthName}</h3>
        <button 
          onClick={() => navigateMonth(1)}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 border border-gray-600"
        >
          <ChevronRight size={20} className="text-gray-300" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-semibold text-gray-400 border-b border-gray-600">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((date, index) => {
          const workout = getWorkoutForDate(date);
          const isToday = date && date.toDateString() === new Date().toDateString();
          
          return (
            <div 
              key={index} 
              className={`min-h-[80px] p-1 border border-gray-700 ${
                date ? 'bg-gray-800/50' : 'bg-gray-900/30'
              } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
            >
              {date && (
                <>
                  <div className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-400' : 'text-gray-300'}`}>
                    {date.getDate()}
                  </div>
                  {workout && (
                    <div className={`text-xs p-1 rounded border ${getWorkoutColor(workout.activity)} text-center leading-tight`}>
                      <div className="text-sm mb-1">{getWorkoutIcon(workout.activity)}</div>
                      <div className="font-medium">{extractDistance(workout.activity)}</div>
                      {workout.type === 'race' && (
                        <div className="text-xs font-bold mt-1">RACE</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-center">
        <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
          <div className="text-blue-400 text-2xl mb-1">🏊‍♂️</div>
          <div className="text-xs text-blue-200">Swimming</div>
        </div>
        <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-3">
          <div className="text-green-400 text-2xl mb-1">🚴‍♂️</div>
          <div className="text-xs text-green-200">Cycling</div>
        </div>
        <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3">
          <div className="text-red-400 text-2xl mb-1">🏃‍♂️</div>
          <div className="text-xs text-red-200">Running</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3">
          <div className="text-yellow-400 text-2xl mb-1">🏆</div>
          <div className="text-xs text-yellow-200">Race Days</div>
        </div>
      </div>
    </div>
  );
};

export default FullPlan;