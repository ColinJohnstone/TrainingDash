import React, { useState } from 'react';
import Header from './components/Header';
import StatsContainer from './components/StatsContainer';
import DailyView from './components/DailyView';
import Controls from './components/Controls';
import FullPlan from './components/FullPlan';

function App() {
  // Set default date to today's date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFullPlan, setShowFullPlan] = useState(false);

  const changeDay = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const togglePlan = () => {
    setShowFullPlan(!showFullPlan);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Header />
        <StatsContainer currentDate={currentDate} />
        <DailyView currentDate={currentDate} onChangeDay={changeDay} />
        <Controls 
          onGoToToday={goToToday} 
          onTogglePlan={togglePlan}
          showingPlan={showFullPlan}
        />
        <FullPlan isVisible={showFullPlan} />
      </div>
    </div>
  );
}

export default App;