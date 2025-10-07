import React from 'react';
import { trainingPlan, totalWeeksInPlan, raceEvents } from '../data/trainingPlan';
import { Trophy, Target, Calendar, Activity } from 'lucide-react';

interface StatsContainerProps {
  currentDate: Date;
}

const StatsContainer: React.FC<StatsContainerProps> = ({ currentDate }) => {
  const dateString = currentDate.toISOString().split('T')[0];
  const workout = trainingPlan[dateString];
  const currentWeek = workout?.week || 1;
  const percentage = Math.round((currentWeek / totalWeeksInPlan) * 100);

  // Calculate total distances up to (but not including) today
  const calculateTotals = () => {
    let totalSwim = 0;
    let totalCycle = 0;
    let totalRun = 0;

    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    Object.entries(trainingPlan).forEach(([date, workout]) => {
      const workoutDate = new Date(date);
      workoutDate.setHours(0, 0, 0, 0);

      // Only count workouts before today
      if (workoutDate < today) {
        const activity = workout.activity.toLowerCase();

        // Extract distance using regex
        const distanceMatch = activity.match(/(\d+(?:\.\d+)?)\s*(?:miles?|mi)/i);
        const yardsMatch = activity.match(/(\d+(?:\.\d+)?)\s*(?:yards?|yd)/i);

        if (distanceMatch) {
          const distance = parseFloat(distanceMatch[1]);

          // Check activity type
          if (activity.includes('swim') || activity.includes('🏊')) {
            // Swim distances are usually in yards, convert to miles if needed
            // (not adding miles from swim as they're typically in yards)
          } else if (activity.includes('cycle') || activity.includes('bike') || activity.includes('🚴')) {
            totalCycle += distance;
          } else if (activity.includes('run') || activity.includes('🏃')) {
            totalRun += distance;
          } else if (activity.includes('brick') || activity.includes('🔀')) {
            // For brick workouts, parse the details to get both distances
            const details = workout.details.toLowerCase();
            const cycleMatch = details.match(/cycle[^\d]*(\d+(?:\.\d+)?)\s*(?:miles?|mi)/i);
            const runMatch = details.match(/run[^\d]*(\d+(?:\.\d+)?)\s*(?:miles?|mi)/i);
            if (cycleMatch) totalCycle += parseFloat(cycleMatch[1]);
            if (runMatch) totalRun += parseFloat(runMatch[1]);
          }
        }

        // Handle swim yards
        if (yardsMatch && (activity.includes('swim') || activity.includes('🏊'))) {
          const yards = parseFloat(yardsMatch[1]);
          totalSwim += yards;
        }
      }
    });

    return { totalSwim, totalCycle, totalRun };
  };

  const { totalSwim, totalCycle, totalRun } = calculateTotals();

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
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700 h-full flex flex-col justify-center space-y-6">
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

      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Activity size={18} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-300">Plan Distance Completed</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">🏊 Swim</div>
            <div className="text-lg font-bold text-blue-400">{totalSwim.toLocaleString()}</div>
            <div className="text-xs text-gray-500">yards</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">🚴 Bike</div>
            <div className="text-lg font-bold text-green-400">{totalCycle.toFixed(1)}</div>
            <div className="text-xs text-gray-500">miles</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">🏃 Run</div>
            <div className="text-lg font-bold text-red-400">{totalRun.toFixed(1)}</div>
            <div className="text-xs text-gray-500">miles</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsContainer;