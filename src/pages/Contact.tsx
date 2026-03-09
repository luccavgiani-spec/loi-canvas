import Layout from '@/components/layout/Layout';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="loi-label block mb-4">fale conosco</span>
            <h1
              className="heading-display"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#f4edd2' }}
            >
              Contato
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2
                className="heading-display mb-6"
                style={{ fontSize: '1.8rem', color: '#f4edd2' }}
              >
                Adoramos ouvir você
              </h2>
              <div className="space-y-5 mb-8">
                {[
                  { icon: Mail, text: 'loie.aromatica@gmail.com' },
                  { icon: Phone, text: '(11) 99649-7672' },
                  { icon: MapPin, text: 'Rua Cel. João Leme, 688 — Bragança Paulista, SP 12900-161' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon size={16} style={{ color: '#989857' }} />
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 300,
                        fontSize: '0.85rem',
                        color: 'rgba(244,237,210,0.5)',
                      }}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontStyle: 'italic',
                  fontSize: '1rem',
                  color: 'rgba(244,237,210,0.4)',
                  lineHeight: 1.7,
                }}
              >
                Respondemos em até 24 horas úteis. Para dúvidas sobre pedidos,
                inclua o número do pedido na mensagem.
              </p>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              {[
                { label: 'Nome', type: 'text' },
                { label: 'E-mail', type: 'email' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="loi-label block mb-2">{field.label}</label>
                  <input
                    type={field.type}
                    className="w-full px-4 py-3 bg-transparent text-sm"
                    style={{
                      border: '1px solid rgba(152,152,87,0.2)',
                      color: '#f4edd2',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 300,
                      outline: 'none',
                    }}
                  />
                </div>
              ))}
              <div>
                <label className="loi-label block mb-2">Mensagem</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 bg-transparent text-sm resize-none"
                  style={{
                    border: '1px solid rgba(152,152,87,0.2)',
                    color: '#f4edd2',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 300,
                    outline: 'none',
                  }}
                />
              </div>
              <button type="submit" className="loi-btn w-full justify-center">
                enviar mensagem
              </button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
