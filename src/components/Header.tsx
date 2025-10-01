import React from 'react';
import { Activity } from 'lucide-react';
import WeatherForecast from './WeatherForecast';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 flex justify-center">
      <div>
        <div className="flex items-center justify-center gap-3 mb-2">
          <Activity size={32} className="text-blue-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Colin's Training Dashboard
          </h1>
        </div>
        <WeatherForecast />
      </div>
    </header>
  );
};

export default Header;