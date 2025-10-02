import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import Header from './components/Header';
import RaceCountdown from './components/RaceCountdown';
import StatsContainer from './components/StatsContainer';
import DailyView from './components/DailyView';
import FullPlan from './components/FullPlan';
import StravaLastWorkout from './components/StravaLastWorkout';
import StravaStats from './components/StravaStats';

function App() {
  // Set default date to today's date
  const [currentDate, setCurrentDate] = useState(new Date());

  const changeDay = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div>
            <RaceCountdown currentDate={currentDate} />
          </div>
          <div>
            <Header />
          </div>
          <div>
            <StatsContainer currentDate={currentDate} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div>
            <StravaLastWorkout />
          </div>
          <div>
            <StravaStats />
          </div>
        </div>
        
        <DailyView currentDate={currentDate} onChangeDay={changeDay} />
        <div className="flex justify-center mb-8">
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl border border-blue-500 hover:border-blue-400"
          >
            <Calendar size={18} />
            Go to Today
          </button>
        </div>
        <FullPlan onDateSelect={handleDateSelect} />
      </div>
    </div>
  );
}

export default App;