import type { Collection, Product } from '@/types';

export type Availability = 'estoque' | 'esgotado' | 'em-breve';

export interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number | null;
}

export const PRICE_RANGES: PriceRange[] = [
  { id: 'ate-100',    label: 'até R$ 100',    min: 0,   max: 100 },
  { id: '100-200',    label: 'R$ 100 – 200',  min: 100, max: 200 },
  { id: '200-300',    label: 'R$ 200 – 300',  min: 200, max: 300 },
  { id: 'acima-300',  label: 'acima de R$ 300', min: 300, max: null },
];

export const AVAILABILITY_OPTIONS: { id: Availability; label: string }[] = [
  { id: 'estoque',  label: 'em estoque' },
  { id: 'esgotado', label: 'esgotado' },
  { id: 'em-breve', label: 'em breve' },
];

// Famílias olfativas — leitura direta da coluna `olfactory_family` (text)
// preenchida pelo admin. O id é o valor exato no banco; o label é o que aparece
// na sidebar (lowercase, alinhado ao tom editorial do site).
export const OLFACTORY_FAMILIES: { id: string; label: string }[] = [
  { id: 'Cítricos & Frescos',    label: 'cítricos & frescos' },
  { id: 'Verdes & Herbais',      label: 'verdes & herbais' },
  { id: 'Florais',               label: 'florais' },
  { id: 'Amadeirados',           label: 'amadeirados' },
  { id: 'Especiados & Quentes',  label: 'especiados & quentes' },
  { id: 'Gourmand & Conforto',   label: 'gourmand & conforto' },
];

export const getProductAvailability = (product: Product): Availability => {
  if (product.status === 'em breve') return 'em-breve';
  if ((product.stock_quantity ?? 0) <= 0) return 'esgotado';
  return 'estoque';
};

export const getProductFamily = (product: Product): string | null =>
  product.olfactory_family ?? null;

export interface ProductFiltersState {
  categoria: string[];   // root collection slugs
  colecao:   string[];   // leaf collection slugs
  preco:     string[];   // PriceRange ids
  disp:      Availability[];
  familia:   string[];   // OLFACTORY_FAMILIES ids
  tam:       number[];   // weight_g values
  busca:     string;     // search term (lowercase)
}

export const emptyFilters: ProductFiltersState = {
  categoria: [], colecao: [], preco: [], disp: [], familia: [], tam: [], busca: '',
};

export const filtersFromParams = (params: URLSearchParams): ProductFiltersState => {
  const list = (key: string) => (params.get(key) ?? '').split(',').filter(Boolean);
  return {
    categoria: list('categoria'),
    colecao:   list('colecao'),
    preco:     list('preco'),
    disp:      list('disp').filter((v): v is Availability =>
                 v === 'estoque' || v === 'esgotado' || v === 'em-breve'),
    familia:   list('familia'),
    tam:       list('tam').map(Number).filter((n) => !Number.isNaN(n) && n > 0),
    busca:     (params.get('busca') ?? '').trim(),
  };
};

export const writeFiltersToParams = (
  params: URLSearchParams,
  filters: ProductFiltersState,
): URLSearchParams => {
  const next = new URLSearchParams(params);
  const setOrDel = (key: string, values: (string | number)[]) => {
    if (values.length === 0) next.delete(key);
    else next.set(key, values.join(','));
  };
  setOrDel('categoria', filters.categoria);
  setOrDel('colecao',   filters.colecao);
  setOrDel('preco',     filters.preco);
  setOrDel('disp',      filters.disp);
  setOrDel('familia',   filters.familia);
  setOrDel('tam',       filters.tam);
  if (filters.busca) next.set('busca', filters.busca);
  else next.delete('busca');
  return next;
};

export const countActive = (f: ProductFiltersState): number =>
  f.categoria.length + f.colecao.length + f.preco.length + f.disp.length +
  f.familia.length + f.tam.length + (f.busca ? 1 : 0);

// Map collection_slug → root_slug using the collections list (for category filter).
// Root collections (Velas/Borrifadores/Corpo) have parent_collection_id === null.
export const buildCategoryMap = (collections: Collection[]): Record<string, string> => {
  const byId: Record<string, Collection> = {};
  collections.forEach((c) => { byId[c.id] = c; });
  const map: Record<string, string> = {};
  collections.forEach((c) => {
    let cur: Collection | undefined = c;
    while (cur && cur.parent_collection_id) {
      const parent = byId[cur.parent_collection_id];
      if (!parent) break;
      cur = parent;
    }
    if (cur) map[c.slug] = cur.slug;
  });
  return map;
};

export const applyFilters = (
  products: Product[],
  filters: ProductFiltersState,
  categoryMap: Record<string, string>,
): Product[] => {
  const term = filters.busca.toLowerCase();
  return products.filter((p) => {
    if (term && !p.name.toLowerCase().includes(term)) return false;

    if (filters.colecao.length > 0) {
      if (!p.collection_slug || !filters.colecao.includes(p.collection_slug)) return false;
    }

    if (filters.categoria.length > 0) {
      const rootSlug = p.collection_slug ? categoryMap[p.collection_slug] : undefined;
      if (!rootSlug || !filters.categoria.includes(rootSlug)) return false;
    }

    if (filters.preco.length > 0) {
      const matched = filters.preco.some((id) => {
        const r = PRICE_RANGES.find((x) => x.id === id);
        if (!r) return false;
        return p.price >= r.min && (r.max === null || p.price < r.max);
      });
      if (!matched) return false;
    }

    if (filters.disp.length > 0) {
      if (!filters.disp.includes(getProductAvailability(p))) return false;
    }

    if (filters.familia.length > 0) {
      const fam = getProductFamily(p);
      if (!fam || !filters.familia.includes(fam)) return false;
    }

    if (filters.tam.length > 0) {
      if (!p.weight_g || !filters.tam.includes(p.weight_g)) return false;
    }

    return true;
  });
};
