import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import StatsContainer from './StatsContainer';
import DailyView from './DailyView';
import FullPlan from './FullPlan';

// The original pre-made training plan, kept accessible as a secondary view now
// that day-to-day training comes from Garmin Coach.
const TrainingPlanPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const changeDay = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">📋 Training Plan</h1>

      <div className="mb-8">
        <StatsContainer currentDate={currentDate} />
      </div>

      <DailyView currentDate={currentDate} onChangeDay={changeDay} />
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setCurrentDate(new Date())}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-2xl border border-blue-500 hover:border-blue-400"
        >
          <Calendar size={18} />
          Go to Today
        </button>
      </div>
      <FullPlan onDateSelect={handleDateSelect} />
    </div>
  );
};

export default TrainingPlanPage;
