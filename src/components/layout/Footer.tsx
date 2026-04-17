import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
import { useState } from 'react';
import MensagemForm from '@/components/MensagemForm';
import GlareHover from '@/components/ui/GlareHover';

/* ── Olfactory families data ── */
const FAMILIES = [
  { label: 'cítricos e frescos', products: [
    { name: 'Campos', slug: 'campos' },
    { name: 'Citronela', slug: 'citronela-refugio' },
    { name: 'Pomar', slug: 'pomar' },
  ]},
  { label: 'verdes e verbais', products: [
    { name: 'Bosque', slug: 'bosque' },
    { name: 'Gin', slug: 'gin' },
    { name: 'Tabaco', slug: 'tabaco' },
  ]},
  { label: 'florais', products: [
    { name: 'Estela', slug: 'estela' },
    { name: 'Gardênia', slug: 'gardenia' },
    { name: 'Margarida', slug: 'margarida' },
    { name: 'Ícaro', slug: 'icaro' },
    { name: 'Dulce', slug: 'dulce' },
  ]},
  { label: 'amadeirados', products: [
    { name: 'Pomar', slug: 'pomar' },
    { name: 'Ritual', slug: 'ritual' },
    { name: 'Toca', slug: 'toca' },
  ]},
  { label: 'especiados e quentes', products: [
    { name: 'Gin', slug: 'gin' },
    { name: 'Gabriela', slug: 'gabriela' },
    { name: 'Ícaro', slug: 'icaro' },
    { name: 'Ame', slug: 'ame' },
    { name: 'Bosque', slug: 'bosque' },
    { name: 'Ritual', slug: 'ritual' },
  ]},
  { label: 'gourmand e conforto', products: [
    { name: 'Dulce', slug: 'dulce' },
    { name: 'Caramelo', slug: 'caramelo' },
    { name: 'Gin', slug: 'gin' },
    { name: 'Tabaco', slug: 'tabaco' },
    { name: 'Oceano', slug: 'oceano' },
  ]},
];

const FONT_BODY = "'Sackers Gothic', sans-serif";
const FONT_HEADING = "'Wagon', sans-serif";

const Footer = () => {
  const [activeFamily, setActiveFamily] = useState<string | null>(null);

  return (
    <footer style={{ background: '#29241f' }}>
      {/* ── Olfactory family filter ── */}
      <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-10">
        <span className="loi-label block mb-6" style={{ color: 'rgba(244,237,210,0.4)' }}>família aromática</span>
        <div className="flex flex-wrap gap-2 mb-6">
          {FAMILIES.map((fam) => {
            const isActive = activeFamily === fam.label;
            return (
              <GlareHover
                key={fam.label}
                width="auto"
                height="auto"
                background="transparent"
                glareColor="#fcf5e0"
                glareOpacity={0.18}
                glareAngle={-45}
                glareSize={250}
                transitionDuration={600}
                borderRadius="0px"
                style={{ display: 'inline-block' }}
              >
                <button
                  onClick={() => setActiveFamily(isActive ? null : fam.label)}
                  style={{
                    fontFamily: FONT_BODY,
                    fontWeight: 300,
                    fontSize: '0.6rem',
                    letterSpacing: '0.18em',
                    color: isActive ? '#f4edd2' : 'rgba(244,237,210,0.4)',
                    background: 'transparent',
                    border: `1px solid ${isActive ? 'rgba(244,237,210,0.5)' : 'rgba(244,237,210,0.15)'}`,
                    padding: '5px 14px',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease, border-color 0.3s ease',
                  }}
                >
                  {fam.label}
                </button>
              </GlareHover>
            );
          })}
        </div>
        {activeFamily && (
          <div style={{ fontFamily: FONT_BODY, fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.12em', color: 'rgba(244,237,210,0.55)' }}>
            {FAMILIES.find((f) => f.label === activeFamily)?.products.map((product, i, arr) => (
              <span key={product.slug}>
                <Link
                  to={`/product/${product.slug}`}
                  style={{ color: 'rgba(244,237,210,0.55)', textDecoration: 'none', transition: 'color 0.3s ease' }}
                  className="hover:!text-[#f4edd2]"
                >
                  {product.name}
                </Link>
                {i < arr.length - 1 && <span style={{ opacity: 0.3, margin: '0 0.4em' }}>·</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Main 4-column grid ── */}
      <div
        className="max-w-[1400px] mx-auto px-6 py-12"
        style={{ borderTop: '1px solid rgba(244,237,210,0.08)' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
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
                fontFamily: "'Wagon', sans-serif",
                fontWeight: 200,
                fontSize: '0.95rem',
                color: 'rgba(244,237,210,0.4)',
                lineHeight: 1.7,
              }}
            >
              A loiê é uma marca brasileira de velas aromáticas feita com óleos essenciais e estética autoral.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ fontFamily: FONT_BODY, fontWeight: 300, letterSpacing: '0.3em', textTransform: 'uppercase' as const, fontSize: '0.65rem', color: 'rgba(244,237,210,0.5)', marginBottom: '1.5rem' }}>coleção</h4>
            <ul className="space-y-3">
              {[
                { to: '/colecoes', label: 'Todas as Coleções' },
                { to: '/colecoes/cotidianas', label: 'Cotidianas' },
                { to: '/colecoes/sala-ou-estar', label: 'Sala' },
                { to: '/colecoes/refugio', label: 'Refúgio' },
                { to: '/colecoes/botanicas-e-florais', label: 'Botânicas e Florais' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    style={{
                      fontFamily: FONT_BODY,
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
            <h4 style={{ fontFamily: FONT_BODY, fontWeight: 300, letterSpacing: '0.3em', textTransform: 'uppercase' as const, fontSize: '0.65rem', color: 'rgba(244,237,210,0.5)', marginBottom: '1.5rem' }}>sobre</h4>
            <ul className="space-y-3">
              {[
                { to: '/sobre', label: 'Nossa História' },
                { to: '/collabs', label: 'Colaborações' },
                { to: '/contact', label: 'Contato' },
                { to: '/policies', label: 'Políticas' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    style={{
                      fontFamily: FONT_BODY,
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
            <h4 style={{ fontFamily: FONT_BODY, fontWeight: 300, letterSpacing: '0.3em', textTransform: 'uppercase' as const, fontSize: '0.65rem', color: 'rgba(244,237,210,0.5)', marginBottom: '1.5rem' }}>contato</h4>
            <ul className="space-y-3">
              <li style={{ fontFamily: FONT_BODY, fontWeight: 300, fontSize: '0.8rem', color: 'rgba(244,237,210,0.4)' }}>
                loie.aromatica@gmail.com
              </li>
              <li style={{ fontFamily: FONT_BODY, fontWeight: 300, fontSize: '0.8rem', color: 'rgba(244,237,210,0.4)' }}>
                (11) 99649-7672
              </li>
              <li style={{ fontFamily: FONT_BODY, fontWeight: 300, fontSize: '0.8rem', color: 'rgba(244,237,210,0.4)' }}>
                Rua Cel. João Leme, 688
              </li>
              <li style={{ fontFamily: FONT_BODY, fontWeight: 300, fontSize: '0.8rem', color: 'rgba(244,237,210,0.4)' }}>
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
          {/* Mensagem — desktop only (grid column) */}
          <div id="mensagem" className="hidden md:block">
            <h4 style={{ fontFamily: FONT_HEADING, fontWeight: 300, letterSpacing: '0.3em', textTransform: 'uppercase' as const, fontSize: '0.65rem', color: 'rgba(244,237,210,0.5)', marginBottom: '1.5rem' }}>deixe uma mensagem</h4>
            <MensagemForm dark />
          </div>
        </div>

        {/* Mensagem — mobile only (standalone section) */}
        <div
          className="block md:hidden pt-8"
          style={{ borderTop: '1px solid rgba(244,237,210,0.08)' }}
        >
          <MensagemForm dark />
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(244,237,210,0.08)' }}
        >
          <p style={{ fontFamily: FONT_BODY, fontWeight: 300, fontSize: '0.7rem', color: 'rgba(244,237,210,0.25)', letterSpacing: '0.05em' }}>
            © {new Date().getFullYear()} Loiê. Todos os direitos reservados.
          </p>
          <div className="flex gap-8">
            {['Termos', 'Privacidade', 'Trocas'].map((label) => (
              <Link
                key={label}
                to="/policies"
                style={{ fontFamily: FONT_BODY, fontWeight: 300, fontSize: '0.7rem', color: 'rgba(244,237,210,0.25)', textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.3s ease' }}
                className="hover:!text-[rgba(244,237,210,0.5)]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Brand signature ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginTop: '1.2rem' }}>
          <img src="/hero/SIMBOLO_t.png" alt="" width={18} height={18} loading="lazy" style={{ opacity: 0.15 }} />
          <span style={{ fontFamily: FONT_BODY, fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(244,237,210,0.2)' }}>
            somos brasileiros, feitos à mão, com técnica e com alma
          </span>
        </div>
      </div>

      {/* ── Brand symbol hover ── */}
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
