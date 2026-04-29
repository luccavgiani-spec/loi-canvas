import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Check, Star, X } from 'lucide-react';
import {
  getAdminReviews, approveAdminReview, unpublishAdminReview, deleteAdminReview,
} from '@/lib/api';
import type { AdminReview } from '@/lib/api';
import { tableCls, thCls, tdCls } from '@/components/admin/shared/styles';
import { EmptyState } from '@/components/admin/shared/EmptyState';
import { CreateReviewForm } from '@/components/admin/reviews/CreateReviewForm';

type ReviewSubTab = 'pending' | 'approved' | 'create';

function StarRow({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 align-middle">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          className={s <= rating ? 'fill-current text-foreground' : 'text-muted-foreground/30'}
        />
      ))}
    </span>
  );
}

export function ReviewsTab() {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<ReviewSubTab>('pending');
  const [pending, setPending] = useState<AdminReview[]>([]);
  const [approved, setApproved] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const reload = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        getAdminReviews('pending'),
        getAdminReviews('approved'),
      ]);
      setPending(p);
      setApproved(a);
    } catch (err) {
      console.error('[ReviewsTab] failed to load', err);
      toast({ title: 'Erro ao carregar avaliações.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, []);

  const setRowBusy = (id: string, val: boolean) =>
    setBusy(prev => ({ ...prev, [id]: val }));

  const handleApprove = async (id: string) => {
    setRowBusy(id, true);
    try {
      await approveAdminReview(id);
      toast({ title: 'Avaliação aprovada.' });
      await reload();
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao aprovar avaliação.', variant: 'destructive' });
    } finally {
      setRowBusy(id, false);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reprovar esta avaliação? Isso a remove permanentemente.')) return;
    setRowBusy(id, true);
    try {
      await deleteAdminReview(id);
      toast({ title: 'Avaliação removida.' });
      await reload();
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao remover avaliação.', variant: 'destructive' });
    } finally {
      setRowBusy(id, false);
    }
  };

  const handleUnpublish = async (id: string) => {
    setRowBusy(id, true);
    try {
      await unpublishAdminReview(id);
      toast({ title: 'Avaliação despublicada (volta a pendentes).' });
      await reload();
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao despublicar.', variant: 'destructive' });
    } finally {
      setRowBusy(id, false);
    }
  };

  const renderRows = (list: AdminReview[], variant: 'pending' | 'approved') => {
    if (list.length === 0) {
      return <EmptyState label={variant === 'pending' ? 'avaliação pendente' : 'avaliação aprovada'} />;
    }
    return (
      <div className="overflow-x-auto">
        <table className={tableCls}>
          <thead>
            <tr className="border-b border-border">
              <th className={thCls}>Produto</th>
              <th className={thCls}>Autor</th>
              <th className={thCls}>Nota</th>
              <th className={thCls}>Comentário</th>
              <th className={thCls}>Data</th>
              <th className={thCls}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.map(r => (
              <tr key={r.id} className="border-b border-border align-top">
                <td className={`${tdCls} text-sm`}>{r.product_name ?? <span className="text-muted-foreground">—</span>}</td>
                <td className={`${tdCls} text-sm font-medium`}>{r.author_name}</td>
                <td className={tdCls}><StarRow rating={r.rating} /></td>
                <td className={`${tdCls} text-sm max-w-md`}>
                  <div className="line-clamp-3 text-muted-foreground">{r.body || <em className="opacity-60">(sem texto)</em>}</div>
                </td>
                <td className={`${tdCls} text-xs text-muted-foreground`}>
                  {r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td className={tdCls}>
                  {variant === 'pending' ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="text-xs h-7 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={busy[r.id]}
                        onClick={() => handleApprove(r.id)}
                      >
                        <Check size={12} /> Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 gap-1 text-destructive hover:text-destructive border-destructive/40"
                        disabled={busy[r.id]}
                        onClick={() => handleReject(r.id)}
                      >
                        <X size={12} /> Reprovar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 gap-1"
                      disabled={busy[r.id]}
                      onClick={() => handleUnpublish(r.id)}
                    >
                      Despublicar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-border">
        <button
          type="button"
          onClick={() => setSubTab('pending')}
          className={`px-3 py-2 text-xs font-medium transition-colors ${subTab === 'pending' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Pendentes ({pending.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('approved')}
          className={`px-3 py-2 text-xs font-medium transition-colors ${subTab === 'approved' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Aprovadas ({approved.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('create')}
          className={`px-3 py-2 text-xs font-medium transition-colors ${subTab === 'create' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Criar avaliação
        </button>
      </div>

      {loading && subTab !== 'create' ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : subTab === 'pending' ? (
        renderRows(pending, 'pending')
      ) : subTab === 'approved' ? (
        renderRows(approved, 'approved')
      ) : (
        <CreateReviewForm onCreated={() => { void reload(); setSubTab('approved'); }} />
      )}
    </div>
  );
}
