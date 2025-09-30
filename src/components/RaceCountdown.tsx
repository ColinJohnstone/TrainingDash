import React, { useState, useEffect } from 'react';
import { raceEvents } from '../data/trainingPlan';

interface RaceCountdownProps {
  currentDate: Date;
}

const RaceCountdown: React.FC<RaceCountdownProps> = ({ currentDate }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Find next race
  const today = new Date(currentDate.setHours(0, 0, 0, 0));
  const nextRace = raceEvents.find(event => {
    const eventDate = new Date(event.date + 'T12:00:00Z');
    return eventDate >= today;
  });

  useEffect(() => {
    if (!nextRace) return;

    const updateCountdown = () => {
      const now = new Date();
      const raceDate = new Date(nextRace.date + 'T12:00:00Z');
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
    if (daysLeft === 0) return '🔥'; // Race day!
    if (daysLeft <= 3) return '😰'; // Very nervous/stressed
    if (daysLeft <= 7) return '😬'; // Getting nervous
    if (daysLeft <= 14) return '😅'; // Starting to feel it
    if (daysLeft <= 30) return '🤔'; // Thinking about it
    if (daysLeft <= 60) return '😊'; // Confident
    if (daysLeft <= 90) return '😌'; // Relaxed
    return '😎'; // Very chill, race is far away
  };

  const getBackgroundColor = (daysLeft: number) => {
    if (daysLeft === 0) return 'from-red-600 to-orange-600'; // Race day!
    if (daysLeft <= 3) return 'from-red-500 to-red-600'; // Very close
    if (daysLeft <= 7) return 'from-orange-500 to-red-500'; // Close
    if (daysLeft <= 14) return 'from-yellow-500 to-orange-500'; // Getting close
    if (daysLeft <= 30) return 'from-blue-500 to-purple-500'; // Month away
    return 'from-green-500 to-blue-500'; // Far away
  };

  const getTextColor = (daysLeft: number) => {
    if (daysLeft <= 14) return 'text-white';
    return 'text-white';
  };

  if (!nextRace || !timeLeft) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-4 shadow-lg border border-green-400">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <div className="text-white font-bold text-sm">All Races Complete!</div>
            <div className="text-green-100 text-xs">Congratulations! 🎉</div>
          </div>
        </div>
      </div>
    );
  }

  const daysLeft = timeLeft.days;
  const emoji = getEmoji(daysLeft);
  const bgColor = getBackgroundColor(daysLeft);
  const textColor = getTextColor(daysLeft);

  return (
    <div className={`bg-gradient-to-r ${bgColor} rounded-lg p-4 shadow-lg border border-opacity-30 border-white`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl animate-pulse">{emoji}</span>
        <div>
          <div className={`${textColor} font-bold text-sm leading-tight`}>
            {nextRace.name}
          </div>
          <div className={`${textColor} opacity-90 text-xs mb-1`}>
            {daysLeft === 0 ? 'TODAY!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} to go`}
          </div>
          {daysLeft > 0 && (
            <div className={`${textColor} opacity-80 text-xs font-mono`}>
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