import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';
import { getAdminProducts, createAdminReview } from '@/lib/api';
import type { AdminProductRow } from '@/lib/api';

interface CreateReviewFormProps {
  onCreated: () => void;
}

export function CreateReviewForm({ onCreated }: CreateReviewFormProps) {
  const { toast } = useToast();
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [productId, setProductId] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminProducts().then(p => {
      setProducts(p);
      if (p.length && !productId) setProductId(p[0].id);
    });
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) { toast({ title: 'Escolha um produto.', variant: 'destructive' }); return; }
    if (!authorName.trim()) { toast({ title: 'Informe o autor.', variant: 'destructive' }); return; }
    if (!body.trim()) { toast({ title: 'Escreva o comentário.', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await createAdminReview({
        product_id: productId,
        author_name: authorName.trim(),
        rating,
        body: body.trim(),
        created_at: createdAt ? new Date(createdAt).toISOString() : undefined,
      });
      toast({ title: 'Avaliação criada e publicada.' });
      setAuthorName('');
      setBody('');
      setRating(5);
      setCreatedAt('');
      onCreated();
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao criar avaliação.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <p className="text-xs text-muted-foreground">
        Avaliações criadas aqui entram <strong>direto como aprovadas</strong>. Use com responsabilidade.
      </p>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Produto</label>
        <select
          value={productId}
          onChange={e => setProductId(e.target.value)}
          required
          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent"
        >
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Autor</label>
        <Input
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          placeholder="Nome real ou pseudônimo"
          maxLength={80}
          required
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Nota</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(s)}
              className="p-0.5"
            >
              <Star
                size={24}
                className={(hover || rating) >= s ? 'fill-current text-foreground' : 'text-muted-foreground/30'}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Comentário</label>
        <Textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          maxLength={800}
          required
          placeholder="O que essa pessoa diria sobre o produto?"
          className="resize-none"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Data (opcional)</label>
        <Input
          type="datetime-local"
          value={createdAt}
          onChange={e => setCreatedAt(e.target.value)}
        />
        <p className="text-[11px] text-muted-foreground mt-1">Deixe em branco para usar o momento atual.</p>
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {saving ? 'Criando…' : 'Criar avaliação'}
      </Button>
    </form>
  );
}
