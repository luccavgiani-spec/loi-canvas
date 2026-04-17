import type { Product, Review, Order, Customer, KPIs, SalesTimeseriesPoint, TopProduct, NewsletterSubscriber, Coupon, Collection, Collab } from '@/types';
import { storageUrl } from '@/lib/storage';

// Reuse available bucket images
const imgCampos = storageUrl('loie_vela_campos_principal.JPG');
const imgCamposImg = storageUrl('loie_vela_campos_imagem.JPG');
const imgCamposImg2 = storageUrl('loie_vela_campos_imagem_2.JPG');
const imgCamposUlt = storageUrl('loie_vela_campos_ultima.JPG');
const imgIcaro = storageUrl('loie_vela_icaro_principal.JPG');
const imgIcaroUlt = storageUrl('loie_vela_icaro_ultima.JPG');
const imgEstela = storageUrl('loie_vela_estela_principal.JPG');
const imgEstelaImg = storageUrl('loie_vela_estela_imagem.JPG');
const imgEstelaVid = storageUrl('loie_vela_estela (1).mp4');
const imgEstelaUlt = storageUrl('loie_vela_estela_ultima.JPG');
const imgGin = storageUrl('loie_vela_gin_canela_principal.jpg');
const imgGinUlt = storageUrl('loie_vela_gin_ultima.JPG');
const imgPomar = storageUrl('loie_vela_pomar_principal.JPG');
const imgPomarImg = storageUrl('loie_vela_pomar_imagem.JPG');
const imgPomarImg2 = storageUrl('loie_vela_pomar_imagem_2.JPG');
const imgPomarImg3 = storageUrl('loie_vela_pomar_imagem_3.JPG');
const imgPomarVid = storageUrl('loie_vela_pomar.mp4');
const imgPomarUlt = storageUrl('loie_vela_pomar_ultima.JPG');
const imgDulce = storageUrl('loie_vela_DULCE_imagem.JPG');
const imgDulceUlt = storageUrl('loie_vela_dulce_ultima.JPG');
const imgBosque = storageUrl('loie_vela_BOSQUE_imagem.JPG');
const imgBosqueVid = storageUrl('loie_vela_bosque_compress (1).mp4');
const imgBosqueUlt = storageUrl('loie_vela_bosque_ultima.JPG');
const imgCaramelo = storageUrl('loie_vela_CARAMELO_imagem.JPG');
const imgCarameloUlt = storageUrl('loie_vela_caramelo_ultima.JPG');
const imgRitual = storageUrl('loie_vela_RITUAL_imagem.JPG');
const imgRitualUlt = storageUrl('loie_vela_ritual_ultima.JPG');

export const mockProducts: Product[] = [
  /* ═══════════════════════════════════════════
     I — COTIDIANAS  (latinha 160g, 2 pavios, R$ 72)
     ═══════════════════════════════════════════ */
  {
    id: 'cot-1', slug: 'campos-cotidiana', name: 'Campos', description: 'Capim cidreira, litsea cubeba e cedro virgínia. Uma breve apresentação da marca com um básico muito bem feito numa latinha aesthetic.', details: 'Latinha de 160g. Dois pavios de algodão. Cera de soja 100% natural. Duração aprox. 25h.', how_to_use: 'Acenda os dois pavios simultaneamente na primeira utilização para derreter toda a superfície.', care_instructions: 'Mantenha longe de correntes de ar. Não queime por mais de 3 horas seguidas.', price: 72, images: [imgCampos, imgCamposImg, imgCamposUlt], collection: 'Cotidianas', tags: ['herbal', 'fresco', 'cotidiano'], rating_avg: 4.7, rating_count: 34, is_bestseller: true, created_at: '2025-06-01'
  },
  {
    id: 'cot-2', slug: 'citronela-cotidiana', name: 'Citronela', description: 'Frescor natural de citronela pura. Ideal para o dia a dia, perfeita como lembrança ou presente.', details: 'Latinha de 160g. Dois pavios de algodão. Cera de soja 100% natural. Duração aprox. 25h.', how_to_use: 'Acenda os dois pavios para uma queima uniforme e completa.', care_instructions: 'Armazene com tampa em local fresco e seco.', price: 72, images: [imgCamposImg2, imgCamposUlt], collection: 'Cotidianas', tags: ['fresco', 'citronela', 'cotidiano'], rating_avg: 4.6, rating_count: 28, is_bestseller: true, created_at: '2025-06-01'
  },

  /* ═══════════════════════════════════════════
     II — SALA  (copo 200g transparente, 1 pavio)
     ═══════════════════════════════════════════ */
  {
    id: 'sal-1', slug: 'campos', name: 'Campos', description: 'Capim cidreira, litsea cubeba e cedro virgínia. Criação autoral com óleos essenciais puros.', details: 'Copo de vidro transparente de 200g. Um pavio de algodão. Cera de soja 100% natural. Duração aprox. 45h.', how_to_use: 'Acenda e deixe o aroma preencher o ambiente.', care_instructions: 'Mantenha em local ventilado.', price: 172.20, images: [imgCampos, imgCamposImg, imgCamposImg2, imgCamposUlt], collection: 'Sala', tags: ['herbal', 'fresco'], badge: 'new', rating_avg: 4.7, rating_count: 22, is_bestseller: true, created_at: '2025-06-01'
  },
  {
    id: 'sal-2', slug: 'icaro', name: 'Ícaro', description: 'Notas solares de bergamota, neroli e almíscar branco. Uma fragrância luminosa e elevada, criação autoral com óleos essenciais puros.', details: 'Copo de vidro transparente de 200g. Um pavio de algodão. Cera de soja 100% natural. Duração aprox. 45h.', how_to_use: 'Perfeita para escritórios e salas de estar.', care_instructions: 'Evite exposição direta ao sol.', price: 172.20, images: [imgIcaro, imgIcaroUlt], collection: 'Sala', tags: ['cítrico', 'solar'], rating_avg: 4.6, rating_count: 18, is_bestseller: true, created_at: '2025-06-01'
  },
  {
    id: 'sal-3', slug: 'pomar', name: 'Pomar', description: 'Frutas maduras, folhas verdes e madeira de macieira. Criação autoral com óleos essenciais puros.', details: 'Copo de vidro transparente de 200g. Um pavio de algodão. Cera de soja 100% natural. Duração aprox. 45h.', how_to_use: 'Perfeita para criar atmosferas vibrantes.', care_instructions: 'Não deixe sem supervisão.', price: 182.60, images: [imgPomar, imgPomarImg, imgPomarImg2, imgPomarImg3, imgPomarVid, imgPomarUlt], collection: 'Sala', tags: ['frutado', 'verde'], rating_avg: 4.7, rating_count: 20, is_bestseller: true, created_at: '2025-06-01'
  },
  {
    id: 'sal-4', slug: 'dulce', name: 'Dulce', description: 'Doçura delicada de baunilha, leite de coco e um toque sutil de flor de sal. Criação autoral com óleos essenciais puros.', details: 'Copo de vidro transparente de 200g. Um pavio de algodão. Cera de soja 100% natural. Duração aprox. 45h.', how_to_use: 'Acenda em ambientes aconchegantes.', care_instructions: 'Mantenha longe de crianças e pets.', price: 182.60, images: [imgDulce, imgDulceUlt], collection: 'Sala', tags: ['doce', 'gourmand'], rating_avg: 4.9, rating_count: 27, is_bestseller: true, created_at: '2025-06-01'
  },
  {
    id: 'sal-5', slug: 'estela', name: 'Estela', description: 'Elegância floral de jasmim, peônia e sândalo. Criação autoral com óleos essenciais puros.', details: 'Copo de vidro transparente de 200g. Um pavio de algodão. Cera de soja 100% natural. Duração aprox. 45h.', how_to_use: 'Ideal para quartos e espaços íntimos.', care_instructions: 'Mantenha o pavio centralizado.', price: 182.60, images: [imgEstela, imgEstelaImg, imgEstelaVid, imgEstelaUlt], collection: 'Sala', tags: ['floral', 'sofisticado'], rating_avg: 4.8, rating_count: 14, is_bestseller: true, created_at: '2025-06-01'
  },
  {
    id: 'sal-6', slug: 'gin', name: 'Gin', description: 'Blend refrescante de zimbro, limão siciliano e canela. Criação autoral com óleos essenciais puros.', details: 'Copo de vidro transparente de 200g. Um pavio de algodão. Cera de soja 100% natural. Duração aprox. 45h.', how_to_use: 'Ideal para receber convidados.', care_instructions: 'Armazene em local fresco e seco.', price: 182.60, images: [imgGin, imgGinUlt], collection: 'Sala', tags: ['fresco', 'especiado'], rating_avg: 4.8, rating_count: 31, is_bestseller: true, created_at: '2025-06-01'
  },

  /* ═══════════════════════════════════════════
     III — REFÚGIO  (copo âmbar 300g, 1 pavio, R$ 260)
     ═══════════════════════════════════════════ */
  {
    id: 'ref-1', slug: 'bosque', name: 'Bosque', description: 'Imersão olfativa em madeiras nobres, folhas secas e um fundo terroso de musgo. Profundidade e elegância num copo com presença.', details: 'Copo âmbar de 300g. Um pavio de algodão. Cera de soja 100% natural. Duração aprox. 60h.', how_to_use: 'Perfeita para criar atmosferas envolventes.', care_instructions: 'Armazene com tampa em local fresco.', price: 260, images: [imgBosque, imgBosqueVid, imgBosqueUlt], collection: 'Refúgio', tags: ['amadeirado', 'terroso'], rating_avg: 5.0, rating_count: 8, is_bestseller: false, created_at: '2025-06-01'
  },
  {
    id: 'ref-2', slug: 'citronela-refugio', name: 'Citronela', description: 'Citronela com composição aromática exclusiva, modificada com assinatura Loiê. Presença e aconchego no copo âmbar.', details: 'Copo âmbar de 300g. Um pavio de algodão. Cera de soja 100% natural. Duração aprox. 60h.', how_to_use: 'Acenda por no mínimo 1 hora na primeira utilização.', care_instructions: 'Mantenha longe de correntes de ar.', price: 260, images: [imgCamposImg2, imgCamposUlt], collection: 'Refúgio', tags: ['fresco', 'citronela'], rating_avg: 4.7, rating_count: 10, is_bestseller: false, created_at: '2025-06-01'
  },
  {
    id: 'ref-3', slug: 'caramelo', name: 'Caramelo', description: 'Notas envolventes de caramelo, baunilha e um toque de especiarias. Fragrância encomendada com assinatura Loiê.', details: 'Copo âmbar de 300g. Um pavio de algodão. Cera de soja 100% natural. Duração aprox. 60h.', how_to_use: 'Acenda por no mínimo 1 hora na primeira utilização.', care_instructions: 'Mantenha longe de correntes de ar.', price: 260, images: [imgCaramelo, imgCarameloUlt], collection: 'Refúgio', tags: ['doce', 'especiado'], rating_avg: 4.9, rating_count: 12, is_bestseller: false, created_at: '2025-06-01'
  },
  {
    id: 'ref-4', slug: 'oceano', name: 'Oceano', description: 'Brisa marinha, sal e madeiras costeiras. Uma composição aromática que transporta para o litoral, com assinatura Loiê.', details: 'Copo âmbar de 300g. Um pavio de algodão. Cera de soja 100% natural. Duração aprox. 60h.', how_to_use: 'Ideal para ambientes que pedem frescor e leveza.', care_instructions: 'Armazene com tampa em local fresco.', price: 260, images: [imgEstelaImg, imgEstelaUlt], collection: 'Refúgio', tags: ['marinho', 'fresco'], rating_avg: 4.8, rating_count: 6, is_bestseller: false, created_at: '2025-06-01'
  },
  {
    id: 'ref-5', slug: 'ritual', name: 'Ritual', description: 'Blend intenso de incenso, âmbar e resinas. Fragrância encomendada com assinatura Loiê que convida à introspecção.', details: 'Copo âmbar de 300g. Um pavio de algodão. Cera de soja 100% natural. Duração aprox. 60h.', how_to_use: 'Ideal para momentos de meditação e relaxamento.', care_instructions: 'Não queime por mais de 4 horas seguidas.', price: 260, images: [imgRitual, imgRitualUlt], collection: 'Refúgio', tags: ['oriental', 'resinoso'], rating_avg: 4.8, rating_count: 15, is_bestseller: false, created_at: '2025-06-01'
  },

  /* ═══════════════════════════════════════════
     IV — BOTÂNICAS & FLORAIS  (copo 400g, 2 pavios, R$ 332)
     ═══════════════════════════════════════════ */
  {
    id: 'bot-1', slug: 'tabaco', name: 'Tabaco', description: 'Folhas de tabaco curadas, baunilha escura e couro. Um aroma exclusivo e envolvente para queimas longas.', details: 'Copo de 400g. Dois pavios de algodão. Cera de soja 100% natural. Duração aprox. 70h.', how_to_use: 'Acenda os dois pavios simultaneamente para uma queima uniforme.', care_instructions: 'Mantenha longe de correntes de ar. Não queime por mais de 4 horas seguidas.', price: 332, images: [imgRitual, imgRitualUlt], collection: 'Botânicas & Florais', tags: ['amadeirado', 'intenso'], badge: 'limited', rating_avg: 5.0, rating_count: 5, is_bestseller: false, created_at: '2025-06-01'
  },
  {
    id: 'bot-2', slug: 'gardenia', name: 'Gardênia', description: 'A opulência da gardênia em plena floração, com toques de jasmim e musk. Feminina e sofisticada.', details: 'Copo de 400g. Dois pavios de algodão. Cera de soja 100% natural. Duração aprox. 70h.', how_to_use: 'Perfeita para ambientes espaçosos.', care_instructions: 'Armazene com tampa para preservar a fragrância.', price: 332, images: [imgEstela, imgEstelaImg, imgEstelaUlt], collection: 'Botânicas & Florais', tags: ['floral', 'sofisticado'], badge: 'limited', rating_avg: 4.9, rating_count: 7, is_bestseller: false, created_at: '2025-06-01'
  },
  {
    id: 'bot-3', slug: 'gabriela', name: 'Gabriela', description: 'Cravo, canela e especiarias tropicais numa composição botânica quente e marcante.', details: 'Copo de 400g. Dois pavios de algodão. Cera de soja 100% natural. Duração aprox. 70h.', how_to_use: 'Ideal para criar atmosferas acolhedoras e envolventes.', care_instructions: 'Não deixe sem supervisão.', price: 332, images: [imgDulce, imgDulceUlt], collection: 'Botânicas & Florais', tags: ['especiado', 'tropical'], badge: 'limited', rating_avg: 4.8, rating_count: 4, is_bestseller: false, created_at: '2025-06-01'
  },
  {
    id: 'bot-4', slug: 'margarida', name: 'Margarida', description: 'Frescor delicado de margaridas do campo, folhas verdes e orvalho matinal. Simplicidade elegante.', details: 'Copo de 400g. Dois pavios de algodão. Cera de soja 100% natural. Duração aprox. 70h.', how_to_use: 'Perfeita para ambientes claros e arejados.', care_instructions: 'Mantenha em local ventilado.', price: 332, images: [imgPomarImg, imgPomarImg2, imgPomarUlt], collection: 'Botânicas & Florais', tags: ['floral', 'fresco'], badge: 'limited', rating_avg: 4.7, rating_count: 3, is_bestseller: false, created_at: '2025-06-01'
  },
  {
    id: 'bot-5', slug: 'toca', name: 'Toca', description: 'Musgo, terra úmida e raízes aromáticas. Uma imersão botânica profunda e envolvente.', details: 'Copo de 400g. Dois pavios de algodão. Cera de soja 100% natural. Duração aprox. 70h.', how_to_use: 'Ideal para momentos de introspecção e relaxamento.', care_instructions: 'Armazene com tampa em local fresco.', price: 332, images: [imgBosque, imgBosqueVid, imgBosqueUlt], collection: 'Botânicas & Florais', tags: ['terroso', 'botânico'], badge: 'limited', rating_avg: 5.0, rating_count: 6, is_bestseller: false, created_at: '2025-06-01'
  },
];

export const mockReviews: Review[] = [
  { id: '1', product_id: 'sal-1', author_name: 'Maria S.', rating: 5, title: 'Perfume incrível!', body: 'A fragrância preenche todo o ambiente. Duração excelente.', created_at: '2025-02-15' },
  { id: '2', product_id: 'sal-1', author_name: 'João P.', rating: 5, title: 'Presente perfeito', body: 'Comprei para presentear e a embalagem é linda. Super recomendo.', created_at: '2025-02-20' },
  { id: '3', product_id: 'cot-1', author_name: 'Ana L.', rating: 4, title: 'Muito boa', body: 'Gostei bastante, perfeita para o dia a dia. Latinha linda!', created_at: '2025-03-01' },
];

export const mockOrders: Order[] = [
  { id: 'ORD-001', status: 'delivered', customer: { name: 'Maria Silva', email: 'maria@email.com', phone: '11999887766' }, items: [{ product_id: 'sal-1', product_name: 'Campos', price: 172.20, quantity: 2, image: imgCampos }], subtotal: 344.40, shipping_cost: 0, total: 344.40, created_at: '2025-02-10' },
  { id: 'ORD-002', status: 'shipped', customer: { name: 'João Pereira', email: 'joao@email.com', phone: '21988776655' }, items: [{ product_id: 'ref-1', product_name: 'Bosque', price: 260, quantity: 1 }, { product_id: 'cot-1', product_name: 'Campos', price: 72, quantity: 1 }], subtotal: 332, shipping_cost: 0, total: 332, created_at: '2025-03-01' },
  { id: 'ORD-003', status: 'pending', customer: { name: 'Ana Lima', email: 'ana@email.com', phone: '31977665544' }, items: [{ product_id: 'bot-1', product_name: 'Tabaco', price: 332, quantity: 1 }], subtotal: 332, shipping_cost: 0, total: 332, created_at: '2025-03-15' },
];

export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Maria Silva', email: 'maria@email.com', phone: '11999887766', orders_count: 5, total_spent: 1245, created_at: '2024-11-01' },
  { id: 'c2', name: 'João Pereira', email: 'joao@email.com', phone: '21988776655', orders_count: 3, total_spent: 789, created_at: '2025-01-15' },
  { id: 'c3', name: 'Ana Lima', email: 'ana@email.com', phone: '31977665544', orders_count: 1, total_spent: 332, created_at: '2025-03-10' },
];

export const mockKPIs: KPIs = {
  total_revenue: 12450,
  total_orders: 67,
  avg_order_value: 185.82,
  new_customers: 23,
  conversion_rate: 3.2,
};

export const mockSalesTimeseries: SalesTimeseriesPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2025, 2, i + 1).toISOString().split('T')[0],
  revenue: Math.floor(Math.random() * 800 + 200),
  orders: Math.floor(Math.random() * 5 + 1),
}));

export const mockTopProducts: TopProduct[] = [
  { product_id: 'sal-1', product_name: 'Campos', total_sold: 47, revenue: 8093 },
  { product_id: 'cot-1', product_name: 'Campos (Cotidiana)', total_sold: 37, revenue: 2664 },
  { product_id: 'ref-3', product_name: 'Caramelo', total_sold: 32, revenue: 8320 },
  { product_id: 'sal-4', product_name: 'Dulce', total_sold: 29, revenue: 5295 },
  { product_id: 'ref-1', product_name: 'Bosque', total_sold: 25, revenue: 6500 },
];

export const mockNewsletterSubs: NewsletterSubscriber[] = [
  { id: 'n1', email: 'cliente1@email.com', coupon_code: 'LOIE15-ABC', subscribed_at: '2025-02-01' },
  { id: 'n2', email: 'cliente2@email.com', coupon_code: 'LOIE15-DEF', subscribed_at: '2025-02-15' },
  { id: 'n3', email: 'cliente3@email.com', coupon_code: 'LOIE15-GHI', subscribed_at: '2025-03-01' },
];

export const mockCoupons: Coupon[] = [
  { id: 'cp1', code: 'LOIE15', discount_percent: 15, is_active: true, uses: 45, created_at: '2025-01-01' },
  { id: 'cp2', code: 'BEMVINDO10', discount_percent: 10, is_active: true, uses: 120, created_at: '2025-01-01' },
];

export const mockCollections: Collection[] = [
  {
    id: 'col1', slug: 'cotidianas', name: 'Cotidianas',
    description: 'Latinha de 160g, dois pavios. Aromas básicos muito bem feitos. Um presente perfeito como lembrança.',
    cover_image: imgCampos,
    numeral: 'I',
    detail: 'Latinha 160g · dois pavios',
    story: 'Uma breve apresentação da marca com um básico muito bem feito numa latinha aesthetic. Os aromas mais essenciais para o dia a dia. Um presente muito bom como lembrança.',
    price_label: 'a partir de R$ 72',
    is_active: true, sort_order: 0, created_at: '2025-06-01',
  },
  {
    id: 'col2', slug: 'sala-ou-estar', name: 'Sala',
    description: 'Copo transparente de 200g, um pavio. Criações autorais com óleos essenciais puros.',
    cover_image: imgPomar,
    numeral: 'II',
    detail: 'Copo 200g transparente · um pavio',
    story: 'Criações autorais com óleos essenciais puros. Cada fragrância foi desenvolvida para transformar a sala em um ambiente de presença e acolhimento.',
    price_label: 'a partir de R$ 172',
    is_active: true, sort_order: 1, created_at: '2025-06-01',
  },
  {
    id: 'col3', slug: 'refugio', name: 'Refúgio',
    description: 'Copo âmbar de 300g, um pavio. Composições aromáticas exclusivas com assinatura Loiê.',
    cover_image: imgBosque,
    numeral: 'III',
    detail: 'Copo âmbar 300g · um pavio',
    story: 'Um copo com presença e composições aromáticas exclusivas. Algumas criações autorais e outras com fragrâncias encomendadas e modificadas para ter a assinatura Loiê.',
    price_label: 'a partir de R$ 260',
    is_active: true, sort_order: 2, created_at: '2025-06-01',
  },
  {
    id: 'col4', slug: 'botanicas-e-florais', name: 'Botânicas & Florais',
    description: 'Copo de 400g, dois pavios. Aromas exclusivos para queimas longas e envolventes.',
    cover_image: imgEstela,
    numeral: 'IV',
    detail: 'Copo 400g · dois pavios',
    story: 'Aromas que consideramos exclusivos e ideais para queimas de dois pavios. Fragrâncias botânicas e florais que preenchem espaços maiores com sofisticação.',
    price_label: 'a partir de R$ 332',
    is_active: true, sort_order: 3, created_at: '2025-06-01',
  },
  {
    id: 'col-borrifadores', slug: 'borrifadores', name: 'Borrifadores',
    description: 'Sprays de ambiente com composições aromáticas autorais.',
    numeral: undefined,
    detail: undefined,
    story: undefined,
    price_label: undefined,
    is_active: false, sort_order: 99, created_at: '2025-06-01',
  },
];

export const mockCollabs: Collab[] = [
  { id: 'cb1', slug: 'atelie-ceramica', name: 'Ateliê Cerâmica', caption: 'Vasos artesanais × Loiê', description: 'Uma colaboração que une a tradição da cerâmica artesanal com as fragrâncias da Loiê.', images: [imgBosqueVid, imgPomarVid], is_active: true, sort_order: 0, created_at: '2025-01-15' },
  { id: 'cb2', slug: 'estudio-botanico', name: 'Estúdio Botânico', caption: 'Arranjos vivos × fragrâncias', description: 'Plantas, flores e aromas se encontram nesta collab que celebra a natureza.', images: [storageUrl('Cartao_Postal_Loie.mp4'), imgEstelaVid], is_active: true, sort_order: 1, created_at: '2025-02-01' },
  { id: 'cb3', slug: 'casa-de-cha', name: 'Casa de Chá', caption: 'Rituais de chá × velas', description: 'Dois rituais que se complementam: o chá e a vela.', images: [storageUrl('escritorio_cadeira__1_.mp4'), imgBosqueVid], is_active: true, sort_order: 2, created_at: '2025-02-15' },
  { id: 'cb4', slug: 'galeria-textil', name: 'Galeria Têxtil', caption: 'Tecidos naturais × aromas', description: 'Linho, algodão orgânico e fragrâncias exclusivas.', images: [imgEstelaVid, storageUrl('Cartao_Postal_Loie.mp4')], is_active: true, sort_order: 3, created_at: '2025-03-01' },
];
