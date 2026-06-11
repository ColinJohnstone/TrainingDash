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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100">
      {/* Navigation Menu */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="bg-gray-800 hover:bg-gray-700 hover:scale-110 text-white p-3 rounded-lg shadow-xl border border-gray-600 transition-all duration-300 hover:shadow-2xl"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={() => setMenuOpen(false)}>
          <div
            className="fixed left-0 top-0 h-full w-64 bg-gray-800 shadow-2xl border-r border-gray-700 p-6 transform transition-all duration-300 animate-slide-in-left"
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
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
