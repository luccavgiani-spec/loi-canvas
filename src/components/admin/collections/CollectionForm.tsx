import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Upload, X } from 'lucide-react';
import type { AdminCollectionRow } from '@/lib/api';
import type { TablesInsert } from '@/integrations/supabase/types';

export type CollectionFormPayload = {
  insert: TablesInsert<'collections'>;
  coverFile: File | null;
  removeCover: boolean;
};

interface CollectionFormProps {
  collection: AdminCollectionRow | null;
  saving: boolean;
  onSave: (payload: CollectionFormPayload) => void;
  onCancel: () => void;
}

export function CollectionForm({
  collection,
  saving,
  onSave,
  onCancel,
}: CollectionFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: collection?.name ?? '',
    slug: collection?.slug ?? '',
    description: collection?.description ?? '',
    numeral: collection?.numeral ?? '',
    detail: collection?.detail ?? '',
    story: collection?.story ?? '',
    price_label: collection?.price_label ?? '',
    is_active: collection?.is_active ?? true,
    sort_order: collection?.sort_order ?? 0,
  });
  const [existingCover, setExistingCover] = useState<string | null>(collection?.cover_image ?? null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const autoSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setRemoveCover(false);
    e.target.value = '';
  };

  const clearCover = () => {
    setCoverFile(null);
    setExistingCover(null);
    setRemoveCover(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const insert: TablesInsert<'collections'> = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      numeral: form.numeral || null,
      detail: form.detail || null,
      story: form.story || null,
      price_label: form.price_label || null,
      is_active: form.is_active,
      sort_order: form.sort_order,
      cover_image: existingCover,
    };
    onSave({ insert, coverFile, removeCover });
  };

  const previewSrc = coverFile ? URL.createObjectURL(coverFile) : existingCover;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Nome</label>
        <Input value={form.name} onChange={e => { const name = e.target.value; setForm(f => ({ ...f, name, slug: collection ? f.slug : autoSlug(name) })); }} required />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Slug</label>
        <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Numeral</label>
          <Input value={form.numeral} onChange={e => setForm(f => ({ ...f, numeral: e.target.value }))} placeholder="ex: I, II, III" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Detalhe</label>
          <Input value={form.detail} onChange={e => setForm(f => ({ ...f, detail: e.target.value }))} placeholder="ex: Latinha 160g · dois pavios" />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Descrição</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Story (texto da hero)</label>
        <textarea value={form.story} onChange={e => setForm(f => ({ ...f, story: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={3} placeholder="Texto descritivo longo para a hero da página da coleção" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Faixa de preço</label>
        <Input value={form.price_label} onChange={e => setForm(f => ({ ...f, price_label: e.target.value }))} placeholder="ex: a partir de R$ 72" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Imagem de capa</label>
        {previewSrc && (
          <div className="relative w-32 h-32 border border-border rounded overflow-hidden mb-2 group">
            <img src={previewSrc} alt="capa" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={clearCover}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded"
              aria-label="Remover capa"
            >
              <X size={12} />
            </button>
            {coverFile && (
              <span className="absolute bottom-0 left-0 bg-accent text-accent-foreground text-[9px] px-1">novo</span>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs gap-1">
          <Upload size={12} /> {previewSrc ? 'Trocar imagem' : 'Selecionar imagem'}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
          <label className="text-sm">Ativa</label>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Ordem</label>
          <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          {saving ? 'Salvando…' : collection ? 'Salvar' : 'Criar'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancelar</Button>
      </div>
    </form>
  );
}
