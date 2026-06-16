import React, { useMemo, useState } from 'react';
import { Sparkles, Shuffle } from 'lucide-react';
import { StravaStatsData } from '../data/strava';
import { buildFunFacts } from '../lib/funFacts';

interface Props {
  stats: StravaStatsData | null;
}

const FunFact: React.FC<Props> = ({ stats }) => {
  const facts = useMemo(() => (stats ? buildFunFacts(stats) : []), [stats]);
  // Random starting fact so it differs each visit.
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * 1000));

  if (facts.length === 0) return null;

  const fact = facts[idx % facts.length];
  const shuffle = () => setIdx((i) => (facts.length > 1 ? i + 1 + Math.floor(Math.random() * (facts.length - 1)) : i + 1));

  return (
    <div className="glass-card rounded-xl p-4 border border-white/10 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-cyan-500/30 to-indigo-500/30 border border-white/10">
        <Sparkles size={18} className="text-cyan-300" />
      </div>
      <p className="flex-1 text-sm text-gray-200 leading-snug">{fact}</p>
      <button
        onClick={shuffle}
        className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
        aria-label="Show another fun fact"
        title="Another fact"
      >
        <Shuffle size={16} />
      </button>
    </div>
  );
};

export default FunFact;
