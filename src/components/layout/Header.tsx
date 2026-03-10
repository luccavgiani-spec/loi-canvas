import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, Truck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect, useRef } from 'react';

const COLLECTIONS = [
  { slug: 'Cítricos', label: 'Cítricos', desc: 'Notas frescas e vibrantes' },
  { slug: 'Amadeirados', label: 'Amadeirados', desc: 'Aromas quentes e profundos' },
  { slug: 'Herbais', label: 'Herbais', desc: 'Essências verdes e aromáticas' },
  { slug: 'Orientais', label: 'Orientais', desc: 'Fragrâncias ricas e envolventes' },
  { slug: 'Gourmand', label: 'Gourmand', desc: 'Notas doces e aconchegantes' },
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const linkClass = scrolled ? 'loi-nav-link' : 'hero-nav-link';
  const iconColor = scrolled ? '#29241f' : 'rgba(244,237,210,0.5)';
  const iconHoverColor = scrolled ? '#29241f' : '#f4edd2';
  const activeLinkColor = scrolled ? '#29241f' : '#f4edd2';

  const dropdownBg = scrolled ? 'rgba(252,245,224,0.97)' : 'rgba(41,36,31,0.95)';
  const dropdownBorder = scrolled ? 'rgba(86,86,0,0.1)' : 'rgba(244,237,210,0.1)';
  const dropdownText = scrolled ? '#29241f' : '#f4edd2';
  const dropdownMuted = scrolled ? 'rgba(41,36,31,0.45)' : 'rgba(244,237,210,0.3)';

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
        background: scrolled ? 'rgba(252,245,224,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(86,86,0,0.1)' : '1px solid transparent',
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
                    style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.68rem', color: scrolled ? '#29241f' : '#f4edd2', textDecoration: 'none', borderBottom: `1px solid ${dropdownBorder}` }}
                  >
                    ver todas
                  </Link>
                  {COLLECTIONS.map((col) => (
                    <Link
                      key={col.slug}
                      to={`/shop?collection=${col.slug}`}
                      onClick={() => setCollectionsOpen(false)}
                      className="block py-2 group/item"
                      style={{ textDecoration: 'none' }}
                    >
                      <span
                        style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.68rem', color: scrolled ? '#29241f' : 'rgba(244,237,210,0.6)', transition: 'color 0.3s ease', display: 'block' }}
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
        <Link to="/" className="absolute left-1/2 -translate-x-1/2" style={{ background: scrolled ? '#fcf5e0' : 'transparent', borderRadius: 4 }}>
          <img
            src={scrolled ? '/hero/Logo_Marrom.jpg' : '/hero/LOGO_BRANCA_t.png'}
            alt="Loiê"
            style={{
              width: 'clamp(70px, 8vw, 110px)',
              height: 'auto',
              mixBlendMode: scrolled ? 'multiply' : 'normal',
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
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.62rem', color: scrolled ? 'rgba(41,36,31,0.4)' : 'rgba(244,237,210,0.35)', display: 'block', marginBottom: 10 }}>
                  rastrear pedido
                </span>
                <form onSubmit={handleTracking} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Código de rastreio"
                    autoFocus
                    style={{ background: scrolled ? 'rgba(41,36,31,0.05)' : 'rgba(244,237,210,0.05)', border: `1px solid ${scrolled ? 'rgba(86,86,0,0.15)' : 'rgba(244,237,210,0.1)'}`, outline: 'none', fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.08em', color: dropdownText, padding: '8px 12px', width: '100%' }}
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
                style={{ background: '#29241f', color: '#f4edd2', fontFamily: "var(--font-body)", fontWeight: 400 }}
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
          style={{ background: 'rgba(252,245,224,0.97)', borderTop: '1px solid rgba(86,86,0,0.08)', backdropFilter: 'blur(12px)' }}
        >
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Search size={14} style={{ color: '#29241f', flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produtos..."
              autoFocus
              style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.1em', color: '#29241f', width: '100%' }}
            />
          </form>
        </div>
      )}

      {/* ── Mobile nav: clean dropdown list ── */}
      {mobileOpen && (
        <nav
          className="md:hidden px-6 py-5"
          style={{
            background: 'rgba(252,245,224,0.97)',
            borderTop: '1px solid rgba(86,86,0,0.1)',
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
                style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.72rem', color: '#29241f', textDecoration: 'none', borderBottom: '1px solid rgba(86,86,0,0.06)' }}
              >
                Coleções
              </Link>
            </li>

            {/* Collection sub-items */}
            {COLLECTIONS.map((col) => (
              <li key={col.slug}>
                <Link
                  to={`/shop?collection=${col.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 pl-4"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.1em', fontSize: '0.7rem', color: 'rgba(41,36,31,0.7)', textDecoration: 'none', borderBottom: '1px solid rgba(86,86,0,0.04)' }}
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
                style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.72rem', color: '#29241f', textDecoration: 'none', borderBottom: '1px solid rgba(86,86,0,0.06)' }}
              >
                Sobre
              </Link>
            </li>

            <li>
              <Link
                to="/collabs"
                onClick={() => setMobileOpen(false)}
                className="block py-2.5"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.72rem', color: '#29241f', textDecoration: 'none', borderBottom: '1px solid rgba(86,86,0,0.06)' }}
              >
                Collabs
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="block py-2.5"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.72rem', color: '#29241f', textDecoration: 'none' }}
              >
                Contato
              </Link>
            </li>
          </ul>

          {/* Tracking inline form */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(86,86,0,0.08)' }}>
            <form onSubmit={handleTracking} className="flex items-center gap-2">
              <Truck size={14} style={{ color: '#29241f', flexShrink: 0 }} />
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Código de rastreio"
                style={{ background: 'rgba(41,36,31,0.03)', border: '1px solid rgba(86,86,0,0.1)', outline: 'none', fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.08em', color: '#29241f', padding: '6px 10px', width: '100%' }}
              />
              <button
                type="submit"
                style={{ background: '#29241f', color: '#f4edd2', border: 'none', padding: '6px 12px', fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.6rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
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
