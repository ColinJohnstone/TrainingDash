import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Wind, Thermometer } from 'lucide-react';

interface WeatherHour {
  time: string;
  temp: number;
  condition: string;
  windSpeed: number;
  icon: React.ReactNode;
}

const WeatherForecast: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherHour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for Aurora, Ontario weather
    const fetchWeather = () => {
      const now = new Date();
      const mockData: WeatherHour[] = [];
      
      for (let i = 0; i < 6; i++) {
        const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
        const temp = Math.round(18 + Math.random() * 12); // 18-30°C range for Aurora
        const conditions = ['sunny', 'partly-cloudy', 'cloudy', 'light-rain'];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        
        let icon;
        switch (condition) {
          case 'sunny':
            icon = <Sun size={20} className="text-yellow-400" />;
            break;
          case 'partly-cloudy':
            icon = <Cloud size={20} className="text-gray-300" />;
            break;
          case 'cloudy':
            icon = <Cloud size={20} className="text-gray-400" />;
            break;
          case 'light-rain':
            icon = <CloudRain size={20} className="text-blue-400" />;
            break;
          default:
            icon = <Sun size={20} className="text-yellow-400" />;
        }
        
        mockData.push({
          time: hour.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          temp,
          condition,
          windSpeed: Math.round(5 + Math.random() * 15), // 5-20 mph
          icon
        });
      }
      
      setWeatherData(mockData);
      setLoading(false);
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // Refresh every 30 minutes

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600 mb-4">
        <div className="flex items-center justify-center">
          <Thermometer size={16} className="text-blue-400 animate-pulse mr-2" />
          <span className="text-sm text-gray-300">Loading Aurora, ON weather...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600 mb-4">
      <div className="grid grid-cols-6 gap-2 text-center">
        {weatherData.map((hour, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="text-xs text-gray-400 mb-1">{hour.time}</div>
            <div className="mb-1">{hour.icon}</div>
            <div className="text-sm font-semibold text-white">{hour.temp}°C</div>
            <div className="text-xs text-gray-400 flex items-center">
              <Wind size={10} className="mr-1" />
              {hour.windSpeed}
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-400 text-center mt-2">
        Aurora, ON • Perfect training weather ahead! 🏃‍♂️
      </div>
    </div>
  );
};

export default WeatherForecast;