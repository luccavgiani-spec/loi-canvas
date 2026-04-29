import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/produtos', label: 'Produtos' },
  { to: '/admin/colecoes', label: 'Coleções' },
];

const COLOR = {
  cream: '#fcf5e0',
  creamDeep: '#f4edd2',
  charcoal: '#29241f',
  oliva: '#565600',
  olivaSoft: '#989857',
  sky: '#afc4e2',
};

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `font-sackers text-[11px] uppercase tracking-[0.2em] px-4 py-3 transition-colors ${
              isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'
            }`
          }
          style={({ isActive }) => ({
            color: COLOR.creamDeep,
            background: isActive ? 'rgba(244, 237, 210, 0.08)' : 'transparent',
            borderLeft: `2px solid ${isActive ? COLOR.sky : 'transparent'}`,
          })}
        >
          {item.label.toLowerCase()}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const displayName = user?.email?.split('@')[0] ?? '';

  return (
    <div
      className="min-h-screen flex"
      style={{ background: COLOR.cream, color: COLOR.charcoal }}
    >
      {/* Sidebar — desktop */}
      <aside
        className="hidden md:flex md:flex-col md:w-60 md:shrink-0"
        style={{ background: COLOR.charcoal, color: COLOR.creamDeep }}
      >
        <div className="px-6 py-8">
          <p className="font-sackers text-[9px] uppercase tracking-[0.3em] opacity-60 mb-2">
            painel
          </p>
          <h1 className="font-wagon text-2xl lowercase">loiê</h1>
        </div>
        <div className="flex-1 py-2">
          <NavList />
        </div>
        <div
          className="px-6 py-5 text-[9px] uppercase tracking-[0.25em] opacity-40 font-sackers"
          style={{ borderTop: '1px solid rgba(244, 237, 210, 0.1)' }}
        >
          v1
        </div>
      </aside>

      {/* Drawer — mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(41, 36, 31, 0.5)' }}
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 flex flex-col"
            style={{ background: COLOR.charcoal, color: COLOR.creamDeep }}
          >
            <div className="px-6 py-6 flex items-center justify-between">
              <h1 className="font-wagon text-2xl lowercase">loiê</h1>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Fechar menu"
                style={{ color: COLOR.creamDeep }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 py-2">
              <NavList onNavigate={() => setDrawerOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4"
          style={{
            background: COLOR.cream,
            borderBottom: `1px solid rgba(41, 36, 31, 0.08)`,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="md:hidden"
              aria-label="Abrir menu"
              style={{ color: COLOR.charcoal }}
            >
              <Menu size={20} />
            </button>
            {displayName && (
              <span className="font-sackers text-[10px] uppercase tracking-[0.25em] opacity-70">
                bem-vindo, {displayName}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 font-sackers text-[10px] uppercase tracking-[0.25em] opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: COLOR.charcoal }}
          >
            <LogOut size={14} />
            <span>sair</span>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
