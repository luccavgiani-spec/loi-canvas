import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, Truck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect, useRef } from 'react';

const COLLECTIONS = [
  { slug: 'cotidianas', label: 'Cotidianas', desc: 'Latinha 160g · dois pavios' },
  { slug: 'sala-ou-estar', label: 'Sala ou Estar', desc: 'Copo 200g · óleos essenciais puros' },
  { slug: 'refugio', label: 'Refúgio', desc: 'Copo âmbar 300g · assinatura Loiê' },
  { slug: 'botanicas-e-florais', label: 'Botânicas e Florais', desc: 'Copo 400g · dois pavios' },
];

const Header = () => {
  const { count, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const location = useLocation();
  const collectionsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const trackingRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      // On homepage, only transition after fully leaving the hero section (100vh)
      const threshold = isHome ? window.innerHeight : 20;
      setScrolled(window.scrollY > threshold);
    };
    // Run immediately to set correct initial state
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (collectionsRef.current && !collectionsRef.current.contains(e.target as Node)) {
        setCollectionsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (trackingRef.current && !trackingRef.current.contains(e.target as Node)) {
        setTrackingOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeAll = () => {
    setSearchOpen(false);
    setCollectionsOpen(false);
    setTrackingOpen(false);
  };

  // Non-home pages always use dark navbar; home uses dark only after scrolling past hero
  const showDark = !isHome || scrolled;
  const linkClass = showDark ? 'loi-nav-link' : 'hero-nav-link';
  const iconColor = showDark ? '#29241f' : 'rgba(244,237,210,0.5)';
  const iconHoverColor = '#29241f';
  const activeLinkColor = '#29241f';

  const dropdownBg = 'rgba(41,36,31,0.95)';
  const dropdownBorder = 'rgba(244,237,210,0.1)';
  const dropdownText = '#f4edd2';
  const dropdownMuted = 'rgba(244,237,210,0.3)';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      window.open(
        `https://www.linkcorreios.com.br/?id=${encodeURIComponent(trackingCode.trim())}`,
        '_blank',
        'noopener,noreferrer'
      );
      setTrackingOpen(false);
      setTrackingCode('');
    }
  };

  const IconBtn = ({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className="relative"
      style={{ color: iconColor, transition: 'color 0.3s ease' }}
      onMouseEnter={(e) => (e.currentTarget.style.color = iconHoverColor)}
      onMouseLeave={(e) => (e.currentTarget.style.color = iconColor)}
      aria-label={label}
    >
      {children}
    </button>
  );

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: showDark ? '#f4edd2' : 'transparent',
        backdropFilter: 'none',
        borderBottom: showDark ? '1px solid rgba(41,36,31,0.1)' : '1px solid transparent',
      }}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 md:px-10" style={{ height: '5rem' }}>
        {/* ── Left: mobile hamburger + desktop nav ── */}
        <div className="flex items-center gap-6">
          {/* Mobile menu toggle */}
          <button
            onClick={() => { setMobileOpen(!mobileOpen); closeAll(); }}
            className="md:hidden"
            style={{ color: iconColor }}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <IconBtn onClick={() => { setSearchOpen(!searchOpen); setCollectionsOpen(false); setTrackingOpen(false); }} label="Buscar">
                <Search size={17} strokeWidth={1.5} />
              </IconBtn>
              {searchOpen && (
                <div
                  className="absolute top-full left-0 mt-3"
                  style={{ background: dropdownBg, backdropFilter: 'blur(16px)', border: `1px solid ${dropdownBorder}`, padding: '12px 16px', minWidth: 240 }}
                >
                  <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <Search size={14} style={{ color: dropdownMuted, flexShrink: 0 }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar produtos..."
                      autoFocus
                      style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.1em', color: dropdownText, width: '100%' }}
                    />
                  </form>
                </div>
              )}
            </div>

            {/* Coleções dropdown */}
            <div ref={collectionsRef} className="relative">
              <button
                onClick={() => { setCollectionsOpen(!collectionsOpen); setSearchOpen(false); setTrackingOpen(false); }}
                className={linkClass}
                style={{ color: location.pathname === '/shop' ? activeLinkColor : undefined, cursor: 'pointer', background: 'none', border: 'none' }}
              >
                coleções
              </button>
              {collectionsOpen && (
                <div
                  className="absolute top-full left-0 mt-3"
                  style={{ background: dropdownBg, backdropFilter: 'blur(16px)', border: `1px solid ${dropdownBorder}`, padding: '16px 20px', minWidth: 260 }}
                >
                  <Link
                    to="/shop"
                    onClick={() => setCollectionsOpen(false)}
                    className="block mb-3 pb-3"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.68rem', color: '#f4edd2', textDecoration: 'none', borderBottom: `1px solid ${dropdownBorder}` }}
                  >
                    ver todas
                  </Link>
                  {COLLECTIONS.map((col) => (
                    <Link
                      key={col.slug}
                      to={`/shop/${col.slug}`}
                      onClick={() => setCollectionsOpen(false)}
                      className="block py-2 group/item"
                      style={{ textDecoration: 'none' }}
                    >
                      <span
                        style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.68rem', color: 'rgba(244,237,210,0.6)', transition: 'color 0.3s ease', display: 'block' }}
                        className="group-hover/item:!text-[#565600]"
                      >
                        {col.label}
                      </span>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: 'italic', fontSize: '0.78rem', color: dropdownMuted, display: 'block', marginTop: 2 }}>
                        {col.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/about" className={linkClass} style={{ color: location.pathname === '/about' ? activeLinkColor : undefined }}>
              sobre
            </Link>
            <Link to="/collabs" className={linkClass} style={{ color: location.pathname === '/collabs' ? activeLinkColor : undefined }}>
              collabs
            </Link>
          </nav>
        </div>

        {/* Logo center */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2" style={{ borderRadius: 4 }}>
          <img
            src="/hero/LOGO_BRANCA_t.png"
            alt="Loiê"
            width={110}
            height={40}
            fetchPriority="high"
            style={{
              width: 'clamp(70px, 8vw, 110px)',
              height: 'auto',
              transition: 'opacity 0.5s ease',
            }}
          />
        </Link>

        {/* ── Right: utility icons (always visible, including mobile) ── */}
        <div className="flex items-center gap-5">
          {/* Search (mobile only — desktop has it in left nav) */}
          <div ref={undefined} className="relative md:hidden">
            <IconBtn onClick={() => { setSearchOpen(!searchOpen); setTrackingOpen(false); }} label="Buscar">
              <Search size={17} strokeWidth={1.5} />
            </IconBtn>
          </div>

          {/* Tracking */}
          <div ref={trackingRef} className="relative">
            <IconBtn onClick={() => { setTrackingOpen(!trackingOpen); setSearchOpen(false); setCollectionsOpen(false); }} label="Rastrear pedido">
              <Truck size={18} strokeWidth={1.5} />
            </IconBtn>
            {trackingOpen && (
              <div
                className="absolute top-full right-0 mt-3"
                style={{ background: dropdownBg, backdropFilter: 'blur(16px)', border: `1px solid ${dropdownBorder}`, padding: '16px 20px', minWidth: 280 }}
              >
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.62rem', color: 'rgba(244,237,210,0.35)', display: 'block', marginBottom: 10 }}>
                  rastrear pedido
                </span>
                <form onSubmit={handleTracking} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Código de rastreio"
                    autoFocus
                    style={{ background: 'rgba(244,237,210,0.05)', border: '1px solid rgba(244,237,210,0.1)', outline: 'none', fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.08em', color: dropdownText, padding: '8px 12px', width: '100%' }}
                  />
                  <button
                    type="submit"
                    style={{ background: '#565600', color: '#f4edd2', border: 'none', padding: '8px 14px', fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.6rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    rastrear
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Cart */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative"
            style={{ color: iconColor, transition: 'color 0.3s ease' }}
            aria-label="Carrinho"
            onMouseEnter={(e) => (e.currentTarget.style.color = iconHoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = iconColor)}
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {count > 0 && (
              <span
                className="absolute -top-1 -right-2 flex items-center justify-center w-4 h-4 rounded-full text-[9px]"
                style={{ background: '#fcf5e0', color: '#29241f', fontFamily: "var(--font-body)", fontWeight: 400 }}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile search dropdown (appears below header bar) ── */}
      {searchOpen && (
        <div
          className="md:hidden px-6 py-3"
          style={{ background: 'rgba(41,36,31,0.97)', borderTop: '1px solid rgba(244,237,210,0.08)', backdropFilter: 'blur(12px)' }}
        >
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Search size={14} style={{ color: '#fcf5e0', flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produtos..."
              autoFocus
              style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.1em', color: '#fcf5e0', width: '100%' }}
            />
          </form>
        </div>
      )}

      {/* ── Mobile nav: clean dropdown list ── */}
      {mobileOpen && (
        <nav
          className="md:hidden px-6 py-5"
          style={{
            background: 'rgba(41,36,31,0.97)',
            borderTop: '1px solid rgba(244,237,210,0.08)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <ul className="space-y-1" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {/* Main nav links */}
            <li>
              <Link
                to="/shop"
                onClick={() => setMobileOpen(false)}
                className="block py-2.5"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.72rem', color: '#fcf5e0', textDecoration: 'none', borderBottom: '1px solid rgba(244,237,210,0.06)' }}
              >
                Coleções
              </Link>
            </li>

            {/* Collection sub-items */}
            {COLLECTIONS.map((col) => (
              <li key={col.slug}>
                <Link
                  to={`/shop/${col.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 pl-4"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.1em', fontSize: '0.7rem', color: 'rgba(244,237,210,0.6)', textDecoration: 'none', borderBottom: '1px solid rgba(244,237,210,0.04)' }}
                >
                  {col.label}
                </Link>
              </li>
            ))}

            <li>
              <Link
                to="/about"
                onClick={() => setMobileOpen(false)}
                className="block py-2.5"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.72rem', color: '#fcf5e0', textDecoration: 'none', borderBottom: '1px solid rgba(244,237,210,0.06)' }}
              >
                Sobre
              </Link>
            </li>

            <li>
              <Link
                to="/collabs"
                onClick={() => setMobileOpen(false)}
                className="block py-2.5"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.72rem', color: '#fcf5e0', textDecoration: 'none', borderBottom: '1px solid rgba(244,237,210,0.06)' }}
              >
                Collabs
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="block py-2.5"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.72rem', color: '#fcf5e0', textDecoration: 'none' }}
              >
                Contato
              </Link>
            </li>
          </ul>

          {/* Tracking inline form */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(244,237,210,0.08)' }}>
            <form onSubmit={handleTracking} className="flex items-center gap-2">
              <Truck size={14} style={{ color: '#fcf5e0', flexShrink: 0 }} />
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Código de rastreio"
                style={{ background: 'rgba(244,237,210,0.05)', border: '1px solid rgba(244,237,210,0.1)', outline: 'none', fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.08em', color: '#fcf5e0', padding: '6px 10px', width: '100%' }}
              />
              <button
                type="submit"
                style={{ background: '#fcf5e0', color: '#29241f', border: 'none', padding: '6px 12px', fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.6rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                rastrear
              </button>
            </form>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
