import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getAdminVipCoupons,
  createAdminVipCoupon,
  updateAdminVipCoupon,
  deleteAdminVipCoupon,
} from '@/lib/api';
import type { AdminCollectionRow } from '@/lib/api';
import type { VipCoupon } from '@/types';
import { tableCls, thCls, tdCls } from '@/components/admin/shared/styles';
import { ConfirmDeleteDialog } from '@/components/admin/shared/ConfirmDeleteDialog';
import { Modal } from '@/components/admin/shared/Modal';
import { EmptyState } from '@/components/admin/shared/EmptyState';
import { VipCouponForm, type VipCouponFormPayload } from '@/components/admin/coupons/VipCouponForm';

interface Props {
  open: boolean;
  onClose: () => void;
  collections: AdminCollectionRow[];
}

type Mode = 'list' | 'form';

export function VipCouponsModal({ open, onClose, collections }: Props) {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>('list');
  const [coupons, setCoupons] = useState<VipCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<VipCoupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setMode('list');
    setEditing(null);
    setLoading(true);
    getAdminVipCoupons()
      .then(setCoupons)
      .catch((err) => {
        console.error('[VipCouponsModal] load failed', err);
        toast({ title: 'Erro ao carregar cupons VIP.', variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, [open, toast]);

  const handleSave = async (data: VipCouponFormPayload) => {
    try {
      if (editing) {
        const updated = await updateAdminVipCoupon(editing.id, data);
        setCoupons((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
      } else {
        const created = await createAdminVipCoupon(data);
        setCoupons((prev) => [created, ...prev]);
      }
      setMode('list');
      setEditing(null);
      toast({ title: editing ? 'Cupom VIP atualizado com sucesso.' : 'Cupom VIP criado com sucesso.' });
    } catch (err) {
      console.error('[VipCouponsModal] save failed', err);
      const msg = err instanceof Error ? err.message : 'Erro ao salvar cupom VIP.';
      toast({ title: msg, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdminVipCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setDeleteTarget(null);
      toast({ title: 'Cupom VIP excluído.' });
    } catch (err) {
      console.error('[VipCouponsModal] delete failed', err);
      toast({ title: 'Erro ao excluir cupom VIP.', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (coupon: VipCoupon) => {
    const next = !coupon.active;
    setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, active: next } : c)));
    try {
      await updateAdminVipCoupon(coupon.id, { active: next });
    } catch (err) {
      console.error('[VipCouponsModal] toggle failed', err);
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, active: coupon.active } : c)));
      toast({ title: 'Erro ao alterar status.', variant: 'destructive' });
    }
  };

  const title = mode === 'form' ? (editing ? 'Editar Cupom VIP' : 'Novo Cupom VIP') : 'Cupons VIP';

  return (
    <>
      <Modal open={open} onClose={onClose} title={title}>
        {mode === 'form' ? (
          <VipCouponForm
            coupon={editing}
            collections={collections}
            onSave={handleSave}
            onCancel={() => { setMode('list'); setEditing(null); }}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => { setEditing(null); setMode('form'); }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1"
              >
                <Plus size={14} /> Novo Cupom VIP
              </Button>
            </div>

            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : coupons.length === 0 ? (
              <EmptyState label="cupom VIP" />
            ) : (
              <div className="overflow-x-auto">
                <table className={tableCls}>
                  <thead>
                    <tr className="border-b border-border">
                      <th className={thCls}>Código</th>
                      <th className={thCls}>Coleções com desconto</th>
                      <th className={thCls}>Ativo</th>
                      <th className={thCls}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => {
                      const activeDiscounts = c.discounts.filter((d) => d.discount_percent > 0).length;
                      return (
                        <tr key={c.id} className="border-b border-border">
                          <td className={`${tdCls} font-mono`}>{c.code}</td>
                          <td className={tdCls}>{activeDiscounts}</td>
                          <td className={tdCls}>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} mr-2`}>
                              {c.active ? 'Ativo' : 'Inativo'}
                            </span>
                            <Switch checked={c.active} onCheckedChange={() => handleToggleActive(c)} />
                          </td>
                          <td className={tdCls}>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setEditing(c); setMode('form'); }}
                                className="text-accent hover:text-accent/80"
                                title="Editar"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(c.id)}
                                className="text-destructive hover:text-destructive/80"
                                title="Excluir"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        title="Excluir cupom VIP"
        description="Tem certeza que deseja excluir este cupom VIP? Esta ação não pode ser desfeita."
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </>
  );
}
