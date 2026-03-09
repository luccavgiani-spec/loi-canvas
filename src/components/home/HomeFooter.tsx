import { Link } from 'react-router-dom';

const HomeFooter = () => {
  return (
    <footer style={{ background: '#1e1a16' }}>
      {/* Main footer */}
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <img
              src="/hero/LOGO_BRANCA_t.png"
              alt="Loiê"
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
            <h4 className="loi-label mb-6">coleção</h4>
            <ul className="space-y-3">
              {[
                { to: '/shop', label: 'Todas as Velas' },
                { to: '/shop?collection=Cítricos', label: 'Cítricos' },
                { to: '/shop?collection=Amadeirados', label: 'Amadeirados' },
                { to: '/shop?collection=Orientais', label: 'Orientais' },
                { to: '/shop?collection=Herbais', label: 'Herbais' },
                { to: '/shop?collection=Gourmand', label: 'Gourmand' },
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
            <h4 className="loi-label mb-6">sobre</h4>
            <ul className="space-y-3">
              {[
                { to: '/about', label: 'Nossa História' },
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
            <h4 className="loi-label mb-6">contato</h4>
            <ul className="space-y-3">
              <li
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.8rem',
                  color: 'rgba(244,237,210,0.4)',
                }}
              >
                contato@loie.com.br
              </li>
              <li
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.8rem',
                  color: 'rgba(244,237,210,0.4)',
                }}
              >
                São Paulo, Brasil
              </li>
              <li className="pt-2">
                <span className="loi-label" style={{ fontSize: '0.7rem' }}>@loie.velas</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(152,152,87,0.1)' }}
        >
          <p
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 300,
              fontSize: '0.7rem',
              color: 'rgba(244,237,210,0.25)',
              letterSpacing: '0.05em',
            }}
          >
            © {new Date().getFullYear()} Loiê. Todos os direitos reservados.
          </p>
          <div className="flex gap-8">
            {['Termos', 'Privacidade', 'Trocas'].map((label) => (
              <Link
                key={label}
                to="/policies"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.7rem',
                  color: 'rgba(244,237,210,0.25)',
                  textDecoration: 'none',
                  letterSpacing: '0.05em',
                  transition: 'color 0.3s ease',
                }}
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
        <img
          src="/hero/SIMBOLO_t.png"
          alt=""
          className="w-10 h-10 object-contain"
          style={{ opacity: 0.2 }}
        />
      </div>
    </footer>
  );
};

export default HomeFooter;
