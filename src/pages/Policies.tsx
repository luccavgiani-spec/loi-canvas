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
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <h1 className="heading-display text-4xl md:text-5xl text-center mb-12">Políticas</h1>
          <div className="space-y-10">
            {sections.map(s => (
              <div key={s.title}>
                <h2 className="heading-display text-2xl mb-3">{s.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Policies;
