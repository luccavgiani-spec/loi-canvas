import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

const Layout: React.FC<{ children: React.ReactNode; hideFooter?: boolean }> = ({ children, hideFooter }) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fcf5e0' }}>
      <Header />
      <CartDrawer />
      <main className="flex-1 pt-20">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;
