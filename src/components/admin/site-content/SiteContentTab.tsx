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
import { PAGES, sectionLabel, fieldsFor } from './schema';
import { Eye, EyeOff } from 'lucide-react';

type Product = Pick<Tables<'products'>, 'id' | 'name' | 'slug'>;
type Collection = Pick<Tables<'collections'>, 'id' | 'name' | 'slug'>;

/** Agrupa blocks por section_key. */
function groupBlocks(blocks: SiteContentBlock[]): Record<string, SiteContentBlock[]> {
  const out: Record<string, SiteContentBlock[]> = {};
  blocks.forEach((b) => {
    out[b.section_key] = out[b.section_key] ?? [];
    out[b.section_key].push(b);
  });
  return out;
}

/** Agrupa items por section_key:list_key */
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
  const { data: blocks = [], isLoading: loadingBlocks } = useSiteContentPage(pageKey);
  const { data: listItems = [], isLoading: loadingLists } = useSiteContentPageLists(pageKey);

  const updateBlock = useUpdateBlock(pageKey);
  const updateListItem = useUpdateListItem(pageKey);
  const insertListItem = useInsertListItem(pageKey);
  const deleteListItem = useDeleteListItem(pageKey);
  const reorderListItems = useReorderListItems(pageKey);
  const toggleSection = useUpdateSectionVisibility(pageKey);

  /* selects de produto/coleção globais */
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

  /** todas as section_keys conhecidas (blocks + listas) */
  const sectionKeys = useMemo(() => {
    const set = new Set<string>();
    Object.keys(grouped).forEach((k) => set.add(k));
    Object.keys(groupedLists).forEach((k) => set.add(k));
    return Array.from(set).sort();
  }, [grouped, groupedLists]);

  function sectionVisible(sectionKey: string): boolean {
    const blocksInSection = grouped[sectionKey] ?? [];
    if (blocksInSection.length === 0) return true;
    return blocksInSection.every((b) => b.is_visible);
  }

  return (
    <div className="space-y-6">
      {/* Page picker */}
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
          >
            {p.label}
          </button>
        ))}
      </div>

      {(loadingBlocks || loadingLists) && (
        <p className="text-xs text-muted-foreground">Carregando…</p>
      )}

      {!loadingBlocks && !loadingLists && sectionKeys.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          Nenhum conteúdo seedado para esta página ainda.
        </p>
      )}

      {/* Seções */}
      {sectionKeys.map((sectionKey) => {
        const sectionBlocks = grouped[sectionKey] ?? [];
        const listsInSection = groupedLists[sectionKey] ?? {};
        const visible = sectionVisible(sectionKey);
        const showVertical = SECTIONS_WITH_VERTICAL.has(`${pageKey}:${sectionKey}`);

        return (
          <details
            key={sectionKey}
            className="border border-border rounded-md bg-card/30"
            open={pageKey === 'home' && sectionKey === 'hero'}
          >
            <summary className="cursor-pointer px-4 py-3 flex items-center justify-between hover:bg-card/50 transition-colors">
              <span className="text-sm font-medium">{sectionLabel(pageKey, sectionKey)}</span>
              <span className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">
                  {sectionBlocks.length} bloco{sectionBlocks.length !== 1 ? 's' : ''} ·{' '}
                  {Object.keys(listsInSection).length} lista{Object.keys(listsInSection).length !== 1 ? 's' : ''}
                </span>
                {sectionBlocks.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSection.mutate({ sectionKey, isVisible: !visible });
                    }}
                    className="h-6 px-2 gap-1"
                  >
                    {visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span className="text-[10px]">{visible ? 'visível' : 'oculta'}</span>
                  </Button>
                )}
              </span>
            </summary>

            <div className="px-4 pb-4 space-y-4">
              {sectionBlocks.length > 0 && (
                <div className="space-y-3 pt-2">
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
                <div key={listKey} className="pt-2">
                  <ListItemsEditor
                    pageKey={pageKey}
                    sectionKey={sectionKey}
                    listKey={listKey}
                    items={items}
                    fields={fieldsFor(pageKey, sectionKey, listKey)}
                    products={products}
                    onCreate={async () => {
                      const fieldSpecs = fieldsFor(pageKey, sectionKey, listKey);
                      const emptyFields: Record<string, Json> = {};
                      fieldSpecs.forEach((f) => { emptyFields[f.key] = ''; });
                      await insertListItem.mutateAsync({ page_key: pageKey, section_key: sectionKey, list_key: listKey, fields: emptyFields });
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
            </div>
          </details>
        );
      })}
    </div>
  );
}

export default SiteContentTab;
