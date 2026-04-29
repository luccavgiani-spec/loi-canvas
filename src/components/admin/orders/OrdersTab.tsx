import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Eye, Mail, Send, Truck } from 'lucide-react';
import { getAdminOrders, sendTrackingEmail, shipOrder } from '@/lib/api';
import type { Order } from '@/types';
import OrderDetailModal from '@/components/admin/OrderDetailModal';
import { tableCls, thCls, tdCls } from '@/components/admin/shared/styles';
import { EmptyState } from '@/components/admin/shared/EmptyState';
import { Modal } from '@/components/admin/shared/Modal';

export function OrdersTab() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [emailSentAt, setEmailSentAt] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<Record<string, boolean>>({});
  const [shipTarget, setShipTarget] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [shipping, setShipping] = useState(false);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);

  useEffect(() => {
    getAdminOrders({ status: status || undefined }).then(list => {
      setOrders(list);
      const inputs: Record<string, string> = {};
      const sentAt: Record<string, string> = {};
      list.forEach(o => {
        inputs[o.id] = o.tracking_code || '';
        if (o.tracking_email_sent_at) sentAt[o.id] = o.tracking_email_sent_at;
      });
      setTrackingInputs(inputs);
      setEmailSentAt(sentAt);
    });
  }, [status]);

  const handleSendTracking = async (orderId: string) => {
    const code = trackingInputs[orderId]?.trim();
    if (!code) {
      toast({ title: 'Informe o código de rastreio antes de enviar.', variant: 'destructive' });
      return;
    }
    setSending(prev => ({ ...prev, [orderId]: true }));
    try {
      const { sent_at } = await sendTrackingEmail(orderId, code);
      setEmailSentAt(prev => ({ ...prev, [orderId]: sent_at }));
      toast({ title: 'E-mail de rastreio enviado com sucesso.' });
    } catch (err: any) {
      toast({ title: err?.message || 'Erro ao enviar e-mail.', variant: 'destructive' });
    } finally {
      setSending(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const statuses = ['', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'];

  const openShip = (orderId: string) => { setShipTarget(orderId); setTrackingInput(''); };
  const closeShip = () => { setShipTarget(null); setTrackingInput(''); };

  const handleShip = async () => {
    if (!shipTarget || !trackingInput.trim()) return;
    setShipping(true);
    try {
      await shipOrder(shipTarget, trackingInput.trim());
      setOrders(prev => prev.map(o => o.id === shipTarget ? { ...o, status: 'shipped' as const, tracking_code: trackingInput.trim() } : o));
      toast({ title: 'Pedido marcado como enviado', description: `Rastreio: ${trackingInput.trim()}` });
      closeShip();
    } catch {
      toast({ title: 'Erro ao atualizar pedido', variant: 'destructive' });
    } finally {
      setShipping(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatus(s)} className={`text-xs px-3 py-1 rounded-full border ${status === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
            {s || 'Todos'}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className={tableCls}>
          <thead>
            <tr className="border-b border-border">
              <th className={thCls}>Pedido</th>
              <th className={thCls}>Cliente</th>
              <th className={thCls}>Status</th>
              <th className={thCls}>Total</th>
              <th className={thCls}>Data</th>
              <th className={thCls}>Código de Rastreio</th>
              <th className={thCls}>Ação</th>
              <th className={thCls}>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-border">
                <td className={`${tdCls} font-medium text-xs`}>{o.id.slice(0, 8).toUpperCase()}…</td>
                <td className={tdCls}>
                  <div>{o.customer.name}</div>
                  <div className="text-xs text-muted-foreground">{o.customer.email}</div>
                </td>
                <td className={tdCls}><span className="badge-product badge-new rounded-sm">{o.status}</span></td>
                <td className={tdCls}>R$ {o.total.toFixed(2)}</td>
                <td className={`${tdCls} text-muted-foreground text-xs`}>{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                <td className={tdCls}>
                  <Input
                    value={trackingInputs[o.id] || ''}
                    onChange={e => setTrackingInputs(prev => ({ ...prev, [o.id]: e.target.value }))}
                    placeholder="Ex: BR123456789BR"
                    className="h-8 text-xs w-44"
                  />
                </td>
                <td className={tdCls}>
                  <div className="flex flex-col gap-1 min-w-[140px]">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 gap-1"
                      disabled={sending[o.id]}
                      onClick={() => handleSendTracking(o.id)}
                    >
                      <Mail size={12} />
                      {sending[o.id] ? 'Enviando…' : 'Enviar e-mail de rastreio'}
                    </Button>
                    {emailSentAt[o.id] && (
                      <span className="text-[11px] text-green-600 flex items-center gap-1">
                        <Send size={10} />
                        e-mail enviado em {new Date(emailSentAt[o.id]).toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                </td>
                <td className={tdCls}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 gap-1"
                    onClick={() => setDetailOrderId(o.id)}
                  >
                    <Eye size={12} /> Ver
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <EmptyState label="pedido" />}
      </div>

      <OrderDetailModal orderId={detailOrderId} onClose={() => setDetailOrderId(null)} />

      <Modal open={!!shipTarget} onClose={closeShip} title="Confirmar envio">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Informe o código de rastreio dos Correios. O cliente receberá um e-mail automaticamente.</p>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Código de rastreio</label>
            <Input
              value={trackingInput}
              onChange={e => setTrackingInput(e.target.value)}
              placeholder="ex: BR123456789BR"
              className="font-mono"
              onKeyDown={e => e.key === 'Enter' && handleShip()}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleShip} disabled={!trackingInput.trim() || shipping} className="flex-1 gap-2">
              <Truck size={14} /> {shipping ? 'Enviando...' : 'Confirmar envio'}
            </Button>
            <Button type="button" variant="outline" onClick={closeShip}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
