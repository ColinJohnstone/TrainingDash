import React, { useState } from 'react';
import { Plus, Trash2, Pencil, MapPin, Calendar, AlertCircle, X, Flag } from 'lucide-react';
import { Race, RaceInput, RaceError } from '../data/races';

interface Props {
  races: Race[];
  loading: boolean;
  error: RaceError | null;
  onAdd: (input: RaceInput) => Promise<void>;
  onEdit: (race: Race) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const RACE_TYPES = ['Triathlon', 'Run', 'Ride', 'Swim', 'Duathlon', 'Other'];

const EMPTY: RaceInput = { name: '', date: '', type: 'Triathlon', location: '', distance: '' };

const typeColor = (type?: string) => {
  switch ((type || '').toLowerCase()) {
    case 'run':
      return 'bg-red-500/20 text-red-300 border-red-400/40';
    case 'ride':
      return 'bg-green-500/20 text-green-300 border-green-400/40';
    case 'swim':
      return 'bg-blue-500/20 text-blue-300 border-blue-400/40';
    case 'triathlon':
    case 'duathlon':
      return 'bg-purple-500/20 text-purple-300 border-purple-400/40';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-400/40';
  }
};

const daysBetween = (dateStr: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const RacesManager: React.FC<Props> = ({ races, loading, error, onAdd, onEdit, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<RaceInput>(EMPTY);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sorted = [...races].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((r) => new Date(r.date) >= today);
  const past = sorted.filter((r) => new Date(r.date) < today).reverse();

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
  };

  const startAdd = () => {
    if (showForm && !editingId) {
      closeForm();
      return;
    }
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const startEdit = (race: Race) => {
    setEditingId(race.id);
    setForm({
      name: race.name,
      date: race.date,
      type: race.type || 'Other',
      location: race.location || '',
      distance: race.distance || '',
    });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) return;
    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      date: form.date,
      type: form.type,
      location: form.location?.trim() || undefined,
      distance: form.distance?.trim() || undefined,
    };
    try {
      if (editingId) {
        await onEdit({ id: editingId, ...payload });
      } else {
        await onAdd(payload);
      }
      closeForm();
    } catch {
      // Surfaced via the parent's error state on next reload.
    } finally {
      setSubmitting(false);
    }
  };

  const RaceCard = ({ race, isPast }: { race: Race; isPast: boolean }) => {
    const days = daysBetween(race.date);
    return (
      <div className={`bg-gray-900/40 rounded-lg p-4 border border-gray-700 flex items-start justify-between gap-3 ${isPast ? 'opacity-60' : ''} ${editingId === race.id ? 'ring-1 ring-blue-500/60' : ''}`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-white truncate">{race.name}</h4>
            {race.type && (
              <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColor(race.type)}`}>{race.type}</span>
            )}
            {race.distance && <span className="text-xs text-gray-400">{race.distance}</span>}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(race.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
            {race.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {race.location}
              </span>
            )}
            {!isPast && (
              <span className="text-blue-300 font-medium">
                {days === 0 ? 'Today!' : `${days} day${days !== 1 ? 's' : ''} away`}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => startEdit(race)}
            className="text-gray-500 hover:text-blue-400 transition-colors p-1"
            aria-label={`Edit ${race.name}`}
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(race.id)}
            className="text-gray-500 hover:text-red-400 transition-colors p-1"
            aria-label={`Delete ${race.name}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Flag size={22} className="text-orange-400" />
          Races
        </h3>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-500"
        >
          {showForm && !editingId ? <X size={16} /> : <Plus size={16} />}
          {showForm && !editingId ? 'Cancel' : 'Add Race'}
        </button>
      </div>

      {error === 'not_configured' && (
        <div className="flex items-start gap-3 mb-4 p-4 rounded-lg border border-yellow-600/40 bg-yellow-500/5">
          <AlertCircle size={20} className="text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-300">
            Race storage isn't connected yet. Add a Vercel KV store and its{' '}
            <code className="text-yellow-300">KV_REST_API_URL</code> /{' '}
            <code className="text-yellow-300">KV_REST_API_TOKEN</code> env vars (see{' '}
            <code className="text-yellow-300">KV_SETUP.md</code>), then redeploy.
          </p>
        </div>
      )}
      {error === 'request_failed' && (
        <div className="flex items-start gap-3 mb-4 p-4 rounded-lg border border-red-600/40 bg-red-500/5">
          <AlertCircle size={20} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-300">Couldn't load races. Try again shortly.</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="mb-5 p-4 rounded-lg bg-gray-900/40 border border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">{editingId ? 'Edit race' : 'New race'}</p>
            {editingId && (
              <button type="button" onClick={closeForm} className="text-gray-400 hover:text-white p-1" aria-label="Cancel edit">
                <X size={16} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm text-gray-300">
              Race name *
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Boston Marathon"
                className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </label>
            <label className="text-sm text-gray-300">
              Date *
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </label>
            <label className="text-sm text-gray-300">
              Type
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {RACE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-gray-300">
              Distance
              <input
                type="text"
                value={form.distance}
                onChange={(e) => setForm({ ...form, distance: e.target.value })}
                placeholder="e.g. 70.3, 10K"
                className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </label>
            <label className="text-sm text-gray-300 sm:col-span-2">
              Location
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Boston, MA"
                className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-green-500 flex items-center justify-center gap-2"
          >
            {submitting ? 'Saving…' : editingId ? 'Save Changes' : 'Save Race'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-300 text-sm">Loading races…</span>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Upcoming ({upcoming.length})
            </p>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No upcoming races. Add one above.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((r) => (
                  <RaceCard key={r.id} race={r} isPast={false} />
                ))}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Completed ({past.length})
              </p>
              <div className="space-y-2">
                {past.map((r) => (
                  <RaceCard key={r.id} race={r} isPast />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RacesManager;
