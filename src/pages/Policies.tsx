import Layout from '@/components/layout/Layout';

const sections = [
  {
    title: 'Política de Privacidade',
    content: 'Respeitamos sua privacidade. Coletamos apenas dados necessários para processar pedidos e melhorar sua experiência. Não compartilhamos informações pessoais com terceiros sem seu consentimento.'
  },
  {
    title: 'Termos de Uso',
    content: 'Ao utilizar nosso site, você concorda com estes termos. Os preços podem ser alterados sem aviso prévio. As imagens dos produtos são meramente ilustrativas e podem variar ligeiramente.'
  },
  {
    title: 'Política de Trocas e Devoluções',
    content: 'Aceitamos trocas e devoluções em até 7 dias corridos após o recebimento, desde que o produto esteja lacrado e em perfeito estado. Para iniciar uma troca, entre em contato pelo e-mail contato@loie.com.br.'
  },
  {
    title: 'Política de Frete',
    content: 'Frete grátis para compras acima de R$ 299,00 para todo o Brasil. Pedidos com valor inferior terão frete calculado no checkout. Prazo de entrega: 3 a 10 dias úteis, dependendo da região.'
  },
];

const Policies = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="loi-label block mb-4">informações</span>
            <h1
              className="heading-display"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#000' }}
            >
              Políticas
            </h1>
          </div>
          <div className="space-y-12">
            {sections.map((s) => (
              <div key={s.title}>
                <h2
                  className="heading-display mb-4"
                  style={{ fontSize: '1.6rem', color: '#000' }}
                >
                  {s.title}
                </h2>
                <div className="loi-divider mb-4" />
                <p
                  style={{
                    fontFamily: "'Wagon', sans-serif",
                    fontWeight: 300,
                    fontSize: '1rem',
                    color: 'rgba(41,36,31,0.5)',
                    lineHeight: 1.8,
                  }}
                >
                  {s.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Policies;
