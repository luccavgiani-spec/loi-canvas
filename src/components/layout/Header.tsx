import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Settings, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

const Header = () => {
  const { count, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/shop', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contato' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Mobile menu toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-foreground" aria-label="Menu">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link to="/" className="font-heading text-2xl md:text-3xl font-light tracking-[0.2em] text-foreground uppercase">
          Loiê
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm tracking-wide uppercase transition-colors hover:text-accent ${location.pathname === link.to ? 'text-accent' : 'text-muted-foreground'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-foreground hover:text-accent transition-colors" aria-label="Buscar">
            <Search size={18} />
          </button>
          <button onClick={() => setIsOpen(true)} className="p-2 text-foreground hover:text-accent transition-colors relative" aria-label="Carrinho">
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          <Link to="/admin" className="p-2 text-muted-foreground hover:text-accent transition-colors" aria-label="Admin">
            <Settings size={18} />
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block text-sm tracking-wide uppercase text-muted-foreground hover:text-accent"
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
