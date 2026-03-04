import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'Qual o tempo de queima das velas?', a: 'Nossas velas têm duração aproximada de 50 horas. Recomendamos queimar por no máximo 4 horas seguidas.' },
  { q: 'As velas são veganas e cruelty-free?', a: 'Sim! Utilizamos cera de soja 100% vegetal, pavios de algodão e fragrâncias livres de testes em animais.' },
  { q: 'Como funciona o frete?', a: 'Frete grátis para compras acima de R$ 299. Para pedidos menores, calculamos o frete no checkout.' },
  { q: 'Posso trocar ou devolver?', a: 'Aceitamos trocas e devoluções em até 7 dias após o recebimento, desde que o produto não tenha sido usado.' },
];

const FAQ = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container max-w-2xl">
        <h2 className="heading-display text-3xl md:text-4xl text-center mb-10">Perguntas Frequentes</h2>
        <Accordion type="single" collapsible>
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-sm md:text-base text-left font-medium">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
