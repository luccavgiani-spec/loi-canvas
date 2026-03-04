import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import CollectionGrid from '@/components/home/CollectionGrid';
import Banner from '@/components/home/Banner';
import Manifesto from '@/components/home/Manifesto';
import Newsletter from '@/components/home/Newsletter';
import FAQ from '@/components/home/FAQ';
import { mockProducts } from '@/lib/mocks';
import banner01 from '@/assets/banner-01.jpg';
import banner02 from '@/assets/banner-02.jpg';

const Index = () => {
  const bestsellers = mockProducts.filter(p => p.is_bestseller).slice(0, 4);
  const collection2 = mockProducts.filter(p => !p.is_bestseller).slice(0, 4);

  return (
    <Layout>
      <Hero />

      <CollectionGrid
        title="Mais Vendidos"
        subtitle="As fragrâncias favoritas dos nossos clientes"
        products={bestsellers}
        ctaLink="/shop?sort=bestsellers"
      />

      <Banner
        image={banner01}
        title="Coleção Cítricos"
        subtitle="Fragrâncias luminosas e envolventes, inspiradas nos pomares do Mediterrâneo. Notas de bergamota, neroli e flor de laranjeira."
        ctaLabel="Explorar coleção"
        ctaLink="/shop?collection=Cítricos"
      />

      <CollectionGrid
        title="Novidades"
        subtitle="Descubra as últimas criações do nosso ateliê"
        products={collection2}
        ctaLabel="Ver novidades"
        ctaLink="/shop?sort=newest"
      />

      <Banner
        image={banner02}
        title="Feito à Mão"
        subtitle="Cada vela passa por 12 etapas artesanais. Da seleção das essências ao derretimento da cera, tudo é feito com cuidado e intenção."
        ctaLabel="Conheça o processo"
        ctaLink="/about"
        reverse
      />

      <Manifesto />
      <Newsletter />
      <FAQ />
    </Layout>
  );
};

export default Index;
