/** Famílias aromáticas — mapeamento estático slug → família */
export const FAMILIES: { label: string; products: { name: string; slug: string }[] }[] = [
  { label: 'cítricos e frescos', products: [
    { name: 'Campos', slug: 'campos' },
    { name: 'Citronela', slug: 'citronela-refugio' },
    { name: 'Pomar', slug: 'pomar' },
  ]},
  { label: 'verdes e verbais', products: [
    { name: 'Bosque', slug: 'bosque' },
    { name: 'Gin', slug: 'gin' },
    { name: 'Tabaco', slug: 'tabaco' },
  ]},
  { label: 'florais', products: [
    { name: 'Estela', slug: 'estela' },
    { name: 'Gardênia', slug: 'gardenia' },
    { name: 'Margarida', slug: 'margarida' },
    { name: 'Ícaro', slug: 'icaro' },
    { name: 'Dulce', slug: 'dulce' },
  ]},
  { label: 'amadeirados', products: [
    { name: 'Pomar', slug: 'pomar' },
    { name: 'Ritual', slug: 'ritual' },
    { name: 'Toca', slug: 'toca' },
  ]},
  { label: 'especiados e quentes', products: [
    { name: 'Gin', slug: 'gin' },
    { name: 'Gabriela', slug: 'gabriela' },
    { name: 'Ícaro', slug: 'icaro' },
    { name: 'Ame', slug: 'ame' },
    { name: 'Bosque', slug: 'bosque' },
    { name: 'Ritual', slug: 'ritual' },
  ]},
  { label: 'gourmand e conforto', products: [
    { name: 'Dulce', slug: 'dulce' },
    { name: 'Caramelo', slug: 'caramelo' },
    { name: 'Gin', slug: 'gin' },
    { name: 'Tabaco', slug: 'tabaco' },
    { name: 'Oceano', slug: 'oceano' },
  ]},
];
