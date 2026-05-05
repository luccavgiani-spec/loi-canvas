import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { AdminCollectionRow } from '@/lib/api';
import type { VipCoupon } from '@/types';

export interface VipCouponFormPayload {
  code: string;
  active: boolean;
  discounts: { collection_id: string; discount_percent: number }[];
}

interface Props {
  coupon: VipCoupon | null;
  collections: AdminCollectionRow[];
  onSave: (payload: VipCouponFormPayload) => Promise<void> | void;
  onCancel: () => void;
}

export function VipCouponForm({ coupon, collections, onSave, onCancel }: Props) {
  const [code, setCode] = useState(coupon?.code ?? '');
  const [active, setActive] = useState(coupon?.active ?? true);
  const initialDiscounts = useMemo(() => {
    const map = new Map<string, number>(
      (coupon?.discounts ?? []).map((d) => [d.collection_id, d.discount_percent]),
    );
    return collections.reduce<Record<string, number>>((acc, c) => {
      acc[c.id] = map.get(c.id) ?? 0;
      return acc;
    }, {});
  }, [coupon, collections]);
  const [discounts, setDiscounts] = useState<Record<string, number>>(initialDiscounts);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onSave({
        code,
        active,
        discounts: collections.map((c) => ({
          collection_id: c.id,
          discount_percent: discounts[c.id] ?? 0,
        })),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Código</label>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
          placeholder="BIASILVA"
          required
          maxLength={64}
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={active} onCheckedChange={setActive} />
        <label className="text-sm">Ativo</label>
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Descontos por coleção</label>
        <p className="text-xs text-muted-foreground mb-3">Coleção com 0% não recebe desconto. Valores entre 0 e 100.</p>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {collections.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3">
              <span className="text-sm flex-1 truncate">{c.name}</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  className="w-24 text-right"
                  value={discounts[c.id] ?? 0}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    const clamped = Math.max(0, Math.min(100, isFinite(raw) ? raw : 0));
                    setDiscounts((prev) => ({ ...prev, [c.id]: clamped }));
                  }}
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          {saving ? 'Salvando…' : coupon ? 'Salvar' : 'Criar'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancelar</Button>
      </div>
    </form>
  );
}
