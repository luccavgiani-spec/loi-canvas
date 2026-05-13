import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { uploadAsset } from '@/lib/site-content/api';
import type { SiteContentBlock, PresentationOverrides } from '@/lib/site-content/types';
import type { Tables } from '@/integrations/supabase/types';
import PresentationControls from './PresentationControls';

type Product = Pick<Tables<'products'>, 'id' | 'name' | 'slug'>;
type Collection = Pick<Tables<'collections'>, 'id' | 'name' | 'slug'>;

interface Props {
  block: SiteContentBlock;
  onSave: (input: {
    id: string;
    value_text?: string | null;
    value_image_url?: string | null;
    value_video_url?: string | null;
    value_ref_id?: string | null;
    value_url?: string | null;
    presentation_overrides?: PresentationOverrides;
  }) => Promise<void> | void;
  /** lista de produtos para selects (content_type product_ref). */
  products?: Product[];
  collections?: Collection[];
  /** mostra controle de posicao_vertical para seções com texto sobre imagem. */
  showVertical?: boolean;
}

const TEXT_BLOCKS: Array<SiteContentBlock['content_type']> = ['text', 'rich_text'];

/** Devolve o bucket adequado para uploads de uma seção. */
function bucketForContext(pageKey: string, sectionKey: string): string {
  if (pageKey === 'lembrancas') return 'lembrancas';
  if (pageKey === 'sobre') return 'about';
  if (pageKey === 'produtos' || (pageKey === 'home' && sectionKey === 'hero')) return 'banner';
  return 'produtos';
}

const fieldLabelCls = 'block text-[10px] uppercase tracking-wider text-muted-foreground mb-1';

const BlockEditor = ({ block, onSave, products = [], collections = [], showVertical = false }: Props) => {
  const { toast } = useToast();
  const [valueText, setValueText] = useState(block.value_text ?? '');
  const [valueImage, setValueImage] = useState(block.value_image_url ?? '');
  const [valueVideo, setValueVideo] = useState(block.value_video_url ?? '');
  const [valueRef, setValueRef] = useState(block.value_ref_id ?? '');
  const [valueUrl, setValueUrl] = useState(block.value_url ?? '');
  const [overrides, setOverrides] = useState<PresentationOverrides>(block.presentation_overrides ?? {});
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValueText(block.value_text ?? '');
    setValueImage(block.value_image_url ?? '');
    setValueVideo(block.value_video_url ?? '');
    setValueRef(block.value_ref_id ?? '');
    setValueUrl(block.value_url ?? '');
    setOverrides(block.presentation_overrides ?? {});
    setPreviewFile(null);
  }, [block.id]);

  const isText = TEXT_BLOCKS.includes(block.content_type);
  const isImage = block.content_type === 'image';
  const isVideo = block.content_type === 'video';
  const isProductRef = block.content_type === 'product_ref';
  const isCollectionRef = block.content_type === 'collection_ref';
  const isUrl = block.content_type === 'url';

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, target: 'image' | 'video') {
    const file = e.target.files?.[0];
    if (!file) return;
    if (target === 'video' && file.size > 50 * 1024 * 1024) {
      toast({ title: 'Vídeo acima de 50MB.', variant: 'destructive' });
      e.target.value = '';
      return;
    }
    setUploading(true);
    setPreviewFile(URL.createObjectURL(file));
    try {
      const bucket = target === 'image'
        ? bucketForContext(block.page_key, block.section_key)
        : 'produtos';
      const url = await uploadAsset(bucket, file);
      if (target === 'image') setValueImage(url);
      else setValueVideo(url);
      toast({ title: 'Upload concluído. Clique em Salvar para publicar.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha no upload';
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        id: block.id,
        value_text: isText ? valueText : block.value_text,
        value_image_url: isImage ? valueImage : block.value_image_url,
        value_video_url: isVideo ? valueVideo : block.value_video_url,
        value_ref_id: (isProductRef || isCollectionRef) ? (valueRef || null) : block.value_ref_id,
        value_url: isUrl ? valueUrl : block.value_url,
        presentation_overrides: overrides,
      });
      toast({ title: 'Bloco salvo.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar';
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-border rounded-md p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium">{block.block_key}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{block.content_type}</p>
        </div>
      </div>

      {isText && (
        <div>
          <label className={fieldLabelCls}>Conteúdo</label>
          {block.content_type === 'rich_text' || (valueText && valueText.length > 80) ? (
            <Textarea value={valueText} onChange={(e) => setValueText(e.target.value)} className="min-h-[120px] text-sm" />
          ) : (
            <Input value={valueText} onChange={(e) => setValueText(e.target.value)} className="text-sm" />
          )}
        </div>
      )}

      {isImage && (
        <div className="space-y-3">
          <label className={fieldLabelCls}>Imagem atual</label>
          {(previewFile || valueImage) && (
            <img src={previewFile ?? valueImage} alt="" className="max-h-40 border border-border rounded" />
          )}
          <Input type="file" accept="image/*" disabled={uploading} onChange={(e) => handleUpload(e, 'image')} />
          {uploading && <p className="text-xs text-muted-foreground">Enviando…</p>}
          <Input value={valueImage} onChange={(e) => setValueImage(e.target.value)} placeholder="URL pública" className="text-xs" />
        </div>
      )}

      {isVideo && (
        <div className="space-y-3">
          <label className={fieldLabelCls}>Vídeo atual</label>
          {(previewFile || valueVideo) && (
            <video src={previewFile ?? valueVideo} controls className="max-h-40 border border-border rounded" />
          )}
          <Input type="file" accept="video/mp4" disabled={uploading} onChange={(e) => handleUpload(e, 'video')} />
          {uploading && <p className="text-xs text-muted-foreground">Enviando…</p>}
          <Input value={valueVideo} onChange={(e) => setValueVideo(e.target.value)} placeholder="URL pública" className="text-xs" />
        </div>
      )}

      {isProductRef && (
        <div>
          <label className={fieldLabelCls}>Produto</label>
          <select className="w-full border border-border rounded-md px-2 py-1.5 text-sm bg-transparent" value={valueRef ?? ''} onChange={(e) => setValueRef(e.target.value)}>
            <option value="">— selecionar —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {isCollectionRef && (
        <div>
          <label className={fieldLabelCls}>Coleção</label>
          <select className="w-full border border-border rounded-md px-2 py-1.5 text-sm bg-transparent" value={valueRef ?? ''} onChange={(e) => setValueRef(e.target.value)}>
            <option value="">— selecionar —</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {isUrl && (
        <div>
          <label className={fieldLabelCls}>URL</label>
          <Input value={valueUrl} onChange={(e) => setValueUrl(e.target.value)} placeholder="/policies" className="text-sm" />
        </div>
      )}

      {(isText) && (
        <details className="mt-2">
          <summary className="text-xs text-muted-foreground cursor-pointer">apresentação</summary>
          <PresentationControls value={overrides} onChange={setOverrides} showVertical={showVertical} />
        </details>
      )}

      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={handleSave} disabled={saving || uploading}>
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
};

export default BlockEditor;
