import { Link } from 'react-router-dom';
import { logoLoieDark } from '@/assets';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src={logoLoieDark} alt="Loiê" className="h-10 w-auto mb-4" />
            <p className="text-sm opacity-70 leading-relaxed">
              Velas artesanais feitas à mão com cera de soja 100% natural e fragrâncias exclusivas.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-4 opacity-50">Shop</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/shop" className="hover:opacity-100 transition-opacity">Todas as Velas</Link></li>
              <li><Link to="/shop?collection=Cítricos" className="hover:opacity-100 transition-opacity">Cítricos</Link></li>
              <li><Link to="/shop?collection=Amadeirados" className="hover:opacity-100 transition-opacity">Amadeirados</Link></li>
              <li><Link to="/shop?collection=Orientais" className="hover:opacity-100 transition-opacity">Orientais</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-4 opacity-50">Sobre</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/about" className="hover:opacity-100 transition-opacity">Nossa História</Link></li>
              <li><Link to="/contact" className="hover:opacity-100 transition-opacity">Contato</Link></li>
              <li><Link to="/policies" className="hover:opacity-100 transition-opacity">Políticas</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-4 opacity-50">Contato</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li>contato@loie.com.br</li>
              <li>São Paulo, Brasil</li>
              <li className="pt-2">
                <span className="text-xs uppercase tracking-wider opacity-50">@loie.velas</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs opacity-40">© {new Date().getFullYear()} Loiê. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-xs opacity-40">
            <Link to="/policies" className="hover:opacity-100">Termos</Link>
            <Link to="/policies" className="hover:opacity-100">Privacidade</Link>
            <Link to="/policies" className="hover:opacity-100">Trocas</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
