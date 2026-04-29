import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { VideoPlayer } from '@/components/ui/VideoPlayer';

interface ImageUploaderProps {
  images: string[];
  onChange: (imgs: string[]) => void;
  uploadFn?: (file: File) => Promise<string>;
  onBusyChange?: (busy: boolean) => void;
}

export function ImageUploader({
  images,
  onChange,
  uploadFn,
  onBusyChange,
}: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const updateBusy = (next: boolean) => {
    setBusy(next);
    onBusyChange?.(next);
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    e.target.value = '';
    if (uploadFn) {
      updateBusy(true);
      const accumulated: string[] = [...images];
      try {
        for (const file of Array.from(files)) {
          const url = await uploadFn(file);
          accumulated.push(url);
          onChange([...accumulated]);
        }
      } catch (err) {
        console.error('[ImageUploader] upload failed', err);
        toast({ title: 'Falha no upload da mídia.', variant: 'destructive' });
      } finally {
        updateBusy(false);
      }
      return;
    }
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange([...images, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUrlAdd = () => {
    const url = prompt('Cole a URL da imagem ou vídeo:');
    if (url?.trim()) onChange([...images, url.trim()]);
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((src, i) => (
          <div key={i} className="relative w-20 h-20 border border-border rounded overflow-hidden group">
            {src.endsWith('.mp4') ? (
              <VideoPlayer src={src} className="w-full h-full object-cover" />
            ) : (
              <img src={src} alt="" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
            <span className="absolute bottom-0 left-0 bg-black/50 text-white text-[9px] px-1">{i + 1}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input ref={fileRef} type="file" accept="image/*,video/mp4" multiple className="hidden" onChange={handleFiles} />
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => fileRef.current?.click()} className="text-xs gap-1">
          <Upload size={12} /> {busy ? 'Enviando…' : 'Upload'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleUrlAdd} className="text-xs gap-1">
          <ImageIcon size={12} /> URL
        </Button>
      </div>
    </div>
  );
}
