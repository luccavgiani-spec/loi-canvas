import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'Qual o tempo de queima das velas?', a: 'As velas de 250g têm duração aproximada de 50 horas. Para preservar a fragrância e a qualidade da cera, recomendamos sessões de até 4 horas seguidas — tempo suficiente para perfumar o ambiente sem comprometer o desempenho da vela.' },
  { q: 'As velas são veganas e cruelty-free?', a: 'Sim. Utilizamos exclusivamente ceras vegetais de coco, arroz e palma, pavios de algodão e óleos essenciais puros — sem nenhum componente de origem animal. Nenhum produto Loiê é testado em animais.' },
  { q: 'Como funciona o frete?', a: 'Frete grátis para compras acima de R$ 299. Para pedidos menores, o frete é calculado no checkout com as melhores opções disponíveis para a sua região.' },
  { q: 'Posso trocar ou devolver?', a: 'Aceitamos trocas e devoluções em até 7 dias após o recebimento, desde que o produto esteja sem uso. Para solicitar, basta entrar em contato pelo e-mail ou WhatsApp — resolvemos com agilidade.' },
  { q: 'As velas são seguras para uso com pets ou crianças?', a: 'Nossas velas são feitas com óleos essenciais puros e ceras vegetais sem aditivos sintéticos. Em ambientes com pets ou crianças pequenas, recomendamos ventilação adequada e manter a vela fora do alcance. Óleos como eucalipto e menta exigem atenção especial com gatos — prefira usar com o ambiente bem arejado.' },
  { q: 'Qual a diferença entre as velas de 200g e as de 300g?', a: 'As velas de 200g têm duração aproximada de 40 horas e são ideais para ambientes menores ou uso diário. As de 300g duram cerca de 50 horas e entregam maior presença aromática — indicadas para salas maiores ou para quem quer que o aroma se prolongue por mais tempo.' },
  { q: 'Posso usar a vela em ambientes pequenos, como banheiros?', a: 'Sim. Em espaços menores, o aroma se concentra com rapidez. Recomendamos sessões mais curtas — entre 30 minutos e 1 hora — para evitar saturação sensorial. Velas com perfil mais suave, como Campos ou Ícaro, funcionam especialmente bem nesses ambientes.' },
  { q: 'As velas são veganas?', a: 'Sim. Utilizamos exclusivamente ceras vegetais de coco, arroz e palma, sem qualquer componente de origem animal. Nenhum produto Loiê é testado em animais.' },
  { q: 'Como armazenar a vela quando não estiver em uso?', a: 'Guarde em local fresco, seco e afastado da luz solar direta. A tampa ajuda a preservar o aroma e a qualidade da cera entre os usos. Evite superfícies que absorvam calor, como peitoris de janela em dias quentes.' },
];

const FAQ = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container max-w-2xl">
        <h2 className="heading-display text-3xl md:text-4xl text-center mb-10">Perguntas Frequentes</h2>
        <Accordion type="single" collapsible>
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-base md:text-lg text-left font-medium">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
