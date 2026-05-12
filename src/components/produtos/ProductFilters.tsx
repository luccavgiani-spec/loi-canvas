import { useMemo, useState } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Collection, Product } from '@/types';
import {
  AVAILABILITY_OPTIONS,
  OLFACTORY_FAMILIES,
  PRICE_RANGES,
  countActive,
  emptyFilters,
  getProductFamily,
  type Availability,
  type ProductFiltersState,
} from '@/lib/productFilters';

interface Props {
  products: Product[];
  collections: Collection[];
  filters: ProductFiltersState;
  onChange: (next: ProductFiltersState) => void;
}

const LABEL_STYLE = {
  fontFamily: "'Sackers Gothic Std', 'Sackers Gothic', sans-serif",
  fontWeight: 200,
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  fontSize: '0.62rem',
  color: '#29241f',
};

const ITEM_STYLE = {
  fontFamily: "var(--font-body)",
  fontWeight: 300,
  fontSize: '0.78rem',
  color: 'rgba(41,36,31,0.8)',
  letterSpacing: '0.02em',
};

const COUNT_STYLE = {
  fontFamily: "var(--font-body)",
  fontWeight: 300,
  fontSize: '0.7rem',
  color: 'rgba(41,36,31,0.35)',
};

const toggle = <T,>(arr: T[], value: T): T[] =>
  arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

interface RowProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  count?: number;
  disabled?: boolean;
  indent?: boolean;
}

const FilterRow = ({ checked, onToggle, label, count, disabled, indent }: RowProps) => (
  <label
    className="flex items-center justify-between py-1.5 cursor-pointer group"
    style={{ paddingLeft: indent ? 14 : 0, opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
  >
    <span className="flex items-center gap-2.5 min-w-0">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        className="appearance-none w-3.5 h-3.5 rounded-[2px] border border-[rgba(41,36,31,0.35)] checked:bg-[#565600] checked:border-[#565600] transition-colors cursor-inherit flex-shrink-0"
        style={{
          backgroundImage:
            checked
              ? `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none'><path d='M2.5 6.2 5 8.5l4.5-5' stroke='%23f4edd2' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>")`
              : undefined,
          backgroundSize: '100% 100%',
        }}
      />
      <span style={ITEM_STYLE} className="truncate group-hover:text-[#565600] transition-colors">
        {label}
      </span>
    </span>
    {typeof count === 'number' && (
      <span style={COUNT_STYLE}>({count})</span>
    )}
  </label>
);

const FiltersBody = ({ products, collections, filters, onChange }: Props) => {
  // Build hierarchy: root collections (Velas/Borrifadores/Corpo) + their leaves
  const { roots, leavesByRoot, productCountByCollection, familyCount, sizeCount, availabilityCount, priceCount } =
    useMemo(() => {
      const roots = collections
        .filter((c) => c.is_active && c.parent_collection_id == null)
        .sort((a, b) => a.sort_order - b.sort_order);

      const byParent: Record<string, Collection[]> = {};
      collections.forEach((c) => {
        if (c.parent_collection_id) {
          (byParent[c.parent_collection_id] ||= []).push(c);
        }
      });
      Object.values(byParent).forEach((list) => list.sort((a, b) => a.sort_order - b.sort_order));

      const leavesByRoot: Record<string, Collection[]> = {};
      roots.forEach((r) => { leavesByRoot[r.slug] = byParent[r.id] || []; });

      const productCountByCollection: Record<string, number> = {};
      products.forEach((p) => {
        if (p.collection_slug) {
          productCountByCollection[p.collection_slug] =
            (productCountByCollection[p.collection_slug] || 0) + 1;
        }
      });

      const familyCount: Record<string, number> = {};
      products.forEach((p) => {
        const fam = getProductFamily(p);
        if (fam) familyCount[fam] = (familyCount[fam] || 0) + 1;
      });

      const sizeCount: Record<number, number> = {};
      products.forEach((p) => {
        if (p.weight_g && p.weight_g > 0) {
          sizeCount[p.weight_g] = (sizeCount[p.weight_g] || 0) + 1;
        }
      });

      const availabilityCount: Record<Availability, number> = { estoque: 0, esgotado: 0, 'em-breve': 0 };
      products.forEach((p) => {
        const s = p.status === 'em breve'
          ? 'em-breve'
          : (p.stock_quantity ?? 0) <= 0 ? 'esgotado' : 'estoque';
        availabilityCount[s as Availability]++;
      });

      const priceCount: Record<string, number> = {};
      PRICE_RANGES.forEach((r) => {
        priceCount[r.id] = products.filter(
          (p) => p.price >= r.min && (r.max === null || p.price < r.max),
        ).length;
      });

      return { roots, leavesByRoot, productCountByCollection, familyCount, sizeCount, availabilityCount, priceCount };
    }, [products, collections]);

  const sortedSizes = useMemo(
    () => Object.keys(sizeCount).map(Number).sort((a, b) => a - b),
    [sizeCount],
  );

  return (
    <Accordion type="multiple" defaultValue={['categoria', 'colecao', 'preco', 'disp', 'familia', 'tam']} className="w-full">
      {/* Categoria */}
      <AccordionItem value="categoria" className="border-b border-[rgba(41,36,31,0.1)]">
        <AccordionTrigger className="hover:no-underline py-4" style={LABEL_STYLE}>
          categoria
        </AccordionTrigger>
        <AccordionContent>
          <div className="pt-1 pb-2 space-y-0.5">
            {roots.map((root) => (
              <FilterRow
                key={root.slug}
                checked={filters.categoria.includes(root.slug)}
                onToggle={() => onChange({ ...filters, categoria: toggle(filters.categoria, root.slug) })}
                label={root.name.toLowerCase()}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Coleção (hierárquica) */}
      <AccordionItem value="colecao" className="border-b border-[rgba(41,36,31,0.1)]">
        <AccordionTrigger className="hover:no-underline py-4" style={LABEL_STYLE}>
          coleção
        </AccordionTrigger>
        <AccordionContent>
          <div className="pt-1 pb-2 space-y-3">
            {roots.map((root) => {
              const leaves = leavesByRoot[root.slug] || [];
              if (leaves.length === 0) return null;
              return (
                <div key={root.slug}>
                  <p style={{ ...COUNT_STYLE, color: 'rgba(41,36,31,0.55)', marginBottom: 4, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    {root.name.toLowerCase()}
                  </p>
                  <div className="space-y-0.5">
                    {leaves.map((leaf) => (
                      <FilterRow
                        key={leaf.slug}
                        indent
                        checked={filters.colecao.includes(leaf.slug)}
                        onToggle={() => onChange({ ...filters, colecao: toggle(filters.colecao, leaf.slug) })}
                        label={leaf.name.toLowerCase()}
                        count={productCountByCollection[leaf.slug] ?? 0}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Faixa de preço */}
      <AccordionItem value="preco" className="border-b border-[rgba(41,36,31,0.1)]">
        <AccordionTrigger className="hover:no-underline py-4" style={LABEL_STYLE}>
          faixa de preço
        </AccordionTrigger>
        <AccordionContent>
          <div className="pt-1 pb-2 space-y-0.5">
            {PRICE_RANGES.map((r) => (
              <FilterRow
                key={r.id}
                checked={filters.preco.includes(r.id)}
                onToggle={() => onChange({ ...filters, preco: toggle(filters.preco, r.id) })}
                label={r.label}
                count={priceCount[r.id] ?? 0}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Disponibilidade */}
      <AccordionItem value="disp" className="border-b border-[rgba(41,36,31,0.1)]">
        <AccordionTrigger className="hover:no-underline py-4" style={LABEL_STYLE}>
          disponibilidade
        </AccordionTrigger>
        <AccordionContent>
          <div className="pt-1 pb-2 space-y-0.5">
            {AVAILABILITY_OPTIONS.map((opt) => (
              <FilterRow
                key={opt.id}
                checked={filters.disp.includes(opt.id)}
                onToggle={() => onChange({ ...filters, disp: toggle(filters.disp, opt.id) })}
                label={opt.label}
                count={availabilityCount[opt.id] ?? 0}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Família olfativa */}
      <AccordionItem value="familia" className="border-b border-[rgba(41,36,31,0.1)]">
        <AccordionTrigger className="hover:no-underline py-4" style={LABEL_STYLE}>
          família olfativa
        </AccordionTrigger>
        <AccordionContent>
          <div className="pt-1 pb-2 space-y-0.5">
            {OLFACTORY_FAMILIES.map((f) => {
              const count = familyCount[f.id] ?? 0;
              return (
                <FilterRow
                  key={f.id}
                  checked={filters.familia.includes(f.id)}
                  onToggle={() => onChange({ ...filters, familia: toggle(filters.familia, f.id) })}
                  label={f.label}
                  count={count}
                  disabled={count === 0}
                />
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Tamanho */}
      <AccordionItem value="tam" className="border-b-0">
        <AccordionTrigger className="hover:no-underline py-4" style={LABEL_STYLE}>
          tamanho
        </AccordionTrigger>
        <AccordionContent>
          <div className="pt-1 pb-2 space-y-0.5">
            {sortedSizes.length === 0 ? (
              <p style={{ ...ITEM_STYLE, color: 'rgba(41,36,31,0.4)' }}>—</p>
            ) : (
              sortedSizes.map((g) => (
                <FilterRow
                  key={g}
                  checked={filters.tam.includes(g)}
                  onToggle={() => onChange({ ...filters, tam: toggle(filters.tam, g) })}
                  label={`${g} g`}
                  count={sizeCount[g]}
                />
              ))
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const ClearAllButton = ({
  filters, onClear,
}: { filters: ProductFiltersState; onClear: () => void }) => {
  const active = countActive(filters);
  if (active === 0) return null;
  return (
    <button
      onClick={onClear}
      className="inline-flex items-center gap-1.5 mt-3"
      style={{
        fontFamily: "var(--font-body)",
        fontWeight: 300,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontSize: '0.6rem',
        color: '#565600',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <X size={11} />
      limpar filtros ({active})
    </button>
  );
};

// ── Sidebar (desktop) ───────────────────────────────────────────────────────
export const ProductFiltersSidebar = (props: Props) => (
  <aside className="hidden lg:block sticky top-24 self-start" style={{ width: 240 }}>
    <div className="flex items-center justify-between mb-2">
      <h2 style={{ ...LABEL_STYLE, fontSize: '0.7rem' }}>filtros</h2>
    </div>
    <FiltersBody {...props} />
    <ClearAllButton filters={props.filters} onClear={() => props.onChange(emptyFilters)} />
  </aside>
);

// ── Sheet (mobile/tablet) ───────────────────────────────────────────────────
export const ProductFiltersMobile = (props: Props) => {
  const [open, setOpen] = useState(false);
  const active = countActive(props.filters);
  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="inline-flex items-center gap-2 px-4 py-2"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontSize: '0.65rem',
              color: '#29241f',
              background: 'rgba(41,36,31,0.06)',
              border: '1px solid rgba(41,36,31,0.15)',
            }}
            aria-label="Abrir filtros"
          >
            <SlidersHorizontal size={13} />
            <span>filtros</span>
            {active > 0 && (
              <span
                className="inline-flex items-center justify-center"
                style={{
                  background: '#565600',
                  color: '#f4edd2',
                  borderRadius: '999px',
                  minWidth: 18,
                  height: 18,
                  padding: '0 6px',
                  fontSize: '0.6rem',
                  fontWeight: 400,
                }}
              >
                {active}
              </span>
            )}
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[88vw] sm:max-w-sm overflow-y-auto" style={{ background: '#fcf5e0' }}>
          <SheetTitle style={{ ...LABEL_STYLE, fontSize: '0.75rem', marginBottom: 8 }}>
            filtros
          </SheetTitle>
          <FiltersBody {...props} />
          <ClearAllButton filters={props.filters} onClear={() => props.onChange(emptyFilters)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};
