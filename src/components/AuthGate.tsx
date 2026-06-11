import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';

type Status = 'checking' | 'authed' | 'locked';

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<Status>('checking');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = () => {
    fetch('/api/me')
      .then((r) => setStatus(r.ok ? 'authed' : 'locked'))
      .catch(() => setStatus('authed')); // No backend (plain vite) — don't block.
  };

  useEffect(() => {
    check();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPassword('');
        setStatus('authed');
      } else {
        setError('Incorrect password');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === 'locked') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center p-4">
        <form
          onSubmit={submit}
          className="w-full max-w-sm glass-card rounded-xl p-8 shadow-xl border border-white/10"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
              <Lock size={26} className="text-blue-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Training Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Enter your password to continue</p>
          </div>

          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-gray-800 border border-white/15 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 mb-3"
          />

          {error && <p className="text-sm text-red-400 mb-3 text-center">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border border-blue-500"
          >
            {submitting ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGate;
