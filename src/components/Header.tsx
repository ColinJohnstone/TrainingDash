import React from 'react';
import { Activity } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 flex justify-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Activity size={32} className="text-blue-400" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Colin's Training Dashboard
        </h1>
      </div>
      <p className="text-gray-400 text-lg font-medium">Sprint Tri → Marathon → Ironman 70.3</p>
      <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-400 mx-auto mt-3 rounded-full"></div>
    </header>
  );
};

export default Header;