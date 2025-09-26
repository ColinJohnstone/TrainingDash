import React, { useState, useEffect } from 'react';
import { trainingPlan } from '../data/trainingPlan';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';

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
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
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

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekNum)) {
        newSet.delete(weekNum);
      } else {
        newSet.add(weekNum);
      }
      return newSet;
    });
  };

  const formatDateRange = (workouts: typeof weeks[0]) => {
    if (!workouts.length) return '';
    const startDate = new Date(workouts[0].date + 'T12:00:00Z');
    const endDate = new Date(workouts[workouts.length - 1].date + 'T12:00:00Z');
    
    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `${startStr} – ${endStr}`;
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Calendar size={24} className="text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Complete Training Plan</h2>
      </div>
      <div className="text-center text-gray-400 mb-6 text-sm">
        52-week journey from Sprint Triathlon to Ironman 70.3
      </div>
      <div>
        {Object.entries(weeks)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([weekNum, workouts]) => {
            const weekNumber = parseInt(weekNum);
            const isExpanded = expandedWeeks.has(weekNumber);
            
            return (
              <div key={weekNum} className="border-b border-gray-700 last:border-b-0">
                <div 
                  className="p-4 cursor-pointer flex justify-between items-center font-semibold text-white hover:bg-gray-700/50 transition-all duration-200 rounded-lg mx-1"
                  onClick={() => toggleWeek(weekNumber)}
                >
                  <span>Week {weekNum} ({formatDateRange(workouts)})</span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                
                {isExpanded && (
                  <div className="px-4 pb-4 bg-gray-900/30 rounded-lg mx-1 mb-2">
                    {workouts.map(workout => (
                      <div key={workout.date} className={`flex py-3 border-t border-gray-700 first:border-t-0 ${workout.type === 'race' ? 'bg-yellow-900/20 rounded px-2 my-1' : ''}`}>
                        <div className="font-semibold w-20 text-gray-300 text-sm flex-shrink-0">
                          {workout.day.slice(0, 3)}
                        </div>
                        <div className={`flex-1 text-sm ${workout.type === 'race' ? 'text-yellow-200 font-semibold' : 'text-gray-300'}`}>
                          {workout.activity}
                          {workout.type === 'race' && (
                            <span className="ml-2 text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded-full">
                              RACE
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default FullPlan;