import { lazy, Suspense } from 'react';
import HeroSection from '@/components/HeroSection';
import CartDrawer from '@/components/layout/CartDrawer';
import Header from '@/components/layout/Header';

/* Lazy-load everything below the fold — reduces initial bundle and
   defers hydration of carousels, videos, FAQ, newsletter, and footer
   until the user approaches that content. */
const HomeSections = lazy(() => import('@/components/home/HomeSections'));
const HomeFooter = lazy(() => import('@/components/home/HomeFooter'));

const BelowFoldFallback = () => (
  <div style={{ background: '#fcf5e0', minHeight: '50vh' }} />
);

const Index = () => {
  return (
    <>
      <Header />
      <CartDrawer />
      <HeroSection />
      <Suspense fallback={<BelowFoldFallback />}>
        <HomeSections />
        <HomeFooter />
      </Suspense>
    </>
  );
};

export default Index;
