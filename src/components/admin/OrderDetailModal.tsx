import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getAdminOrderDetail, type AdminOrderDetail } from '@/lib/api';
import { useSetting } from '@/hooks/useSetting';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Phone, MapPin, Package, Truck, CheckCircle2, Tag, Plus } from 'lucide-react';

interface OrderDetailModalProps {
  orderId: string | null;
  onClose: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const STATUS_TONE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900 border-amber-300',
  paid: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  shipped: 'bg-sky-100 text-sky-900 border-sky-300',
  delivered: 'bg-emerald-200 text-emerald-950 border-emerald-400',
  cancelled: 'bg-rose-100 text-rose-900 border-rose-300',
};

function StatusBadge({ status }: { status: string | null }) {
  const key = status ?? 'pending';
  const label = STATUS_LABEL[key] ?? key;
  const tone = STATUS_TONE[key] ?? 'bg-muted text-muted-foreground border-border';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium uppercase tracking-wider rounded-full border ${tone}`}>
      {label}
    </span>
  );
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg p-5 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-medium">{children}</h3>
  );
}

function Initials({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm shrink-0">
      {initial}
    </div>
  );
}

export default function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [observation, setObservation] = useState('');
  const { address: pickupAddress } = useSetting<{ address: string }>(
    'pickup_address',
    { address: '(endereço a definir)' },
  );

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    setObservation('');
    getAdminOrderDetail(orderId)
      .then(setOrder)
      .catch(err => {
        console.error('[OrderDetailModal] failed to load', err);
        toast({ title: 'Erro ao carregar pedido', variant: 'destructive' });
        onClose();
      })
      .finally(() => setLoading(false));
  }, [orderId, onClose, toast]);

  const open = orderId !== null;
  const shortId = order ? order.id.slice(0, 8).toUpperCase() : '—';
  const subtotal = order ? order.subtotal : 0;
  const shipping = order?.shipping_cost ?? 0;
  const discount = order?.discount ?? 0;
  const isPaid = order?.status === 'paid' || order?.status === 'shipped' || order?.status === 'delivered';

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[92vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="border-b border-border px-6 py-5 sticky top-0 bg-background z-10">
          <div className="flex items-start justify-between gap-4 pr-6">
            <div>
              <DialogTitle className="text-xl font-heading font-light">
                Pedido nº <span className="font-mono text-base">{shortId}</span>
              </DialogTitle>
              {order?.created_at && (
                <p className="text-sm text-muted-foreground mt-1">
                  Feito em {formatDateTime(order.created_at)}
                </p>
              )}
            </div>
            {order && <StatusBadge status={order.status} />}
          </div>
        </div>

        {loading || !order ? (
          <div className="p-6 grid md:grid-cols-5 gap-5">
            <div className="md:col-span-3 space-y-4">
              <Skeleton className="h-40" />
              <Skeleton className="h-32" />
              <Skeleton className="h-28" />
            </div>
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-20" />
            </div>
          </div>
        ) : (
          <div className="p-6 grid md:grid-cols-5 gap-5">
            {/* ─── Coluna esquerda (~60%) ─── */}
            <div className="md:col-span-3 space-y-5 min-w-0">

              {/* Itens */}
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <CardTitle>Itens</CardTitle>
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                    {order.is_pickup ? <Package size={12} /> : <Truck size={12} />}
                    {order.is_pickup ? 'Retirada na Loja' : 'Entrega'}
                  </span>
                </div>

                <ul className="divide-y divide-border">
                  {order.items.map((it) => (
                    <li key={it.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      {it.image_url ? (
                        <img
                          src={it.image_url}
                          alt={it.product_name}
                          className="w-14 h-14 object-cover rounded border border-border shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded border border-border bg-muted shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{it.product_name}</p>
                        {it.product_sku && (
                          <p className="text-xs text-muted-foreground font-mono">SKU {it.product_sku}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          R$ {it.unit_price.toFixed(2)} × {it.qty}
                        </p>
                      </div>
                      <div className="text-right text-sm font-medium shrink-0">
                        R$ {(it.unit_price * it.qty).toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>

                {order.is_pickup && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <button
                      type="button"
                      disabled
                      className="text-xs px-3 py-1.5 border border-border rounded-md text-muted-foreground inline-flex items-center gap-1.5 cursor-not-allowed opacity-60"
                      title="TODO: ligar à edge function de e-mail (Resend)"
                    >
                      <Mail size={12} /> Enviar e-mail de pedido pronto para retirada
                    </button>
                  </div>
                )}
              </Card>

              {/* Pagamento */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>Informações de pagamento</CardTitle>
                  <StatusBadge status={isPaid ? 'paid' : 'pending'} />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Itens</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{order.is_pickup ? 'Retirada' : 'Frete'}</span>
                    <span>{shipping > 0 ? `R$ ${shipping.toFixed(2)}` : 'Grátis'}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-accent">
                      <span>Desconto</span>
                      <span>− R$ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 mt-2 border-t border-border font-medium">
                    <span>Total</span>
                    <span>R$ {order.total.toFixed(2)}</span>
                  </div>
                  {isPaid && (
                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                      <span>Valor pago pelo cliente</span>
                      <span>R$ {order.total.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Atividade do pedido */}
              <Card>
                <CardTitle>Atividade do pedido</CardTitle>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">Pedido criado</div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(order.created_at)}</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    {isPaid ? (
                      <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className={`font-medium ${isPaid ? '' : 'text-muted-foreground'}`}>Pagamento confirmado</div>
                      <div className="text-xs text-muted-foreground">
                        {isPaid ? (order.mp_payment_id ? `MP #${order.mp_payment_id}` : 'Confirmado') : 'Aguardando confirmação'}
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    {order.tracking_code ? (
                      <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className={`font-medium ${order.tracking_code ? '' : 'text-muted-foreground'}`}>Pedido enviado</div>
                      <div className="text-xs text-muted-foreground">
                        {order.tracking_code
                          ? `Rastreio ${order.tracking_code}${order.tracking_email_sent_at ? ` · e-mail em ${formatDateTime(order.tracking_email_sent_at)}` : ''}`
                          : '—'}
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    {order.status === 'delivered' ? (
                      <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className={`font-medium ${order.status === 'delivered' ? '' : 'text-muted-foreground'}`}>Pedido entregue</div>
                      <div className="text-xs text-muted-foreground">
                        {order.status === 'delivered' ? 'Concluído' : '—'}
                      </div>
                    </div>
                  </li>
                </ol>

                {/* Observação interna — placeholder, sem persistência (TODO: coluna admin_notes em orders) */}
                <div className="mt-5 pt-5 border-t border-border">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
                    Observação (clientes não verão isso)
                  </label>
                  <textarea
                    value={observation}
                    onChange={e => setObservation(e.target.value)}
                    rows={3}
                    placeholder="Insira uma observação"
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Anotações ainda não são salvas — será habilitado em versão futura.
                  </p>
                </div>
              </Card>
            </div>

            {/* ─── Coluna direita (~40%) ─── */}
            <div className="md:col-span-2 space-y-5 min-w-0">

              {/* Informações do pedido */}
              <Card>
                <CardTitle>Informações do pedido</CardTitle>

                {/* Contato */}
                <div className="mb-5">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Informações de contato</p>
                  <div className="flex items-start gap-3">
                    <Initials name={order.customer_name} />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium truncate">{order.customer_name}</p>
                      <a
                        href={`mailto:${order.customer_email}`}
                        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 truncate"
                      >
                        <Mail size={11} /> {order.customer_email}
                      </a>
                      {order.customer_phone && (
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                        >
                          <Phone size={11} /> {order.customer_phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Método de entrega */}
                <div className="mb-5 pt-4 border-t border-border">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Método de entrega</p>
                  <p className="text-sm flex items-center gap-2">
                    {order.is_pickup ? <Package size={13} /> : <Truck size={13} />}
                    {order.is_pickup ? 'Retirada na loja' : 'Entrega'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {order.is_pickup ? 'Pronto em até 5 dias úteis' : 'Prazo conforme transportadora'}
                  </p>
                </div>

                {/* Endereço de retirada */}
                {order.is_pickup && (
                  <div className="mb-5 pt-4 border-t border-border">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Endereço de retirada</p>
                    <p className="text-sm flex items-start gap-2">
                      <MapPin size={13} className="mt-0.5 shrink-0" />
                      <span>{pickupAddress}</span>
                    </p>
                  </div>
                )}

                {/* Endereço de cobrança / observação */}
                <div className="pt-4 border-t border-border">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Endereço de cobrança</p>
                  <p className="text-xs text-muted-foreground">
                    {/* schema atual de orders não armazena endereço estruturado */}
                    Não armazenado neste pedido.
                  </p>
                </div>
              </Card>

              {/* Tags — placeholder visual */}
              <Card>
                <CardTitle>Tags</CardTitle>
                <button
                  type="button"
                  disabled
                  className="text-xs px-3 py-1.5 border border-dashed border-border rounded-md text-muted-foreground inline-flex items-center gap-1.5 cursor-not-allowed"
                  title="TODO: tags por pedido (futuro)"
                >
                  <Tag size={12} /> <Plus size={11} /> Atribuir tags
                </button>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Atribuição de tags ainda não disponível.
                </p>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
