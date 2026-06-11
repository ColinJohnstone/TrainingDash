import React, { useEffect, useState } from 'react';
import { X, Clock, TrendingUp, Heart, Zap, MapPin, Award, ExternalLink, Gauge } from 'lucide-react';
import { ActivitySummary, ActivityDetail, fetchActivityDetail } from '../data/strava';
import {
  sportIcon,
  sportColor,
  formatDistance,
  formatDuration,
  formatPace,
  formatPaceValue,
  formatDate,
  formatTime,
} from '../lib/activity';
import RouteMap from './RouteMap';

interface Props {
  activity: ActivitySummary;
  onClose: () => void;
}

const Metric: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-gray-900/50 rounded-lg p-3 border border-white/10">
    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
      {icon}
      {label}
    </div>
    <div className="text-lg font-bold text-white">{value}</div>
  </div>
);

const ActivityDetailModal: React.FC<Props> = ({ activity, onClose }) => {
  const [detail, setDetail] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const color = sportColor(activity.sport);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchActivityDetail(activity.id)
      .then((d) => alive && setDetail(d))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [activity.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const polyline = detail?.polyline ?? activity.polyline;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="glass-card rounded-xl shadow-2xl border border-white/10 w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-3xl">{sportIcon(activity.sport)}</span>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white leading-tight truncate">{activity.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-400 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${color.badge}`}>{activity.sport}</span>
                <span>{formatDate(activity.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span>· {formatTime(activity.date)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white shrink-0 p-1" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Core metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric icon={<MapPin size={12} />} label="Distance" value={formatDistance(activity)} />
            <Metric icon={<Clock size={12} />} label="Time" value={formatDuration(activity.movingTimeSec)} />
            <Metric icon={<Gauge size={12} />} label={activity.sport === 'Ride' || activity.sport === 'Row' ? 'Avg speed' : 'Pace'} value={formatPace(activity)} />
            <Metric icon={<TrendingUp size={12} />} label="Elevation" value={`${activity.elevationFt.toLocaleString()} ft`} />
            {activity.avgHeartrate != null && (
              <Metric icon={<Heart size={12} />} label="Avg HR" value={`${activity.avgHeartrate} bpm`} />
            )}
            {activity.maxHeartrate != null && (
              <Metric icon={<Heart size={12} />} label="Max HR" value={`${activity.maxHeartrate} bpm`} />
            )}
            {activity.avgWatts != null && (
              <Metric icon={<Zap size={12} />} label="Avg power" value={`${activity.avgWatts} W`} />
            )}
            {detail?.calories != null && (
              <Metric icon={<Zap size={12} />} label="Calories" value={`${Math.round(detail.calories).toLocaleString()}`} />
            )}
            {activity.avgCadence != null && (
              <Metric icon={<Gauge size={12} />} label="Cadence" value={`${activity.avgCadence}`} />
            )}
            {detail?.prCount != null && detail.prCount > 0 && (
              <Metric icon={<Award size={12} />} label="PRs" value={`${detail.prCount}`} />
            )}
          </div>

          {/* Route */}
          {polyline ? (
            <RouteMap polyline={polyline} color={color.hex} />
          ) : !loading ? (
            <div className="flex items-center justify-center gap-2 h-20 rounded-lg bg-gray-900/40 border border-dashed border-white/10 text-xs text-gray-500">
              <MapPin size={14} />
              No GPS route recorded (indoor / treadmill activity)
            </div>
          ) : null}

          {/* Description */}
          {detail?.description && (
            <p className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-900/40 rounded-lg p-3 border border-white/10">
              {detail.description}
            </p>
          )}

          {/* Splits */}
          {loading ? (
            <div className="flex items-center justify-center py-4 text-sm text-gray-400 gap-2">
              <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
              Loading splits…
            </div>
          ) : detail && detail.splits.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Splits (per mile)</h3>
              <div className="space-y-1">
                {detail.splits.map((s) => {
                  const maxPace = Math.max(...detail.splits.map((x) => x.paceSecPerMi));
                  const pct = maxPace ? (s.paceSecPerMi / maxPace) * 100 : 0;
                  return (
                    <div key={s.index} className="flex items-center gap-3 text-sm">
                      <span className="w-6 text-gray-500 text-xs">{s.index}</span>
                      <div className="flex-1 bg-gray-900/40 rounded h-6 relative overflow-hidden border border-white/10">
                        <div className="absolute inset-y-0 left-0 bg-orange-500/30" style={{ width: `${pct}%` }} />
                        <div className="absolute inset-0 flex items-center justify-between px-2">
                          <span className="text-white font-medium">{formatPaceValue(s.paceSecPerMi)}/mi</span>
                          {s.avgHeartrate != null && <span className="text-xs text-gray-400">{s.avgHeartrate} bpm</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-500">
              {[detail?.gear, detail?.deviceName, activity.location].filter(Boolean).join(' · ')}
            </span>
            <a
              href={`https://www.strava.com/activities/${activity.id}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-orange-300 hover:text-orange-200 text-sm font-medium"
            >
              <ExternalLink size={14} />
              Strava
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailModal;
