import HeroSection from '@/components/HeroSection';
import HomeSections from '@/components/home/HomeSections';
import HomeFooter from '@/components/home/HomeFooter';
import CartDrawer from '@/components/layout/CartDrawer';

const Index = () => {
  return (
    <>
      <CartDrawer />
      <HeroSection />
      <HomeSections />
      <HomeFooter />
    </>
  );
};

export default Index;
