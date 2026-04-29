import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RedirectState {
  from?: string;
}

export default function AdminLogin() {
  const { user, isAdmin, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as RedirectState | null)?.from ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate(redirectTo, { replace: true });
    }
  }, [loading, user, isAdmin, navigate, redirectTo]);

  const handleSubmit = async () => {
    if (submitting) return;
    setError(null);

    if (!email.trim() || !password) {
      setError('preencha e-mail e senha');
      return;
    }

    setSubmitting(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setSubmitting(false);

    if (signInError) {
      setError('e-mail ou senha incorretos');
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#fcf5e0', color: '#29241f' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <p className="font-sackers text-[10px] uppercase tracking-[0.3em] opacity-60 mb-3">
            painel
          </p>
          <h1 className="font-wagon text-4xl lowercase">loiê</h1>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="admin-email"
              className="font-sackers text-[10px] uppercase tracking-[0.25em] block mb-2 opacity-70"
            >
              e-mail
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={submitting}
              className="w-full bg-transparent border-b py-2 px-1 text-sm focus:outline-none transition-colors"
              style={{ borderColor: '#29241f', color: '#29241f' }}
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="font-sackers text-[10px] uppercase tracking-[0.25em] block mb-2 opacity-70"
            >
              senha
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={submitting}
              className="w-full bg-transparent border-b py-2 px-1 text-sm focus:outline-none transition-colors"
              style={{ borderColor: '#29241f', color: '#29241f' }}
            />
          </div>

          {error && (
            <p
              className="font-sackers text-[10px] uppercase tracking-[0.2em]"
              style={{ color: '#7F2700' }}
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full font-sackers text-xs uppercase tracking-[0.3em] py-3 mt-4 transition-opacity disabled:opacity-50"
            style={{ background: '#29241f', color: '#f4edd2' }}
          >
            {submitting ? 'entrando…' : 'entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
