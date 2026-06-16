import React, { useState, useEffect } from 'react';
import { Flag, MapPin, Trophy } from 'lucide-react';
import { Race } from '../data/races';
import { parseLocalDate } from '../lib/activity';

interface RaceCountdownProps {
  races: Race[];
}

// Accent color by how close the race is — used subtly (dot, digits, glow)
// rather than a loud full-card gradient.
function accentFor(daysLeft: number): { color: string; label: string } {
  if (daysLeft === 0) return { color: '#f87171', label: 'Race day' };
  if (daysLeft <= 7) return { color: '#fb923c', label: 'Final week' };
  if (daysLeft <= 30) return { color: '#fbbf24', label: 'Closing in' };
  if (daysLeft <= 90) return { color: '#22d3ee', label: 'On the horizon' };
  return { color: '#34d399', label: 'Upcoming' };
}

const Unit: React.FC<{ value: number; label: string; color: string; pad?: boolean }> = ({ value, label, color, pad = true }) => (
  <div className="flex-1 glass-soft rounded-lg py-2.5 px-1 text-center border border-white/10">
    <div className="text-2xl sm:text-3xl font-bold tabular-nums leading-none" style={{ color }}>
      {pad ? String(value).padStart(2, '0') : value}
    </div>
    <div className="text-[10px] uppercase tracking-[0.15em] text-gray-400 mt-1.5">{label}</div>
  </div>
);

const RaceCountdown: React.FC<RaceCountdownProps> = ({ races }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextRace = [...races]
    .sort((a, b) => a.date.localeCompare(b.date))
    .find((event) => {
      const eventDate = parseLocalDate(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });

  useEffect(() => {
    if (!nextRace) return;
    const update = () => {
      const now = new Date();
      const raceDate = parseLocalDate(nextRace.date);
      raceDate.setHours(23, 59, 59, 999);
      const diff = raceDate.getTime() - now.getTime();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      } else {
        setTimeLeft(null);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextRace]);

  if (!nextRace || !timeLeft) {
    return (
      <div className="glass-card rounded-xl p-5 border border-white/10 flex items-center gap-3">
        <Trophy size={22} className="text-emerald-400" />
        <div>
          <div className="text-white font-semibold text-sm">No upcoming races</div>
          <div className="text-gray-400 text-xs">Add one below to start a countdown 🎯</div>
        </div>
      </div>
    );
  }

  const accent = accentFor(timeLeft.days);
  const meta = [
    parseLocalDate(nextRace.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    nextRace.type,
    nextRace.distance,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className="glass-card rounded-xl p-5 border border-white/10 animate-fade-in"
      style={{ boxShadow: `0 10px 36px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 55px -22px ${accent.color}` }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gray-400">
            <span className="w-2 h-2 rounded-full" style={{ background: accent.color, boxShadow: `0 0 8px ${accent.color}` }} />
            {accent.label}
          </div>
          <h3 className="text-xl font-bold text-white mt-1.5 leading-tight truncate">{nextRace.name}</h3>
          {meta && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
              {nextRace.location ? <MapPin size={12} /> : <Flag size={12} />}
              <span className="truncate">{nextRace.location ? `${nextRace.location} · ${meta}` : meta}</span>
            </div>
          )}
        </div>
        <Flag size={26} className="shrink-0" style={{ color: accent.color }} />
      </div>

      <div className="flex gap-2">
        <Unit value={timeLeft.days} label="Days" color={accent.color} pad={false} />
        <Unit value={timeLeft.hours} label="Hrs" color={accent.color} />
        <Unit value={timeLeft.minutes} label="Min" color={accent.color} />
        <Unit value={timeLeft.seconds} label="Sec" color={accent.color} />
      </div>
    </div>
  );
};

export default RaceCountdown;
