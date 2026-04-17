import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';

const faqs = [
  {
    q: 'Qual o tempo de queima das velas?',
    a: `cotidianas 160g ——— aprox. 20 horas\nsala 200g ——————— aprox. 45 horas\nrefúgio 300g ————— aprox. 55 horas\nbotânicas & florais 400g — aprox. 65 horas\n\npara queimas saudáveis e seguras, recomendamos sessões de até 4 horas seguidas — tempo suficiente para perfumar o ambiente sem comprometer o desempenho da vela.`,
  },
  {
    q: 'As velas são veganas e cruelty-free?',
    a: 'sim. utilizamos exclusivamente ceras vegetais de coco, arroz e palma, pavios de algodão, óleos essenciais puros e composições aromáticas seguras e responsáveis — sem nenhum componente de origem animal. nenhum produto loiê é testado em animais.',
  },
  {
    q: 'Posso trocar ou devolver?',
    a: 'aceitamos trocas e devoluções em até 7 dias após o recebimento, desde que o produto esteja sem uso. para solicitar, basta entrar em contato pelo e-mail — resolvemos com agilidade.',
  },
  {
    q: 'As velas são seguras para uso com pets ou crianças?',
    a: 'nossas velas são feitas com óleos essenciais puros, composições aromáticas seguras e responsáveis e ceras vegetais sem aditivos sintéticos. em ambientes com pets ou crianças pequenas, recomendamos ventilação adequada e manter a vela fora do alcance. óleos como eucalipto e menta exigem atenção especial com gatos — prefira usar com o ambiente bem arejado.',
  },
  {
    q: 'Qual a diferença entre as velas de 200g e as de 300g?',
    a: 'as velas de 200g têm duração aproximada de 45 horas e são ideais para ambientes menores ou uso diário. as de 300g duram cerca de 55 horas e entregam maior presença aromática — indicadas para salas maiores ou para quem quer que o aroma se prolongue por mais tempo.',
  },
  {
    q: 'Posso usar a vela em ambientes pequenos, como banheiros?',
    a: 'sim. em espaços menores, o aroma se concentra com rapidez. recomendamos sessões mais curtas para evitar saturação sensorial. velas com perfil mais suave, como campos ou ícaro, funcionam especialmente bem nesses ambientes.',
  },
  {
    q: 'Como armazenar a vela quando não estiver em uso?',
    a: 'guarde em local fresco, seco e afastado da luz solar direta. evite superfícies que absorvam calor, como peitoris de janela em dias quentes.',
  },
];

const FAQ = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container max-w-2xl">
        <h2 className="text-center mb-10" style={{ fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 300, letterSpacing: '0.2em', fontSize: 'clamp(1rem, 1.5vw, 1.25rem)' }}>Perguntas frequentes</h2>
        <Accordion type="single" collapsible>
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-base md:text-lg text-left font-medium">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed whitespace-pre-line">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-10 text-center" style={{ fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 300, fontSize: '0.72rem', letterSpacing: '0.15em', color: 'rgba(41,36,31,0.45)' }}>
          ainda tem dúvidas?{' '}
          <Link to="/#mensagem" style={{ color: '#565600', textDecoration: 'none', borderBottom: '1px solid rgba(86,86,0,0.3)', paddingBottom: 1 }}>
            deixe uma mensagem →
          </Link>
        </p>
      </div>
    </section>
  );
};

export default FAQ;
