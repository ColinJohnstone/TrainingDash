import React from 'react';
import { trainingPlan, totalWeeksInPlan, raceEvents } from '../data/trainingPlan';
import { Trophy, Target, Calendar } from 'lucide-react';

interface StatsContainerProps {
  currentDate: Date;
}

const StatsContainer: React.FC<StatsContainerProps> = ({ currentDate }) => {
  const dateString = currentDate.toISOString().split('T')[0];
  const workout = trainingPlan[dateString];
  const currentWeek = workout?.week || 1;
  const percentage = Math.round((currentWeek / totalWeeksInPlan) * 100);

  // Find next race
  const today = new Date(currentDate.setHours(0, 0, 0, 0));
  const nextRace = raceEvents.find(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  let countdownText = "Congratulations on completing your goals!";
  if (nextRace) {
    const raceDate = new Date(nextRace.date);
    raceDate.setHours(0, 0, 0, 0);
    const diffTime = raceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      countdownText = `It's Race Day for the ${nextRace.name}!`;
    } else {
      countdownText = `${diffDays} Day${diffDays > 1 ? 's' : ''} until the ${nextRace.name}`;
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 mb-8 shadow-xl border border-gray-700">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-blue-400" />
            <span className="font-medium">Week {currentWeek} of {totalWeeksInPlan}</span>
          </div>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-2 text-center">
          Overall Training Progress
        </div>
      </div>
      
      <div className="text-center bg-gray-900/50 rounded-lg p-4 border border-gray-600">
        <div className="flex items-center justify-center gap-2 mb-2">
          {nextRace ? (
            <Trophy size={20} className="text-yellow-400" />
          ) : (
            <Calendar size={20} className="text-green-400" />
          )}
        </div>
        <div className="text-lg font-bold text-white leading-tight">
          {countdownText}
        </div>
      </div>
    </div>
  );
};

export default StatsContainer;