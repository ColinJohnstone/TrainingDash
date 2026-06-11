import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Home from './components/Home';
import TrainingPlanPage from './components/TrainingPlanPage';
import ActivitiesPage from './components/ActivitiesPage';
import StatsPage from './components/StatsPage';

type Page = 'home' | 'plan' | 'activities' | 'stats';

const NAV: { id: Page; label: string }[] = [
  { id: 'home', label: '🏠 Home' },
  { id: 'activities', label: '📊 Activities' },
  { id: 'stats', label: '📈 Stats' },
  { id: 'plan', label: '📋 Training Plan' },
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen text-gray-100 overflow-x-hidden">
      {/* Atmospheric performance background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="orb animate-float-a w-[42rem] h-[42rem] -top-40 -left-32" style={{ background: 'radial-gradient(circle, #0ea5e9, transparent 70%)' }} />
        <div className="orb animate-float-b w-[38rem] h-[38rem] top-1/3 -right-40" style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="orb animate-float-c w-[32rem] h-[32rem] bottom-0 left-1/4" style={{ background: 'radial-gradient(circle, #f97316, transparent 70%)' }} />
      </div>

      {/* Navigation Menu */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="glass-soft hover:bg-white/15 hover:scale-110 text-white p-3 rounded-xl shadow-xl border border-white/15 transition-all duration-300 hover:shadow-2xl"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in" onClick={() => setMenuOpen(false)}>
          <div
            className="fixed left-0 top-0 h-full w-64 bg-[#0a0e18]/85 backdrop-blur-2xl shadow-2xl border-r border-white/10 p-6 transform transition-all duration-300 animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6 mt-16">Menu</h2>
            <nav className="space-y-2">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-cyan-500/20'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="p-4 pt-20 md:pt-4">
        {currentPage === 'home' && <Home />}
        {currentPage === 'plan' && <TrainingPlanPage />}
        {currentPage === 'activities' && <ActivitiesPage />}
        {currentPage === 'stats' && <StatsPage />}
      </div>
    </div>
  );
}

export default App;
