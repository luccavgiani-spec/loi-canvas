import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { uploadCollabMedia } from '@/lib/storage';
import type { Collab } from '@/types';
import { ImageUploader } from '@/components/admin/shared/ImageUploader';

interface CollabFormProps {
  collab: Collab | null;
  onSave: (data: Partial<Collab>) => void;
  onCancel: () => void;
}

export function CollabForm({ collab, onSave, onCancel }: CollabFormProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: collab?.name || '',
    slug: collab?.slug || '',
    caption: collab?.caption || '',
    description: collab?.description || '',
    category: collab?.category || '',
    year: collab?.year || '',
    images: collab?.images || [] as string[],
    is_active: collab?.is_active ?? true,
    sort_order: collab?.sort_order ?? 0,
  });
  const [uploading, setUploading] = useState(false);

  const autoSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) {
      toast({ title: 'Aguarde o upload terminar antes de salvar.', variant: 'destructive' });
      return;
    }
    onSave({ ...form });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Nome da collab</label>
        <Input value={form.name} onChange={e => { const name = e.target.value; setForm(f => ({ ...f, name, slug: collab ? f.slug : autoSlug(name) })); }} required />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Slug</label>
        <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Categoria</label>
          <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="ex: kit de imprensa" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Ano</label>
          <Input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="ex: 2023" />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Legenda curta</label>
        <Input value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="ex: Vasos artesanais × Loiê" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Descrição</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={3} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Mídias (imagens / vídeos)</label>
        <ImageUploader
          images={form.images}
          onChange={imgs => setForm(f => ({ ...f, images: imgs }))}
          uploadFn={uploadCollabMedia}
          onBusyChange={setUploading}
        />
        {uploading && (
          <p className="text-[10px] text-amber-700 mt-1">Aguarde — fazendo upload das mídias…</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
          <label className="text-sm">Ativa</label>
        </div>
        {collab && (
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Ordem</label>
            <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
          </div>
        )}
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={uploading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          {uploading ? 'Enviando mídias…' : (collab ? 'Salvar' : 'Criar')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}
