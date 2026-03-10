import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: '#29241f' }}>
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <img
              src="/hero/LOGO_BRANCA_t.png"
              alt="Loiê"
              width={110}
              height={32}
              loading="lazy"
              className="h-8 w-auto mb-6"
              style={{ opacity: 0.8 }}
            />
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: '0.95rem',
                color: 'rgba(244,237,210,0.4)',
                lineHeight: 1.7,
              }}
            >
              Atmosferas que ficam. Velas artesanais feitas à mão com cera de soja
              100% natural e fragrâncias exclusivas.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, letterSpacing: '0.3em', textTransform: 'uppercase' as const, fontSize: '0.65rem', color: 'rgba(244,237,210,0.5)', marginBottom: '1.5rem' }}>coleção</h4>
            <ul className="space-y-3">
              {[
                { to: '/shop', label: 'Todas as Coleções' },
                { to: '/shop/cotidianas', label: 'Cotidianas' },
                { to: '/shop/sala-ou-estar', label: 'Sala ou Estar' },
                { to: '/shop/refugio', label: 'Refúgio' },
                { to: '/shop/botanicas-e-florais', label: 'Botânicas e Florais' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 300,
                      fontSize: '0.8rem',
                      color: 'rgba(244,237,210,0.4)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                    }}
                    className="hover:!text-[#f4edd2]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, letterSpacing: '0.3em', textTransform: 'uppercase' as const, fontSize: '0.65rem', color: 'rgba(244,237,210,0.5)', marginBottom: '1.5rem' }}>sobre</h4>
            <ul className="space-y-3">
              {[
                { to: '/about', label: 'Nossa História' },
                { to: '/collabs', label: 'Collabs' },
                { to: '/contact', label: 'Contato' },
                { to: '/policies', label: 'Políticas' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 300,
                      fontSize: '0.8rem',
                      color: 'rgba(244,237,210,0.4)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                    }}
                    className="hover:!text-[#f4edd2]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, letterSpacing: '0.3em', textTransform: 'uppercase' as const, fontSize: '0.65rem', color: 'rgba(244,237,210,0.5)', marginBottom: '1.5rem' }}>contato</h4>
            <ul className="space-y-3">
              <li style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: 'rgba(244,237,210,0.4)' }}>
                loie.aromatica@gmail.com
              </li>
              <li style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: 'rgba(244,237,210,0.4)' }}>
                (11) 99649-7672
              </li>
              <li style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: 'rgba(244,237,210,0.4)' }}>
                Rua Cel. João Leme, 688
              </li>
              <li style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: 'rgba(244,237,210,0.4)' }}>
                Bragança Paulista, SP 12900-161
              </li>
              <li className="pt-3 flex items-center gap-4">
                <a
                  href="https://www.instagram.com/loie_____/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  style={{ color: 'rgba(244,237,210,0.4)', transition: 'color 0.3s ease' }}
                  className="hover:!text-[#f4edd2]"
                >
                  <Instagram size={18} strokeWidth={1.5} />
                </a>
                <a
                  href="https://www.facebook.com/loievelas"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  style={{ color: 'rgba(244,237,210,0.4)', transition: 'color 0.3s ease' }}
                  className="hover:!text-[#f4edd2]"
                >
                  <Facebook size={18} strokeWidth={1.5} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(244,237,210,0.08)' }}
        >
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.7rem', color: 'rgba(244,237,210,0.25)', letterSpacing: '0.05em' }}>
            © {new Date().getFullYear()} Loiê. Todos os direitos reservados.
          </p>
          <div className="flex gap-8">
            {['Termos', 'Privacidade', 'Trocas'].map((label) => (
              <Link
                key={label}
                to="/policies"
                style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.7rem', color: 'rgba(244,237,210,0.25)', textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.3s ease' }}
                className="hover:!text-[rgba(244,237,210,0.5)]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Brand symbol bottom */}
      <div className="flex justify-center pb-10">
        <div className="relative group" style={{ width: 40, height: 40 }}>
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(244,237,210,0.15) 0%, transparent 70%)',
              transition: '550ms cubic-bezier(0.4,0,0.2,1)',
            }}
          />
          <img src="/hero/SIMBOLO_t.png" alt="" width={40} height={40} loading="lazy" className="absolute inset-0 w-full h-full object-contain" style={{ opacity: 0.2, transition: '550ms cubic-bezier(0.4,0,0.2,1)' }} />
          <img src="/hero/SIMBOLO_2_t.png" alt="" width={40} height={40} loading="lazy" className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ opacity: 0, transition: '550ms cubic-bezier(0.4,0,0.2,1)' }} />
          <div
            className="absolute inset-0"
            onMouseEnter={(e) => {
              const container = e.currentTarget.parentElement;
              if (!container) return;
              const imgs = container.querySelectorAll('img');
              if (imgs[0]) { imgs[0].style.opacity = '0'; imgs[0].style.transform = 'scale(1.1) rotate(4deg)'; }
              if (imgs[1]) { imgs[1].style.opacity = '0.4'; imgs[1].style.transform = 'scale(1) rotate(0deg)'; imgs[1].style.filter = 'drop-shadow(0 0 8px rgba(244,237,210,0.4))'; }
            }}
            onMouseLeave={(e) => {
              const container = e.currentTarget.parentElement;
              if (!container) return;
              const imgs = container.querySelectorAll('img');
              if (imgs[0]) { imgs[0].style.opacity = '0.2'; imgs[0].style.transform = 'scale(1) rotate(0deg)'; }
              if (imgs[1]) { imgs[1].style.opacity = '0'; imgs[1].style.transform = ''; imgs[1].style.filter = ''; }
            }}
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
