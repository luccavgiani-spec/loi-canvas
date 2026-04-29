import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { Coupon } from '@/types';
import type { AdminCollectionRow } from '@/lib/api';

export type CouponFormPayload = {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  min_order_value: number | null;
  collection_id: string | null;
};

// datetime-local quer 'YYYY-MM-DDTHH:mm' (sem timezone, sem segundos).
function toDateTimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDateTimeLocal(local: string): string | null {
  if (!local) return null;
  return new Date(local).toISOString();
}

interface CouponFormProps {
  coupon: Coupon | null;
  collections: AdminCollectionRow[];
  onSave: (data: CouponFormPayload) => void;
  onCancel: () => void;
}

export function CouponForm({
  coupon,
  collections,
  onSave,
  onCancel,
}: CouponFormProps) {
  const [form, setForm] = useState({
    code: coupon?.code ?? '',
    type: (coupon?.type ?? 'percent') as 'percent' | 'fixed',
    value: coupon?.value ?? 0,
    is_active: coupon?.is_active ?? true,
    valid_from: toDateTimeLocal(coupon?.valid_from ?? null),
    valid_until: toDateTimeLocal(coupon?.valid_until ?? null),
    max_uses: coupon?.max_uses == null ? '' : String(coupon.max_uses),
    min_order_value: coupon?.min_order_value == null ? '' : String(coupon.min_order_value),
    collection_id: coupon?.collection_id ?? '',
  });
  const [error, setError] = useState<string | null>(null);

  const sanitizeCode = (raw: string) =>
    raw.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 32);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = sanitizeCode(form.code);
    if (!code) { setError('Código é obrigatório (apenas A-Z, 0-9 e _).'); return; }

    const value = Number(form.value);
    if (!Number.isFinite(value) || value <= 0) { setError('Valor do desconto deve ser maior que zero.'); return; }
    if (form.type === 'percent' && value > 100) { setError('Desconto percentual não pode passar de 100%.'); return; }

    const max_uses = form.max_uses === '' ? null : Number(form.max_uses);
    if (max_uses !== null && (!Number.isFinite(max_uses) || max_uses < 0)) {
      setError('Máx. usos deve ser um inteiro >= 0.'); return;
    }

    const min_order_value = form.min_order_value === '' ? null : Number(form.min_order_value);
    if (min_order_value !== null && (!Number.isFinite(min_order_value) || min_order_value < 0)) {
      setError('Pedido mínimo deve ser >= 0.'); return;
    }

    const valid_from = fromDateTimeLocal(form.valid_from);
    const valid_until = fromDateTimeLocal(form.valid_until);
    if (valid_from && valid_until && new Date(valid_until) <= new Date(valid_from)) {
      setError('Validade final deve ser maior que a inicial.'); return;
    }

    onSave({
      code,
      type: form.type,
      value,
      is_active: form.is_active,
      valid_from,
      valid_until,
      max_uses,
      min_order_value,
      collection_id: form.collection_id || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded p-2">
          {error}
        </div>
      )}

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Código</label>
        <Input
          value={form.code}
          onChange={e => setForm(f => ({ ...f, code: sanitizeCode(e.target.value) }))}
          placeholder="ex: LOIE15"
          className="font-mono"
          required
        />
        <p className="text-[10px] text-muted-foreground mt-1">A-Z, 0-9 e _ apenas. UPPERCASE automático.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Tipo</label>
          <select
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value as 'percent' | 'fixed' }))}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent"
          >
            <option value="percent">Percentual (%)</option>
            <option value="fixed">Valor fixo (R$)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
            Valor {form.type === 'percent' ? '(%)' : '(R$)'}
          </label>
          <Input
            type="number"
            min="0"
            step={form.type === 'percent' ? '1' : '0.01'}
            max={form.type === 'percent' ? '100' : undefined}
            value={form.value}
            onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Válido a partir de (opcional)</label>
          <Input
            type="datetime-local"
            value={form.valid_from}
            onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Válido até (opcional)</label>
          <Input
            type="datetime-local"
            value={form.valid_until}
            onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Máx. usos (opcional)</label>
          <Input
            type="number"
            min="0"
            step="1"
            value={form.max_uses}
            onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
            placeholder="Ilimitado"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Pedido mínimo R$ (opcional)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.min_order_value}
            onChange={e => setForm(f => ({ ...f, min_order_value: e.target.value }))}
            placeholder="Sem mínimo"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Coleção (opcional)</label>
        <select
          value={form.collection_id}
          onChange={e => setForm(f => ({ ...f, collection_id: e.target.value }))}
          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent"
        >
          <option value="">Todas as coleções</option>
          {collections.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <p className="text-[10px] text-muted-foreground mt-1">
          Se selecionado, desconto vale apenas para itens dessa coleção.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
        <label className="text-sm">Ativo</label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">{coupon ? 'Salvar' : 'Criar'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}
