import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';

const Header = () => {
  const { count, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { to: '/shop', label: 'Coleção' },
    { to: '/about', label: 'Sobre' },
    { to: '/contact', label: 'Contato' },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(139,105,20,0.1)' : '1px solid transparent',
      }}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 md:px-10" style={{ height: '5rem' }}>
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
          style={{ color: scrolled ? 'rgba(41,36,31,0.6)' : 'rgba(244,237,210,0.6)' }}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Nav left (desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={scrolled ? 'loi-nav-link' : 'hero-nav-link'}
              style={{
                color: location.pathname === link.to
                  ? (scrolled ? '#29241f' : '#f4edd2')
                  : undefined,
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Logo center */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <img
            src="/hero/LOGO_BRANCA_t.png"
            alt="Loiê"
            style={{
              width: 'clamp(70px, 8vw, 110px)',
              height: 'auto',
              filter: scrolled ? 'invert(1) brightness(0.2)' : 'none',
              transition: 'filter 0.5s ease',
            }}
          />
        </Link>

        {/* Nav right (desktop) + cart */}
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.slice(2).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={scrolled ? 'loi-nav-link' : 'hero-nav-link'}
                style={{
                  color: location.pathname === link.to
                    ? (scrolled ? '#29241f' : '#f4edd2')
                    : undefined,
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/shop" className={scrolled ? 'loi-nav-link' : 'hero-nav-link'}>
              loja
            </Link>
          </nav>
          <button
            onClick={() => setIsOpen(true)}
            className="relative"
            style={{ color: scrolled ? 'rgba(41,36,31,0.5)' : 'rgba(244,237,210,0.5)', transition: 'color 0.3s ease' }}
            aria-label="Carrinho"
            onMouseEnter={(e) => (e.currentTarget.style.color = scrolled ? '#29241f' : '#f4edd2')}
            onMouseLeave={(e) => (e.currentTarget.style.color = scrolled ? 'rgba(41,36,31,0.5)' : 'rgba(244,237,210,0.5)')}
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {count > 0 && (
              <span
                className="absolute -top-1 -right-2 flex items-center justify-center w-4 h-4 rounded-full text-[9px]"
                style={{
                  background: '#8B6914',
                  color: '#fff',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 400,
                }}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          className="md:hidden px-6 py-6 space-y-4"
          style={{
            background: 'rgba(255,255,255,0.97)',
            borderTop: '1px solid rgba(139,105,20,0.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {[...navLinks, { to: '/shop', label: 'Loja' }].map((link) => (
            <Link
              key={link.to + link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block loi-nav-link"
              style={{ fontSize: '0.85rem' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
