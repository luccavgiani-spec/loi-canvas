import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, Truck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect, useRef } from 'react';

const NAV_SECTIONS = [
  {
    label: 'produtos',
    items: [
      { num: 'i',   label: 'cotidianas',           desc: 'ritmos naturais',            to: '/shop/cotidianas' },
      { num: 'ii',  label: 'sala',                 desc: 'atmosfera do espaço',        to: '/shop/sala-ou-estar' },
      { num: 'iii', label: 'refúgio',              desc: 'densas e envolventes',       to: '/shop/refugio' },
      { num: 'iv',  label: 'botânicas & florais',  desc: 'expressivas e detalhadas',   to: '/shop/botanicas-e-florais' },
    ],
  },
  {
    label: 'borrifadores',
    items: [
      { num: 'i',  label: 'matéria 150ml',             desc: 'perfumaria pura e autoral',    to: '/shop' },
      { num: 'ii', label: 'atmosfera 200ml',            desc: 'aromas de projeção imediata', to: '/shop' },
    ],
  },
  {
    label: 'corpo',
    items: [
      { num: 'i',  label: 'barra para massagem',         desc: '', to: '/shop' },
      { num: 'ii', label: 'óleo corporal para massagem', desc: '', to: '/shop' },
    ],
  },
];

const Header = () => {
  const { count, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileSectionOpen, setMobileSectionOpen] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const trackingRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      const threshold = isHome ? window.innerHeight : 20;
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  useEffect(() => {
    setMobileOpen(false);
    setActiveSection(null);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveSection(null);
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
    setActiveSection(null);
    setTrackingOpen(false);
  };

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
        'noopener,noreferrer',
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

          {/* Desktop nav */}
          <nav ref={navRef} className="hidden md:flex items-center gap-6">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <IconBtn onClick={() => { setSearchOpen(!searchOpen); setActiveSection(null); setTrackingOpen(false); }} label="Buscar">
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

            {/* Section dropdowns */}
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="relative">
                <button
                  onClick={() => setActiveSection(activeSection === section.label ? null : section.label)}
                  className={linkClass}
                  style={{ cursor: 'pointer', background: 'none', border: 'none', opacity: activeSection && activeSection !== section.label ? 0.45 : 1 }}
                >
                  {section.label}
                </button>
                {activeSection === section.label && (
                  <div
                    className="absolute top-full left-0 mt-3"
                    style={{ background: dropdownBg, backdropFilter: 'blur(16px)', border: `1px solid ${dropdownBorder}`, padding: '16px 20px', minWidth: 260, zIndex: 60 }}
                  >
                    {section.items.map((item) => (
                      <Link
                        key={item.to + item.label}
                        to={item.to}
                        onClick={() => setActiveSection(null)}
                        className="block py-2 group/item"
                        style={{ textDecoration: 'none' }}
                      >
                        <span style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.08em', fontSize: '0.65rem', color: dropdownMuted, marginRight: '0.5rem' }}>
                          {item.num}
                        </span>
                        <span
                          style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', fontSize: '0.68rem', color: 'rgba(244,237,210,0.6)', transition: 'color 0.3s ease', display: 'inline' }}
                          className="group-hover/item:!text-[#989857]"
                        >
                          {item.label}
                        </span>
                        {item.desc && (
                          <span style={{ fontFamily: "'Wagon', sans-serif", fontWeight: 200, fontSize: '0.75rem', color: dropdownMuted, display: 'block', marginTop: 2, paddingLeft: '1.2rem' }}>
                            {item.desc}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

          </nav>
        </div>

        {/* Logo center */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2" style={{ borderRadius: 4 }}>
          <img
            src="/hero/logo_navbar_preta_semfundo.png"
            alt="Loiê"
            width={132}
            height={48}
            fetchPriority="high"
            style={{
              width: 'clamp(84px, 9.6vw, 132px)',
              height: 'auto',
              transition: 'filter 0.5s ease, opacity 0.5s ease',
              filter: showDark ? 'none' : 'brightness(10)',
            }}
          />
        </Link>

        {/* ── Right: utility icons ── */}
        <div className="flex items-center gap-5">
          {/* Espaço + Sobre — right of logo, desktop only */}
          <Link
            to="/lembrancas"
            className={`hidden md:inline ${linkClass}`}
            style={{ textDecoration: 'none' }}
          >
            festas
          </Link>
          <Link
            to="/about"
            className={`hidden md:inline ${linkClass}`}
            style={{ color: location.pathname === '/about' ? activeLinkColor : undefined, textDecoration: 'none' }}
          >
            sobre
          </Link>

          {/* Search (mobile only) */}
          <div className="relative md:hidden">
            <IconBtn onClick={() => { setSearchOpen(!searchOpen); setTrackingOpen(false); }} label="Buscar">
              <Search size={17} strokeWidth={1.5} />
            </IconBtn>
          </div>

          {/* Tracking */}
          <div ref={trackingRef} className="relative">
            <IconBtn onClick={() => { setTrackingOpen(!trackingOpen); setSearchOpen(false); setActiveSection(null); }} label="Rastrear pedido">
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

      {/* ── Mobile search ── */}
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

      {/* ── Mobile nav ── */}
      {mobileOpen && (
        <nav
          className="md:hidden px-6 py-5"
          style={{
            background: 'rgba(41,36,31,0.97)',
            borderTop: '1px solid rgba(244,237,210,0.08)',
            backdropFilter: 'blur(12px)',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <ul className="space-y-0" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {NAV_SECTIONS.map((section) => (
              <li key={section.label}>
                <button
                  onClick={() => setMobileSectionOpen(mobileSectionOpen === section.label ? null : section.label)}
                  className="w-full text-left block py-2.5"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.72rem', color: '#fcf5e0', background: 'none', border: 'none', borderBottom: '1px solid rgba(244,237,210,0.06)', cursor: 'pointer' }}
                >
                  {section.label}
                  <span style={{ float: 'right', opacity: 0.4, fontWeight: 300 }}>{mobileSectionOpen === section.label ? '−' : '+'}</span>
                </button>
                {mobileSectionOpen === section.label && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {section.items.map((item) => (
                      <li key={item.to + item.label}>
                        <Link
                          to={item.to}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2 pl-4"
                          style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.1em', fontSize: '0.7rem', color: 'rgba(244,237,210,0.6)', textDecoration: 'none', borderBottom: '1px solid rgba(244,237,210,0.04)' }}
                        >
                          <span style={{ opacity: 0.4, marginRight: '0.4em', fontSize: '0.6rem' }}>{item.num}</span>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}

            <li>
              <Link
                to="/lembrancas"
                onClick={() => setMobileOpen(false)}
                className="block py-2.5"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.72rem', color: '#fcf5e0', textDecoration: 'none', borderBottom: '1px solid rgba(244,237,210,0.06)' }}
              >
                festas
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                onClick={() => setMobileOpen(false)}
                className="block py-2.5"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.72rem', color: '#fcf5e0', textDecoration: 'none', borderBottom: '1px solid rgba(244,237,210,0.06)' }}
              >
                sobre <span style={{ opacity: 0.3, letterSpacing: '0.05em' }}>——</span> nossa história
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="block py-2.5"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.72rem', color: '#fcf5e0', textDecoration: 'none' }}
              >
                contato
              </Link>
            </li>
          </ul>

          {/* Tracking inline */}
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
