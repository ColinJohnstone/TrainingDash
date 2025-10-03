import React, { useState } from 'react';
import { Calendar, Menu, X } from 'lucide-react';
import Header from './components/Header';
import RaceCountdown from './components/RaceCountdown';
import StatsContainer from './components/StatsContainer';
import DailyView from './components/DailyView';
import FullPlan from './components/FullPlan';
import StravaPage from './components/StravaPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'training' | 'strava'>('training');
  const [menuOpen, setMenuOpen] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100">
      {/* Navigation Menu */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-xl border border-gray-600 transition-all duration-200"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMenuOpen(false)}>
          <div
            className="fixed left-0 top-0 h-full w-64 bg-gray-800 shadow-2xl border-r border-gray-700 p-6 transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6 mt-16">Menu</h2>
            <nav className="space-y-2">
              <button
                onClick={() => {
                  setCurrentPage('training');
                  setMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentPage === 'training'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🏃 Training Plan
              </button>
              <button
                onClick={() => {
                  setCurrentPage('strava');
                  setMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentPage === 'strava'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                📊 Strava Metrics
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="p-4">
        {currentPage === 'training' ? (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              <div>
                <RaceCountdown currentDate={currentDate} />
              </div>
              <div>
                <Header />
              </div>
            </div>

            <div className="mb-8">
              <StatsContainer currentDate={currentDate} />
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
        ) : (
          <StravaPage />
        )}
      </div>
    </div>
  );
}

export default App;