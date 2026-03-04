import type { Product, Review, Order, Customer, KPIs, SalesTimeseriesPoint, TopProduct, NewsletterSubscriber, Coupon } from '@/types';
import product01 from '@/assets/product-01.jpg';
import product02 from '@/assets/product-02.jpg';
import product03 from '@/assets/product-03.jpg';
import product04 from '@/assets/product-04.jpg';

const images = [product01, product02, product03, product04];

export const mockProducts: Product[] = [
  {
    id: '1', slug: 'flor-de-laranjeira', name: 'Flor de Laranjeira', description: 'Vela artesanal com notas cítricas de flor de laranjeira, jasmim e musk branco. Perfeita para criar uma atmosfera luminosa e acolhedora.', details: 'Cera de soja 100% natural. Pavio de algodão. Duração aprox. 50h. Peso: 250g.', how_to_use: 'Acenda por no mínimo 1 hora na primeira utilização para derreter toda a superfície. Apare o pavio a 5mm antes de cada uso.', care_instructions: 'Mantenha longe de correntes de ar. Não queime por mais de 4 horas seguidas. Armazene em local fresco e seco.', price: 189, compare_at_price: 229, images: [product01, product01], collection: 'Cítricos', tags: ['floral', 'cítrico'], badge: 'sale', rating_avg: 4.8, rating_count: 47, is_bestseller: true, created_at: '2025-01-15'
  },
  {
    id: '2', slug: 'cedro-vetiver', name: 'Cedro & Vetiver', description: 'Blend amadeirado de cedro atlas, vetiver e patchouli. Profundidade e elegância em cada queima.', details: 'Cera de soja. Pavio de algodão. Duração aprox. 50h. Peso: 250g.', how_to_use: 'Acenda e aproveite. Apare o pavio regularmente.', care_instructions: 'Local fresco e seco.', price: 199, images: [product02, product02], collection: 'Amadeirados', tags: ['amadeirado', 'masculino'], badge: 'new', rating_avg: 4.9, rating_count: 32, is_bestseller: true, created_at: '2025-02-01'
  },
  {
    id: '3', slug: 'lavanda-provencal', name: 'Lavanda Provençal', description: 'A serenidade dos campos de lavanda da Provença, com toques de eucalipto e camomila.', details: 'Cera de soja. Pavio de algodão. Duração aprox. 50h. Peso: 250g.', how_to_use: 'Ideal para momentos de relaxamento.', care_instructions: 'Evite exposição direta ao sol.', price: 179, images: [product03, product03], collection: 'Herbais', tags: ['herbal', 'relaxante'], rating_avg: 4.7, rating_count: 58, is_bestseller: true, created_at: '2025-01-20'
  },
  {
    id: '4', slug: 'rosa-oud', name: 'Rosa & Oud', description: 'Combinação opulenta de rosa damascena e oud. Uma fragrância intensa e sofisticada.', details: 'Cera de soja. Pavio de algodão. Duração aprox. 50h. Peso: 250g.', how_to_use: 'Perfeita para ocasiões especiais.', care_instructions: 'Armazene com tampa.', price: 249, compare_at_price: 299, images: [product04, product04], collection: 'Orientais', tags: ['oriental', 'luxo'], badge: 'limited', rating_avg: 5.0, rating_count: 19, is_bestseller: false, created_at: '2025-03-01'
  },
  {
    id: '5', slug: 'baunilha-tonka', name: 'Baunilha & Tonka', description: 'Doçura envolvente de baunilha de Madagascar com fava tonka e um toque de caramelo.', details: 'Cera de soja. Pavio de algodão. Duração aprox. 50h. Peso: 250g.', how_to_use: 'Acenda em ambientes aconchegantes.', care_instructions: 'Mantenha longe de crianças e pets.', price: 189, images: [product01, product02], collection: 'Gourmand', tags: ['doce', 'gourmand'], rating_avg: 4.6, rating_count: 41, is_bestseller: true, created_at: '2025-02-10'
  },
  {
    id: '6', slug: 'figo-mediterraneo', name: 'Figo Mediterrâneo', description: 'Frescor verde de folhas de figueira, figo maduro e madeira de cedro. Um passeio pelo Mediterrâneo.', details: 'Cera de soja. Pavio de algodão. Duração aprox. 50h. Peso: 250g.', how_to_use: 'Ideal para escritórios e salas.', care_instructions: 'Local ventilado.', price: 199, images: [product03, product04], collection: 'Cítricos', tags: ['verde', 'fresco'], badge: 'new', rating_avg: 4.8, rating_count: 23, is_bestseller: false, created_at: '2025-03-10'
  },
  {
    id: '7', slug: 'sândalo-amber', name: 'Sândalo & Âmbar', description: 'Calor cremoso de sândalo australiano com âmbar dourado e um sopro de incenso.', details: 'Cera de soja. Pavio de algodão. Duração aprox. 50h. Peso: 250g.', how_to_use: 'Ideal para meditação.', care_instructions: 'Mantenha o pavio centralizado.', price: 219, images: [product02, product03], collection: 'Orientais', tags: ['amadeirado', 'oriental'], rating_avg: 4.9, rating_count: 37, is_bestseller: true, created_at: '2025-01-05'
  },
  {
    id: '8', slug: 'alecrim-salvia', name: 'Alecrim & Sálvia', description: 'Herbáceo vibrante com alecrim fresco, sálvia e um fundo de musgo de carvalho.', details: 'Cera de soja. Pavio de algodão. Duração aprox. 50h. Peso: 250g.', how_to_use: 'Perfeita para energizar o ambiente.', care_instructions: 'Não deixe sem supervisão.', price: 169, images: [product04, product01], collection: 'Herbais', tags: ['herbal', 'energizante'], rating_avg: 4.5, rating_count: 29, is_bestseller: false, created_at: '2025-02-20'
  },
];

export const mockReviews: Review[] = [
  { id: '1', product_id: '1', author: 'Maria S.', rating: 5, title: 'Perfume incrível!', body: 'A fragrância preenche todo o ambiente. Duração excelente.', created_at: '2025-02-15' },
  { id: '2', product_id: '1', author: 'João P.', rating: 5, title: 'Presente perfeito', body: 'Comprei para presentear e a embalagem é linda. Super recomendo.', created_at: '2025-02-20' },
  { id: '3', product_id: '1', author: 'Ana L.', rating: 4, title: 'Muito boa', body: 'Gostei bastante, só achei o aroma um pouco sutil no início.', created_at: '2025-03-01' },
];

export const mockOrders: Order[] = [
  { id: 'ORD-001', status: 'delivered', customer: { name: 'Maria Silva', email: 'maria@email.com', phone: '11999887766' }, items: [{ product_id: '1', product_name: 'Flor de Laranjeira', price: 189, quantity: 2, image: product01 }], subtotal: 378, shipping_cost: 0, total: 378, created_at: '2025-02-10' },
  { id: 'ORD-002', status: 'shipped', customer: { name: 'João Pereira', email: 'joao@email.com', phone: '21988776655' }, items: [{ product_id: '2', product_name: 'Cedro & Vetiver', price: 199, quantity: 1 }, { product_id: '3', product_name: 'Lavanda Provençal', price: 179, quantity: 1 }], subtotal: 378, shipping_cost: 19.9, total: 397.9, created_at: '2025-03-01' },
  { id: 'ORD-003', status: 'pending', customer: { name: 'Ana Lima', email: 'ana@email.com', phone: '31977665544' }, items: [{ product_id: '4', product_name: 'Rosa & Oud', price: 249, quantity: 1 }], subtotal: 249, shipping_cost: 19.9, total: 268.9, created_at: '2025-03-15' },
];

export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Maria Silva', email: 'maria@email.com', phone: '11999887766', orders_count: 5, total_spent: 1245, created_at: '2024-11-01' },
  { id: 'c2', name: 'João Pereira', email: 'joao@email.com', phone: '21988776655', orders_count: 3, total_spent: 789, created_at: '2025-01-15' },
  { id: 'c3', name: 'Ana Lima', email: 'ana@email.com', phone: '31977665544', orders_count: 1, total_spent: 268.9, created_at: '2025-03-10' },
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
  { product_id: '1', product_name: 'Flor de Laranjeira', total_sold: 47, revenue: 8883 },
  { product_id: '7', product_name: 'Sândalo & Âmbar', total_sold: 37, revenue: 8103 },
  { product_id: '2', product_name: 'Cedro & Vetiver', total_sold: 32, revenue: 6368 },
  { product_id: '5', product_name: 'Baunilha & Tonka', total_sold: 29, revenue: 5481 },
  { product_id: '3', product_name: 'Lavanda Provençal', total_sold: 25, revenue: 4475 },
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
