import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer } from 'lucide-react';

interface WeatherData {
  time: string;
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
}

const WeatherForecast: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate weather API call with mock data
    const fetchWeather = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock weather data for next 6 hours
        const now = new Date();
        const mockData: WeatherData[] = [];
        
        const conditions = ['sunny', 'cloudy', 'rainy', 'windy'];
        const baseTemp = 18 + Math.random() * 12; // 18-30°C base for Aurora, Ontario
        
        for (let i = 0; i < 6; i++) {
          const time = new Date(now.getTime() + i * 60 * 60 * 1000);
          mockData.push({
            time: time.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              hour12: true 
            }),
            temperature: Math.round(baseTemp + (Math.random() - 0.5) * 8),
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            windSpeed: Math.round(5 + Math.random() * 15),
            humidity: Math.round(40 + Math.random() * 40)
          });
        }
        
        setWeatherData(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to load weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun size={16} className="text-yellow-400" />;
      case 'cloudy':
        return <Cloud size={16} className="text-gray-400" />;
      case 'rainy':
        return <CloudRain size={16} className="text-blue-400" />;
      case 'snowy':
        return <CloudSnow size={16} className="text-blue-200" />;
      case 'windy':
        return <Wind size={16} className="text-gray-300" />;
      default:
        return <Sun size={16} className="text-yellow-400" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return 'text-yellow-400';
      case 'cloudy':
        return 'text-gray-400';
      case 'rainy':
        return 'text-blue-400';
      case 'snowy':
        return 'text-blue-200';
      case 'windy':
        return 'text-gray-300';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
        <span className="text-sm">Loading weather...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-gray-500 text-sm text-center">
        <Thermometer size={16} className="inline mr-1" />
        Weather unavailable
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
      <div className="flex items-center justify-center gap-1 mb-2">
        <Thermometer size={14} className="text-blue-400" />
        <span className="text-xs font-medium text-gray-300">6-Hour Forecast</span>
      </div>
      
      <div className="grid grid-cols-6 gap-2">
        {weatherData.map((hour, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-gray-400 mb-1">{hour.time}</div>
            <div className="flex justify-center mb-1">
              {getWeatherIcon(hour.condition)}
            </div>
            <div className="text-sm font-semibold text-white mb-1">
              {hour.temperature}°C
            </div>
            <div className="text-xs text-gray-500">
              {hour.windSpeed}mph
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 text-center mt-2">
        Aurora, ON - Perfect training weather ahead! 🏃‍♂️
      </div>
    </div>
  );
};

export default WeatherForecast;