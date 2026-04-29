import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

function Spinner() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#fcf5e0' }}
    >
      <div
        className="h-10 w-10 rounded-full border-2 animate-spin"
        style={{
          borderColor: 'rgba(41, 36, 31, 0.15)',
          borderTopColor: '#29241f',
        }}
        aria-label="Carregando"
        role="status"
      />
    </div>
  );
}

function AccessDenied({ onSignOut, email }: { onSignOut: () => void; email: string | null }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#fcf5e0', color: '#29241f' }}
    >
      <div className="max-w-md w-full text-center">
        <h1 className="font-wagon text-3xl mb-4 lowercase">acesso negado</h1>
        <p className="font-sackers text-xs uppercase tracking-widest mb-2 opacity-70">
          esta área é restrita à equipe loiê
        </p>
        {email && (
          <p className="font-sackers text-[10px] uppercase tracking-widest mb-8 opacity-50">
            sessão: {email}
          </p>
        )}
        <button
          type="button"
          onClick={onSignOut}
          className="font-sackers text-xs uppercase tracking-widest px-6 py-3 border transition-colors"
          style={{
            borderColor: '#29241f',
            color: '#29241f',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#29241f';
            e.currentTarget.style.color = '#f4edd2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#29241f';
          }}
        >
          sair
        </button>
      </div>
    </div>
  );
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return <AccessDenied onSignOut={signOut} email={user.email ?? null} />;
  }

  return <>{children}</>;
}
