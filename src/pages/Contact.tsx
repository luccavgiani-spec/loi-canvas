import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <h1 className="heading-display text-4xl md:text-5xl text-center mb-12">Contato</h1>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="heading-display text-2xl mb-6">Fale conosco</h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail size={16} className="text-accent" />
                  <span>contato@loie.com.br</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone size={16} className="text-accent" />
                  <span>(11) 99999-0000</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin size={16} className="text-accent" />
                  <span>São Paulo, SP — Brasil</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Respondemos em até 24 horas úteis. Para dúvidas sobre pedidos, inclua o número do pedido na mensagem.
              </p>
            </div>

            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div>
                <Label className="text-xs uppercase tracking-wider">Nome</Label>
                <Input className="mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider">E-mail</Label>
                <Input type="email" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider">Mensagem</Label>
                <Textarea className="mt-1 min-h-[120px]" />
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full text-sm uppercase tracking-wider">
                Enviar mensagem
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
