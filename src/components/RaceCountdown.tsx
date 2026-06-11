import React, { useState, useEffect } from 'react';
import { Race } from '../data/races';

interface RaceCountdownProps {
  races: Race[];
}

const RaceCountdown: React.FC<RaceCountdownProps> = ({ races }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Find the next upcoming race (today or later), earliest first.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextRace = [...races]
    .sort((a, b) => a.date.localeCompare(b.date))
    .find((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });

  useEffect(() => {
    if (!nextRace) return;

    const updateCountdown = () => {
      const now = new Date();
      const raceDate = new Date(nextRace.date);
      raceDate.setHours(23, 59, 59, 999); // End of race day
      const difference = raceDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextRace]);

  const getEmoji = (daysLeft: number) => {
    if (daysLeft === 0) return '🔥';
    if (daysLeft <= 3) return '😰';
    if (daysLeft <= 7) return '😬';
    if (daysLeft <= 14) return '😅';
    if (daysLeft <= 30) return '🤔';
    if (daysLeft <= 60) return '😊';
    if (daysLeft <= 90) return '😌';
    return '😎';
  };

  const getBackgroundColor = (daysLeft: number) => {
    if (daysLeft === 0) return 'from-red-600 to-orange-600';
    if (daysLeft <= 3) return 'from-red-500 to-red-600';
    if (daysLeft <= 7) return 'from-orange-500 to-red-500';
    if (daysLeft <= 14) return 'from-yellow-500 to-orange-500';
    if (daysLeft <= 30) return 'from-blue-500 to-purple-500';
    return 'from-green-500 to-blue-500';
  };

  if (!nextRace || !timeLeft) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-4 shadow-lg border border-green-400">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <div className="text-white font-bold text-sm">No upcoming races</div>
            <div className="text-green-100 text-xs">Add one below to start a countdown! 🎯</div>
          </div>
        </div>
      </div>
    );
  }

  const daysLeft = timeLeft.days;
  const emoji = getEmoji(daysLeft);
  const bgColor = getBackgroundColor(daysLeft);

  return (
    <div className={`bg-gradient-to-r ${bgColor} rounded-lg p-4 shadow-lg border border-opacity-30 border-white transform hover:scale-105 transition-all duration-300 animate-fade-in`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl animate-bounce">{emoji}</span>
        <div>
          <div className="text-white font-bold text-sm leading-tight">{nextRace.name}</div>
          <div className="text-white opacity-90 text-xs mb-1">
            {daysLeft === 0 ? 'TODAY!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} to go`}
          </div>
          {daysLeft > 0 && (
            <div className="text-white opacity-80 text-xs font-mono">
              {timeLeft.days > 0 && `${timeLeft.days}d `}
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RaceCountdown;
