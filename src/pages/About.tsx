import Layout from '@/components/layout/Layout';
import banner02 from '@/assets/banner-02.jpg';

const About = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <h1 className="heading-display text-4xl md:text-5xl text-center mb-12">Nossa História</h1>

          <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
            <img src={banner02} alt="Ateliê Loiê" className="rounded w-full aspect-[4/3] object-cover" />
            <div>
              <h2 className="heading-display text-2xl mb-4">De mãos que criam</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                A Loiê nasceu em 2023 da paixão por fragrâncias e do desejo de criar objetos que
                transformam ambientes em experiências sensoriais. Cada vela é produzida artesanalmente
                em nosso ateliê em São Paulo.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Utilizamos exclusivamente cera de soja 100% vegetal, pavios de algodão sustentável e
                fragrâncias desenvolvidas em parceria com perfumistas brasileiros. Nosso compromisso é
                com a qualidade, a sustentabilidade e a beleza em cada detalhe.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { num: '100%', label: 'Cera de soja vegetal' },
              { num: '50h+', label: 'Duração por vela' },
              { num: '12', label: 'Etapas artesanais' },
            ].map(stat => (
              <div key={stat.label} className="p-8 bg-secondary rounded-lg">
                <p className="heading-display text-4xl text-accent mb-2">{stat.num}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
