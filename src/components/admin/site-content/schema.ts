/* Schema declarativo para os list_items por list_key.
 * Define quais campos cada item suporta e como editá-los. */

interface FieldSpec {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'video' | 'select' | 'product_ref' | 'url';
  options?: { value: string; label: string }[];
  bucket?: string;
}

export const LIST_FIELD_SCHEMAS: Record<string, FieldSpec[]> = {
  'home:hero:banners': [
    { key: 'url', label: 'Imagem (URL)', type: 'image', bucket: 'banner' },
  ],
  'home:produto_foco:slots': [
    { key: 'produto_id', label: 'Produto', type: 'product_ref' },
    { key: 'video_url', label: 'Vídeo (MP4, máx 50MB)', type: 'video', bucket: 'produtos' },
  ],
  'home:faq:perguntas': [
    { key: 'pergunta', label: 'Pergunta', type: 'text' },
    { key: 'resposta', label: 'Resposta', type: 'textarea' },
  ],
  'sobre:filosofia:pilares': [
    { key: 'label', label: 'Eyebrow', type: 'text' },
    { key: 'titulo', label: 'Título', type: 'text' },
    { key: 'texto', label: 'Texto', type: 'textarea' },
  ],
  'lembrancas:galeria_intercalada:blocos': [
    { key: 'imagem_url', label: 'Imagem', type: 'image', bucket: 'lembrancas' },
    { key: 'frase', label: 'Frase', type: 'textarea' },
    { key: 'posicao', label: 'Posição da imagem', type: 'select', options: [
      { value: 'esquerda', label: 'imagem à esquerda' },
      { value: 'direita', label: 'imagem à direita' },
    ]},
    { key: 'posicao_frase', label: 'Alinhamento da frase', type: 'select', options: [
      { value: 'esquerda', label: 'frase alinhada à esquerda' },
      { value: 'centro',   label: 'frase centralizada' },
      { value: 'direita',  label: 'frase alinhada à direita' },
    ]},
    { key: 'tema', label: 'Tema do bloco de texto', type: 'select', options: [
      { value: 'cream', label: 'cream (texto charcoal sobre cream)' },
      { value: 'charcoal', label: 'charcoal (texto cream sobre charcoal)' },
    ]},
  ],
  'lembrancas:conversao:cards': [
    { key: 'numeral', label: 'Numeral (01, 02…)', type: 'text' },
    { key: 'titulo', label: 'Título', type: 'text' },
    { key: 'descricao', label: 'Descrição', type: 'textarea' },
  ],
  'product_detail:benefits:itens': [
    { key: 'texto', label: 'Texto', type: 'text' },
    { key: 'icone', label: 'Ícone', type: 'select', options: [
      { value: 'truck', label: 'truck (frete)' },
      { value: 'refresh-cw', label: 'refresh-cw (troca)' },
      { value: 'leaf', label: 'leaf (sustentável)' },
      { value: 'package', label: 'package (lote)' },
    ]},
  ],
  'footer:colecao:links': [
    { key: 'rotulo', label: 'Rótulo', type: 'text' },
    { key: 'url', label: 'URL', type: 'url' },
  ],
  'footer:sobre:links': [
    { key: 'rotulo', label: 'Rótulo', type: 'text' },
    { key: 'url', label: 'URL', type: 'url' },
  ],
  'footer:contato:redes_sociais': [
    { key: 'nome', label: 'Nome (Instagram, Facebook, etc.)', type: 'text' },
    { key: 'url', label: 'URL', type: 'url' },
  ],
};

export function fieldsFor(pageKey: string, sectionKey: string, listKey: string): FieldSpec[] {
  return LIST_FIELD_SCHEMAS[`${pageKey}:${sectionKey}:${listKey}`] ?? [
    { key: 'valor', label: 'Valor', type: 'text' },
  ];
}

export interface PageMeta {
  key: string;
  label: string;
  /** Rota / contexto mostrado como hint. */
  hint: string;
}

export const PAGES: PageMeta[] = [
  { key: 'home',              label: 'Home',          hint: '/' },
  { key: 'sobre',             label: 'Sobre',         hint: '/sobre' },
  { key: 'produtos',          label: 'Produtos',      hint: '/produtos · catálogo geral' },
  { key: 'lembrancas',        label: 'Lembranças',    hint: '/lembrancas' },
  { key: 'product_detail',    label: 'Produto',       hint: '/product/:slug · textos globais' },
  { key: 'collection_detail', label: 'Coleção',       hint: '/colecoes/:slug · textos globais' },
  { key: 'footer',            label: 'Rodapé',        hint: 'componente global' },
];

/** Ordem em que as seções aparecem no site (de cima para baixo).
 *  Ditada pelo MAPEAMENTO_PAINEL.md. */
export const SECTION_ORDER: Record<string, string[]> = {
  home: [
    'hero',
    'bestsellers',
    'produto_foco',
    'descubra_novos_aromas',
    'colaboracoes',
    'faq',
  ],
  sobre: [
    'hero',
    'historia',
    'manifesto',
    'imagem_full_bleed',
    'filosofia',
    'cta_final',
  ],
  produtos: [
    'hero',
  ],
  lembrancas: [
    'hero',
    'storytelling',
    'galeria_intercalada',
    'conversao',
    'formulario',
  ],
  product_detail: [
    'dropdowns',
    'benefits',
    'relacionados',
    'ctas',
  ],
  collection_detail: [
    'nav',
    'outras_colecoes',
  ],
  footer: [
    'brand',
    'colecao',
    'sobre',
    'contato',
    'bottom_bar',
    'brand_signature',
  ],
};

export function orderSections(pageKey: string, available: Set<string>): string[] {
  const ordered = (SECTION_ORDER[pageKey] ?? []).filter((s) => available.has(s));
  const extras = Array.from(available).filter((s) => !ordered.includes(s)).sort();
  return [...ordered, ...extras];
}

export function sectionLabel(pageKey: string, sectionKey: string): string {
  const map: Record<string, string> = {
    'home:hero': 'Hero',
    'home:bestsellers': 'Bestsellers (mais pedidas)',
    'home:produto_foco': 'Produto Foco (vídeos)',
    'home:descubra_novos_aromas': 'Descubra novos aromas',
    'home:colaboracoes': 'Colaborações',
    'home:faq': 'FAQ',
    'sobre:hero': 'Hero',
    'sobre:historia': 'História',
    'sobre:manifesto': 'Manifesto',
    'sobre:imagem_full_bleed': 'Imagem full-bleed',
    'sobre:filosofia': 'Filosofia (3 pilares)',
    'sobre:cta_final': 'CTA final',
    'produtos:hero': 'Hero',
    'lembrancas:hero': 'Hero',
    'lembrancas:storytelling': 'Storytelling',
    'lembrancas:galeria_intercalada': 'Galeria intercalada',
    'lembrancas:conversao': 'Conversão (3 cards)',
    'lembrancas:formulario': 'Formulário',
    'product_detail:dropdowns': 'Labels dos dropdowns',
    'product_detail:benefits': 'Benefits',
    'product_detail:relacionados': 'Relacionados',
    'product_detail:ctas': 'CTAs (botões)',
    'collection_detail:nav': 'Navegação',
    'collection_detail:outras_colecoes': 'Outras coleções',
    'footer:brand': 'Brand (tagline)',
    'footer:colecao': 'Coluna Coleção',
    'footer:sobre': 'Coluna Sobre',
    'footer:contato': 'Coluna Contato',
    'footer:bottom_bar': 'Bottom bar',
    'footer:brand_signature': 'Brand signature',
  };
  return map[`${pageKey}:${sectionKey}`] ?? sectionKey;
}
