import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChevronUp, ChevronDown, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';
import type { SiteContentListItem } from '@/lib/site-content/types';
import type { Tables } from '@/integrations/supabase/types';
import { uploadAsset } from '@/lib/site-content/api';

type Product = Pick<Tables<'products'>, 'id' | 'name' | 'slug'>;

interface FieldSpec {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'video' | 'select' | 'product_ref' | 'url';
  options?: { value: string; label: string }[];
  bucket?: string;
}

interface Props {
  pageKey: string;
  sectionKey: string;
  listKey: string;
  items: SiteContentListItem[];
  /** schema declarativo dos campos que esta lista aceita. */
  fields: FieldSpec[];
  /** referenciado quando há campo product_ref. */
  products?: Product[];
  onCreate: () => Promise<void> | void;
  onUpdate: (id: string, fields: Record<string, Json>) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onReorder: (ids: string[]) => Promise<void> | void;
}

const fieldLabelCls = 'block text-xs uppercase tracking-wider text-muted-foreground mb-1.5';

const FieldEditor = ({
  spec, value, onChange, products, bucketHint,
}: {
  spec: FieldSpec;
  value: Json | undefined;
  onChange: (v: Json) => void;
  products?: Product[];
  bucketHint?: string;
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const str = typeof value === 'string' ? value : '';

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (spec.type === 'video' && file.size > 50 * 1024 * 1024) {
      toast({ title: 'Vídeo acima de 50MB.', variant: 'destructive' });
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const bucket = spec.bucket ?? bucketHint ?? 'produtos';
      const url = await uploadAsset(bucket, file);
      onChange(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha no upload';
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }

  if (spec.type === 'textarea') {
    return <Textarea value={str} onChange={(e) => onChange(e.target.value)} className="text-base min-h-[120px]" />;
  }
  if (spec.type === 'select') {
    return (
      <select className="w-full border border-border rounded-md px-3 py-2 text-base bg-transparent" value={str} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {spec.options?.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }
  if (spec.type === 'image' || spec.type === 'video') {
    return (
      <div className="space-y-2">
        {str && (
          spec.type === 'image'
            ? <img src={str} alt="" className="max-h-32 border border-border rounded" />
            : <video src={str} controls className="max-h-32 border border-border rounded" />
        )}
        <div className="flex items-center gap-2">
          <Input type="file" accept={spec.type === 'image' ? 'image/*' : 'video/mp4'} disabled={uploading} onChange={handleUpload} className="text-sm" />
          {uploading && <ImageIcon size={16} className="animate-pulse" />}
        </div>
        <Input value={str} onChange={(e) => onChange(e.target.value)} placeholder="URL" className="text-sm" />
      </div>
    );
  }
  if (spec.type === 'product_ref') {
    return (
      <select className="w-full border border-border rounded-md px-3 py-2 text-base bg-transparent" value={str} onChange={(e) => onChange(e.target.value)}>
        <option value="">— selecionar —</option>
        {(products ?? []).map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    );
  }
  return <Input value={str} onChange={(e) => onChange(e.target.value)} className="text-base" />;
};

const ItemRow = ({
  item, fields, products, bucketHint, onMove, onDelete, onSave, isFirst, isLast,
}: {
  item: SiteContentListItem;
  fields: FieldSpec[];
  products?: Product[];
  bucketHint?: string;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onSave: (fields: Record<string, Json>) => Promise<void> | void;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const { toast } = useToast();
  const [local, setLocal] = useState<Record<string, Json>>(item.fields ?? {});
  const [saving, setSaving] = useState(false);
  useEffect(() => { setLocal(item.fields ?? {}); }, [item.id, item.updated_at]);

  return (
    <div className="border border-border rounded-md p-4 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">item {item.item_index + 1}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onMove(-1)} disabled={isFirst} className="p-1.5 text-muted-foreground disabled:opacity-30" aria-label="Mover acima"><ChevronUp size={16} /></button>
          <button onClick={() => onMove(1)} disabled={isLast} className="p-1.5 text-muted-foreground disabled:opacity-30" aria-label="Mover abaixo"><ChevronDown size={16} /></button>
          <button onClick={() => { if (confirm('Remover este item?')) onDelete(); }} className="p-1.5 text-destructive" aria-label="Remover"><Trash2 size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((spec) => (
          <div key={spec.key} className={spec.type === 'textarea' || spec.type === 'image' || spec.type === 'video' ? 'md:col-span-2' : ''}>
            <label className={fieldLabelCls}>{spec.label}</label>
            <FieldEditor
              spec={spec}
              value={local[spec.key]}
              onChange={(v) => setLocal({ ...local, [spec.key]: v })}
              products={products}
              bucketHint={bucketHint}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button disabled={saving} className="text-sm" onClick={async () => {
          setSaving(true);
          try { await onSave(local); toast({ title: 'Item salvo.' }); }
          catch (err: unknown) { toast({ title: err instanceof Error ? err.message : 'Erro ao salvar', variant: 'destructive' }); }
          finally { setSaving(false); }
        }}>
          {saving ? 'Salvando…' : 'Salvar item'}
        </Button>
      </div>
    </div>
  );
};

const ListItemsEditor = ({
  pageKey, sectionKey, listKey, items, fields, products, onCreate, onUpdate, onDelete, onReorder,
}: Props) => {
  const sorted = [...items].sort((a, b) => a.item_index - b.item_index);
  const bucketHint = pageKey === 'lembrancas' ? 'lembrancas'
    : pageKey === 'sobre' ? 'about'
    : pageKey === 'produtos' || (pageKey === 'home' && sectionKey === 'hero') ? 'banner'
    : 'produtos';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{listKey} ({sorted.length})</h4>
        <Button variant="outline" onClick={() => onCreate()} className="gap-1.5 text-sm"><Plus size={16} /> Adicionar</Button>
      </div>
      {sorted.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhum item.</p>}
      {sorted.map((item, i) => (
        <ItemRow
          key={item.id}
          item={item}
          fields={fields}
          products={products}
          bucketHint={bucketHint}
          onMove={(dir) => {
            const target = i + dir;
            if (target < 0 || target >= sorted.length) return;
            const ids = sorted.map((it) => it.id);
            [ids[i], ids[target]] = [ids[target], ids[i]];
            onReorder(ids);
          }}
          onDelete={() => onDelete(item.id)}
          onSave={(f) => onUpdate(item.id, f)}
          isFirst={i === 0}
          isLast={i === sorted.length - 1}
        />
      ))}
      <p className="text-xs text-muted-foreground/70 mt-2 font-mono">page_key: {pageKey} · section_key: {sectionKey} · list_key: {listKey}</p>
    </div>
  );
};

export default ListItemsEditor;
