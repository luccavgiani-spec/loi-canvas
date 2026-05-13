import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  useSiteContentPage,
  useSiteContentPageLists,
  useUpdateBlock,
  useUpdateListItem,
  useInsertListItem,
  useDeleteListItem,
  useReorderListItems,
  useUpdateSectionVisibility,
} from '@/lib/site-content/hooks';
import type { SiteContentBlock, SiteContentListItem } from '@/lib/site-content/types';
import type { Json } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import BlockEditor from './BlockEditor';
import ListItemsEditor from './ListItemsEditor';
import { PAGES, sectionLabel, fieldsFor, orderSections } from './schema';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';

type Product = Pick<Tables<'products'>, 'id' | 'name' | 'slug'>;
type Collection = Pick<Tables<'collections'>, 'id' | 'name' | 'slug'>;

function groupBlocks(blocks: SiteContentBlock[]): Record<string, SiteContentBlock[]> {
  const out: Record<string, SiteContentBlock[]> = {};
  blocks.forEach((b) => {
    out[b.section_key] = out[b.section_key] ?? [];
    out[b.section_key].push(b);
  });
  return out;
}

function groupListItems(items: SiteContentListItem[]): Record<string, Record<string, SiteContentListItem[]>> {
  const out: Record<string, Record<string, SiteContentListItem[]>> = {};
  items.forEach((it) => {
    out[it.section_key] = out[it.section_key] ?? {};
    out[it.section_key][it.list_key] = out[it.section_key][it.list_key] ?? [];
    out[it.section_key][it.list_key].push(it);
  });
  return out;
}

const SECTIONS_WITH_VERTICAL = new Set([
  'lembrancas:hero',
  'lembrancas:galeria_intercalada',
  'sobre:hero',
]);

export function SiteContentTab() {
  const [pageKey, setPageKey] = useState<string>('home');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const { data: blocks = [], isLoading: loadingBlocks } = useSiteContentPage(pageKey);
  const { data: listItems = [], isLoading: loadingLists } = useSiteContentPageLists(pageKey);

  const updateBlock = useUpdateBlock(pageKey);
  const updateListItem = useUpdateListItem(pageKey);
  const insertListItem = useInsertListItem(pageKey);
  const deleteListItem = useDeleteListItem(pageKey);
  const reorderListItems = useReorderListItems(pageKey);
  const toggleSection = useUpdateSectionVisibility(pageKey);

  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  useEffect(() => {
    supabase.from('products').select('id, name, slug').order('name').then(({ data }) => {
      if (data) setProducts(data);
    });
    supabase.from('collections').select('id, name, slug').order('name').then(({ data }) => {
      if (data) setCollections(data);
    });
  }, []);

  const grouped = useMemo(() => groupBlocks(blocks), [blocks]);
  const groupedLists = useMemo(() => groupListItems(listItems), [listItems]);

  /** Seções na ordem em que aparecem no site (SECTION_ORDER). */
  const sectionKeys = useMemo(() => {
    const set = new Set<string>();
    Object.keys(grouped).forEach((k) => set.add(k));
    Object.keys(groupedLists).forEach((k) => set.add(k));
    return orderSections(pageKey, set);
  }, [grouped, groupedLists, pageKey]);

  /** Seleciona automaticamente a primeira seção ao trocar de página. */
  useEffect(() => {
    if (sectionKeys.length === 0) {
      setActiveSection(null);
      return;
    }
    if (!activeSection || !sectionKeys.includes(activeSection)) {
      setActiveSection(sectionKeys[0]);
    }
  }, [sectionKeys, activeSection]);

  function sectionVisible(sectionKey: string): boolean {
    const blocksInSection = grouped[sectionKey] ?? [];
    if (blocksInSection.length === 0) return true;
    return blocksInSection.every((b) => b.is_visible);
  }

  const currentPage = PAGES.find((p) => p.key === pageKey);
  const sectionBlocks = activeSection ? (grouped[activeSection] ?? []) : [];
  const listsInSection = activeSection ? (groupedLists[activeSection] ?? {}) : {};
  const showVertical = !!activeSection && SECTIONS_WITH_VERTICAL.has(`${pageKey}:${activeSection}`);

  return (
    <div className="space-y-4">
      {/* Page picker — pills no topo */}
      <div className="flex flex-wrap gap-2">
        {PAGES.map((p) => (
          <button
            key={p.key}
            onClick={() => setPageKey(p.key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              pageKey === p.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
            title={p.hint}
          >
            {p.label}
          </button>
        ))}
      </div>

      {currentPage && (
        <p className="text-[11px] text-muted-foreground/80 -mt-1">
          editando: <span className="font-medium">{currentPage.label}</span>
          {' '}·{' '}<span className="font-mono">{currentPage.hint}</span>
        </p>
      )}

      {(loadingBlocks || loadingLists) && (
        <p className="text-xs text-muted-foreground">Carregando…</p>
      )}

      {!loadingBlocks && !loadingLists && sectionKeys.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          Nenhum conteúdo seedado para esta página ainda.
        </p>
      )}

      {sectionKeys.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 border-t border-border pt-4">
          {/* ── Sidebar de seções ── */}
          <aside className="md:sticky md:top-4 self-start space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 px-2">
              Seções da página
            </p>
            <nav className="flex flex-row flex-wrap md:flex-col gap-1">
              {sectionKeys.map((sk) => {
                const isActive = sk === activeSection;
                const visible = sectionVisible(sk);
                const nBlocks = (grouped[sk] ?? []).length;
                const nLists = Object.keys(groupedLists[sk] ?? {}).length;
                return (
                  <button
                    key={sk}
                    onClick={() => setActiveSection(sk)}
                    className={`group flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-xs transition-colors ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <ChevronRight
                      size={12}
                      className={`flex-shrink-0 transition-transform ${isActive ? 'rotate-90 text-foreground' : 'text-muted-foreground/40'}`}
                    />
                    <span className="flex-1 truncate">{sectionLabel(pageKey, sk)}</span>
                    {!visible && <EyeOff size={11} className="text-muted-foreground/60" />}
                    <span className="text-[9px] text-muted-foreground/60 tabular-nums">
                      {nBlocks + nLists}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ── Painel direito: editor da seção ativa ── */}
          <div className="min-w-0 space-y-4">
            {activeSection && (
              <>
                <header className="flex items-center justify-between gap-3 pb-2 border-b border-border">
                  <div>
                    <h3 className="text-base font-medium">{sectionLabel(pageKey, activeSection)}</h3>
                    <p className="text-[10px] text-muted-foreground/70 font-mono">
                      {pageKey} › {activeSection}
                    </p>
                  </div>
                  {sectionBlocks.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const wasVisible = sectionVisible(activeSection);
                        toggleSection.mutate({ sectionKey: activeSection, isVisible: !wasVisible });
                      }}
                      className="gap-1"
                    >
                      {sectionVisible(activeSection) ? (
                        <><Eye size={14} /> seção visível no site</>
                      ) : (
                        <><EyeOff size={14} /> seção oculta</>
                      )}
                    </Button>
                  )}
                </header>

                {sectionBlocks.length > 0 && (
                  <div className="space-y-3">
                    {sectionBlocks.map((block) => (
                      <BlockEditor
                        key={block.id}
                        block={block}
                        products={products}
                        collections={collections}
                        showVertical={showVertical}
                        onSave={async (input) => {
                          await updateBlock.mutateAsync(input);
                        }}
                      />
                    ))}
                  </div>
                )}

                {Object.entries(listsInSection).map(([listKey, items]) => (
                  <div key={listKey} className="border-t border-border pt-4 mt-4">
                    <ListItemsEditor
                      pageKey={pageKey}
                      sectionKey={activeSection}
                      listKey={listKey}
                      items={items}
                      fields={fieldsFor(pageKey, activeSection, listKey)}
                      products={products}
                      onCreate={async () => {
                        const fieldSpecs = fieldsFor(pageKey, activeSection, listKey);
                        const emptyFields: Record<string, Json> = {};
                        fieldSpecs.forEach((f) => { emptyFields[f.key] = ''; });
                        await insertListItem.mutateAsync({ page_key: pageKey, section_key: activeSection, list_key: listKey, fields: emptyFields });
                      }}
                      onUpdate={async (id, fields) => {
                        await updateListItem.mutateAsync({ id, fields });
                      }}
                      onDelete={async (id) => {
                        await deleteListItem.mutateAsync(id);
                      }}
                      onReorder={async (ids) => {
                        await reorderListItems.mutateAsync(ids);
                      }}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SiteContentTab;
