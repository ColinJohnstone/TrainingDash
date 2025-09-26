import React from 'react';
import { Calendar, List } from 'lucide-react';

interface ControlsProps {
  onGoToToday: () => void;
  onTogglePlan: () => void;
  showingPlan: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onGoToToday, onTogglePlan, showingPlan }) => {
  return (
    <div className="flex justify-center gap-4 mb-8">
      <button 
        onClick={onGoToToday}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl border border-blue-500 hover:border-blue-400"
      >
        <Calendar size={18} />
        Go to Today
      </button>
      <button 
        onClick={onTogglePlan}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-600 hover:border-gray-500"
      >
        <List size={18} />
        {showingPlan ? 'Hide Full Plan' : 'Show Full Plan'}
      </button>
    </div>
  );
};

export default Controls;