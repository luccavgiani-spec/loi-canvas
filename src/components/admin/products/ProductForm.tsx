import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Upload, X } from 'lucide-react';
import { productImagePublicUrl } from '@/lib/api';
import type { AdminProductRow, AdminCollectionRow } from '@/lib/api';
import type { TablesInsert, Tables } from '@/integrations/supabase/types';

export type ProductFormPayload = {
  insert: TablesInsert<'products'>;
  newFiles: File[];
  removedImageIds: string[];
};

interface ProductFormProps {
  product: AdminProductRow | null;
  collections: AdminCollectionRow[];
  saving: boolean;
  onSave: (payload: ProductFormPayload) => void;
  onCancel: () => void;
}

export function ProductForm({
  product,
  collections,
  saving,
  onSave,
  onCancel,
}: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    sku: product?.sku ?? '',
    description: product?.description ?? '',
    details: product?.details ?? '',
    suggested_use: product?.suggested_use ?? '',
    composition: product?.composition ?? '',
    notes: product?.notes ?? '',
    ritual: product?.ritual ?? '',
    accord: product?.accord ?? '',
    price: product?.price ?? 0,
    weight_g: product?.weight_g ?? 0,
    burn_hours: product?.burn_hours ?? 0,
    collection_id: product?.collection_id ?? '',
    visible: product?.visible ?? true,
    is_bestseller: Boolean(product?.is_bestseller),
    stock_quantity: product?.stock_quantity ?? 0,
  });
  const [existingImages, setExistingImages] = useState<Tables<'product_images'>[]>(
    (product?.product_images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order),
  );
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const autoSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setNewFiles((prev) => [...prev, ...Array.from(files)]);
    e.target.value = '';
  };

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((i) => i.id !== id));
    setRemovedImageIds((prev) => [...prev, id]);
  };

  const removeNewFile = (idx: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const insert: TablesInsert<'products'> = {
      name: form.name,
      slug: form.slug,
      sku: form.sku,
      price: Number(form.price),
      weight_g: Number(form.weight_g),
      burn_hours: Number(form.burn_hours),
      collection_id: form.collection_id || null,
      description: form.description || null,
      details: form.details || null,
      suggested_use: form.suggested_use || null,
      composition: form.composition || null,
      notes: form.notes || null,
      ritual: form.ritual || null,
      accord: form.accord || null,
      visible: form.visible,
      is_bestseller: Boolean(form.is_bestseller),
      stock_quantity: Number(form.stock_quantity) || 0,
    };
    onSave({ insert, newFiles, removedImageIds });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Nome</label>
        <Input value={form.name} onChange={e => { const name = e.target.value; setForm(f => ({ ...f, name, slug: product ? f.slug : autoSlug(name) })); }} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Slug</label>
          <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">SKU</label>
          <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} required />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Descrição</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={3} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Preço (R$)</label>
          <Input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} required />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Peso (g)</label>
          <Input type="number" min="0" step="1" value={form.weight_g} onChange={e => setForm(f => ({ ...f, weight_g: Number(e.target.value) }))} required />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Queima (h)</label>
          <Input type="number" min="0" step="1" value={form.burn_hours} onChange={e => setForm(f => ({ ...f, burn_hours: Number(e.target.value) }))} required />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Coleção</label>
        <select value={form.collection_id} onChange={e => setForm(f => ({ ...f, collection_id: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent">
          <option value="">Sem coleção</option>
          {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Acorde</label>
        <Input value={form.accord} onChange={e => setForm(f => ({ ...f, accord: e.target.value }))} placeholder="ex: floral / amadeirado" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Detalhes</label>
        <textarea value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Sugestão de uso</label>
        <textarea value={form.suggested_use} onChange={e => setForm(f => ({ ...f, suggested_use: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Composição</label>
        <textarea value={form.composition} onChange={e => setForm(f => ({ ...f, composition: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Notas</label>
        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Ritual</label>
        <textarea value={form.ritual} onChange={e => setForm(f => ({ ...f, ritual: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Switch checked={form.visible} onCheckedChange={v => setForm(f => ({ ...f, visible: v }))} />
          <label className="text-sm">Visível</label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.is_bestseller} onCheckedChange={v => setForm(f => ({ ...f, is_bestseller: v }))} />
          <label className="text-sm">Bestseller</label>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Estoque</label>
          <Input
            type="number"
            min="0"
            step="1"
            className="w-24"
            value={form.stock_quantity}
            onChange={e => setForm(f => ({ ...f, stock_quantity: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Imagens</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {existingImages.map((img) => (
            <div key={img.id} className="relative w-20 h-20 border border-border rounded overflow-hidden group">
              <img src={productImagePublicUrl(img.filename)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeExistingImage(img.id)}
                className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remover imagem"
              >
                <X size={12} />
              </button>
              <span className="absolute bottom-0 left-0 bg-black/50 text-white text-[9px] px-1">{img.sort_order + 1}</span>
            </div>
          ))}
          {newFiles.map((file, i) => (
            <div key={`new-${i}`} className="relative w-20 h-20 border border-accent rounded overflow-hidden group">
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeNewFile(i)}
                className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remover arquivo"
              >
                <X size={12} />
              </button>
              <span className="absolute bottom-0 left-0 bg-accent text-accent-foreground text-[9px] px-1">novo</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs gap-1">
            <Upload size={12} /> Adicionar imagens
          </Button>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          {saving ? 'Salvando…' : product ? 'Salvar' : 'Criar'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancelar</Button>
      </div>
    </form>
  );
}
