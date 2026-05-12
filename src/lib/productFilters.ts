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

// Famílias olfativas derivadas do campo `accord` dos produtos. Lista curada
// a partir dos acordes existentes no banco; quando admin formalizar isso em
// schema próprio (ver PR description), trocar este array por leitura direta.
export const OLFACTORY_FAMILIES: { id: string; label: string; match: RegExp }[] = [
  { id: 'citrico',     label: 'cítrico',     match: /c[ií]tric/i },
  { id: 'herbal',      label: 'herbal',      match: /herbal/i },
  { id: 'amadeirado',  label: 'amadeirado',  match: /amadeirad/i },
  { id: 'floral',      label: 'floral',      match: /floral/i },
  { id: 'especiado',   label: 'especiado',   match: /especiad/i },
  { id: 'verde',       label: 'verde',       match: /\bverde\b/i },
  { id: 'aquatico',    label: 'aquático',    match: /aqu[áa]tic/i },
  { id: 'mineral',     label: 'mineral',     match: /mineral/i },
  { id: 'ambarado',    label: 'ambarado',    match: /amb[ae]rad/i },
  { id: 'frutado',     label: 'frutado',     match: /frutad/i },
  { id: 'chipre',      label: 'chipre',      match: /chipre/i },
  { id: 'terroso',     label: 'terroso',     match: /terros/i },
  { id: 'almiscarado', label: 'almiscarado', match: /almiscarad/i },
  { id: 'canforado',   label: 'canforado',   match: /canforad/i },
  { id: 'resinoso',    label: 'resinoso',    match: /resinos/i },
  { id: 'couro',       label: 'couro',       match: /\bcouro\b/i },
  { id: 'cremoso',     label: 'cremoso',     match: /cremos/i },
];

export const getProductAvailability = (product: Product): Availability => {
  if (product.status === 'em breve') return 'em-breve';
  if ((product.stock_quantity ?? 0) <= 0) return 'esgotado';
  return 'estoque';
};

export const getProductFamilies = (accord: string | undefined | null): string[] => {
  if (!accord) return [];
  return OLFACTORY_FAMILIES.filter((f) => f.match.test(accord)).map((f) => f.id);
};

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
      const fams = getProductFamilies(p.accord);
      if (!fams.some((f) => filters.familia.includes(f))) return false;
    }

    if (filters.tam.length > 0) {
      if (!p.weight_g || !filters.tam.includes(p.weight_g)) return false;
    }

    return true;
  });
};
