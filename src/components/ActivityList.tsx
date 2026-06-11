import React from 'react';
import { Clock, TrendingUp, Heart, MapPin } from 'lucide-react';
import { ActivitySummary } from '../data/strava';
import { sportIcon, sportColor, formatDistance, formatDuration, formatPace, formatDate } from '../lib/activity';

interface Props {
  activities: ActivitySummary[];
  onSelect: (a: ActivitySummary) => void;
}

const ActivityList: React.FC<Props> = ({ activities, onSelect }) => {
  if (activities.length === 0) {
    return <p className="text-sm text-gray-500 italic text-center py-8">No activities match this filter.</p>;
  }

  return (
    <div className="space-y-2">
      {activities.map((a) => {
        const color = sportColor(a.sport);
        return (
          <button
            key={a.id}
            onClick={() => onSelect(a)}
            className="w-full text-left bg-gray-900/40 hover:bg-gray-900/70 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all duration-150 flex items-center gap-4"
          >
            <span className="text-2xl shrink-0">{sportIcon(a.sport)}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white truncate">{a.name}</h4>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 ${color.badge}`}>{a.sport}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                <span>{formatDate(a.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                {a.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {a.location}
                  </span>
                )}
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-5 text-sm shrink-0">
              <div className="text-right">
                <div className="font-bold text-white">{formatDistance(a)}</div>
                <div className="text-xs text-gray-500">distance</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-200 flex items-center gap-1 justify-end">
                  <Clock size={12} className="text-gray-500" />
                  {formatDuration(a.movingTimeSec)}
                </div>
                <div className="text-xs text-gray-500">{formatPace(a)}</div>
              </div>
              <div className="text-right w-16">
                {a.avgHeartrate != null ? (
                  <div className="font-medium text-gray-200 flex items-center gap-1 justify-end">
                    <Heart size={12} className="text-red-400/70" />
                    {a.avgHeartrate}
                  </div>
                ) : (
                  <div className="font-medium text-gray-200 flex items-center gap-1 justify-end">
                    <TrendingUp size={12} className="text-gray-500" />
                    {a.elevationFt}'
                  </div>
                )}
                <div className="text-xs text-gray-500">{a.avgHeartrate != null ? 'avg hr' : 'elev'}</div>
              </div>
            </div>
            {/* Compact metrics on mobile */}
            <div className="sm:hidden text-right shrink-0">
              <div className="font-bold text-white text-sm">{formatDistance(a)}</div>
              <div className="text-xs text-gray-500">{formatDuration(a.movingTimeSec)}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ActivityList;
