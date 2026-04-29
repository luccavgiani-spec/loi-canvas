import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  getAdminKPIs, getAdminSalesTimeseries, getAdminTopProducts, getAdminOrders, getAdminCustomers,
  getAdminNewsletter, getAdminCoupons, getAdminCollections, getAdminCollabs,
  getAdminProducts, getAdminProductsByCollection, updateProductsSortOrder,
  updateBestsellerSortOrder,
  createAdminProduct, updateAdminProduct, deleteAdminProduct,
  uploadProductImage, insertProductImage, deleteProductImage, productImagePublicUrl,
  createAdminCollection, updateAdminCollection, deleteAdminCollection,
  uploadCollectionCover,
  createAdminCollab, updateAdminCollab, deleteAdminCollab,
  createAdminCoupon, updateAdminCoupon, deleteAdminCoupon,
  sendTrackingEmail, sendCampaign, shipOrder, sendCampaignEmail, getAdminNewsletterEmails,
  getAdminMensagens,
} from '@/lib/api';
import type { AdminProductRow, AdminCollectionRow } from '@/lib/api';
import { uploadCollabMedia } from '@/lib/storage';
import type { KPIs, SalesTimeseriesPoint, TopProduct, Order, Customer, NewsletterSubscriber, Coupon, Collab } from '@/types';
import type { TablesInsert, TablesUpdate, Tables } from '@/integrations/supabase/types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, ShoppingCart, Users, TrendingUp, Plus, Pencil, Trash2, X, Upload, Image as ImageIcon, Package, Truck, Mail, Send, GripVertical, ArrowUpDown, Eye, Star, Check } from 'lucide-react';
import OrderDetailModal from '@/components/admin/OrderDetailModal';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { VideoPlayer } from '@/components/ui/VideoPlayer';

/* ─────────── Shared styles ─────────── */
const cardCls = 'bg-card border border-border rounded-lg p-4';
const tableCls = 'w-full text-base';
const thCls = 'py-3 pr-4 text-left text-sm text-muted-foreground uppercase tracking-wider';
const tdCls = 'py-3 pr-4';

/* ─────────── Confirm Delete Dialog ─────────── */
function ConfirmDeleteDialog({ open, onOpenChange, title, description, onConfirm }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ─────────── Empty State ─────────── */
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Package size={40} className="text-muted-foreground/40 mb-4" />
      <p className="text-base text-muted-foreground">Nenhum(a) {label} encontrado(a).</p>
    </div>
  );
}

/* ─────────── Modal ─────────── */
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative bg-background border border-border rounded-lg w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-semibold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─────────── Image Upload UI ─────────── */
function ImageUploader({
  images,
  onChange,
  uploadFn,
  onBusyChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
  uploadFn?: (file: File) => Promise<string>;
  onBusyChange?: (busy: boolean) => void;
}) {
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

/* ═══════════ ADMIN ═══════════ */
const ADMIN_TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'orders', label: 'Pedidos' },
  { value: 'customers', label: 'Clientes' },
  { value: 'products', label: 'Produtos' },
  { value: 'collections', label: 'Coleções' },
  { value: 'collabs', label: 'Collabs' },
  { value: 'coupons', label: 'Cupons' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'campanhas', label: 'Campanhas' },
  // TODO: tab mensagens oculta — tabela 'mensagens' não existe, aguarda v3.2+
  // { value: 'mensagens', label: 'Mensagens' },
] as const;

const Admin = () => {
  const [tab, setTab] = useState<string>('overview');

  return (
    <div className="container py-8 space-y-6">
      <h1 className="heading-display text-3xl">Painel Admin</h1>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        {/* mobile: native select replaces wrapping tab strip */}
        <select
          aria-label="Seção do painel"
          value={tab}
          onChange={(e) => setTab(e.target.value)}
          className="md:hidden w-full px-4 py-3 text-sm bg-card border border-border rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {ADMIN_TABS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* desktop: horizontal tab list */}
        <TabsList className="hidden md:flex flex-wrap">
          {ADMIN_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="orders"><OrdersTab /></TabsContent>
        <TabsContent value="customers"><CustomersTab /></TabsContent>
        <TabsContent value="products"><ProductsTab /></TabsContent>
        <TabsContent value="collections"><CollectionsTab /></TabsContent>
        <TabsContent value="collabs"><CollabsTab /></TabsContent>
        <TabsContent value="coupons"><CouponsTab /></TabsContent>
        <TabsContent value="newsletter"><NewsletterTab /></TabsContent>
        <TabsContent value="campanhas"><CampaignsTab /></TabsContent>
        <TabsContent value="mensagens"><MensagensTab /></TabsContent>
      </Tabs>
    </div>
  );
};

/* ═══════════ OVERVIEW ═══════════ */
function OverviewTab() {
  const [kpis, setKPIs] = useState<KPIs | null>(null);
  const [timeseries, setTimeseries] = useState<SalesTimeseriesPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [range, setRange] = useState('30');

  useEffect(() => {
    getAdminKPIs(range).then(setKPIs);
    getAdminSalesTimeseries(range).then(setTimeseries);
    getAdminTopProducts(range).then(setTopProducts);
  }, [range]);

  if (!kpis) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;

  const kpiCards = [
    { label: 'Receita', value: `R$ ${kpis.total_revenue.toLocaleString()}`, icon: DollarSign },
    { label: 'Pedidos', value: kpis.total_orders, icon: ShoppingCart },
    { label: 'Ticket Médio', value: `R$ ${kpis.avg_order_value.toFixed(0)}`, icon: TrendingUp },
    { label: 'Novos Clientes', value: kpis.new_customers, icon: Users },
  ];

  const daysInMonth = 30;
  const daysPassed = Math.min(timeseries.length, daysInMonth);
  const avgDaily = daysPassed > 0 ? kpis.total_revenue / daysPassed : 0;
  const projected = avgDaily * daysInMonth;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {['7', '30', '90'].map(r => (
          <button key={r} onClick={() => setRange(r)} className={`text-xs px-3 py-1 rounded-full border ${range === r ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
            {r} dias
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map(k => (
          <div key={k.label} className={cardCls}>
            <div className="flex items-center gap-2 mb-2">
              <k.icon size={14} className="text-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{k.label}</span>
            </div>
            <p className="text-xl font-heading font-semibold">{k.value}</p>
          </div>
        ))}
      </div>

      <div className={cardCls}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Vendas por dia</h3>
          <span className="text-xs text-muted-foreground">Projeção mensal: R$ {projected.toFixed(0)}</span>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={timeseries}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={cardCls}>
        <h3 className="text-sm font-medium mb-4">Top Produtos</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={topProducts} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis dataKey="product_name" type="category" tick={{ fontSize: 10 }} width={120} />
            <Tooltip />
            <Bar dataKey="total_sold" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════ ORDERS ═══════════ */
function OrdersTab() {
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

/* ═══════════ CUSTOMERS ═══════════ */
function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  useEffect(() => { getAdminCustomers().then(setCustomers); }, []);

  return (
    <div className="overflow-x-auto">
      <table className={tableCls}>
        <thead><tr className="border-b border-border"><th className={thCls}>Nome</th><th className={thCls}>E-mail</th><th className={thCls}>Pedidos</th><th className={thCls}>Total Gasto</th><th className={thCls}>Desde</th></tr></thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id} className="border-b border-border">
              <td className={`${tdCls} font-medium`}>{c.name}</td>
              <td className={`${tdCls} text-muted-foreground`}>{c.email}</td>
              <td className={tdCls}>{c.orders_count}</td>
              <td className={tdCls}>R$ {c.total_spent?.toFixed(2)}</td>
              <td className={`${tdCls} text-muted-foreground`}>{c.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════ PRODUCTS ═══════════ */
type ProductFormPayload = {
  insert: TablesInsert<'products'>;
  newFiles: File[];
  removedImageIds: string[];
};

function ProductsTab() {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<'list' | 'bestseller-order'>('list');
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [collections, setCollections] = useState<AdminCollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProductRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProductRow | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const [prods, cols] = await Promise.all([getAdminProducts(), getAdminCollections()]);
      setProducts(prods);
      setCollections(cols);
    } catch (err) {
      console.error('[ProductsTab] failed to load', err);
      toast({ title: 'Erro ao carregar produtos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, []);

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: AdminProductRow) => { setEditing(p); setModalOpen(true); };

  const handleDelete = async (target: AdminProductRow) => {
    try {
      for (const img of target.product_images) {
        try { await deleteProductImage(img.id, img.filename); } catch (e) { console.warn('image cleanup failed', e); }
      }
      await deleteAdminProduct(target.id);
      setProducts(prev => prev.filter(p => p.id !== target.id));
      toast({ title: 'Produto excluído com sucesso.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao excluir produto.', variant: 'destructive' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSave = async (payload: ProductFormPayload) => {
    setSaving(true);
    try {
      const productId = editing
        ? (await updateAdminProduct(editing.id, payload.insert)).id
        : (await createAdminProduct(payload.insert)).id;

      for (const id of payload.removedImageIds) {
        const img = editing?.product_images.find((i) => i.id === id);
        if (img) {
          try { await deleteProductImage(img.id, img.filename); } catch (e) { console.warn('removeImage failed', e); }
        }
      }

      const baseSort = editing
        ? Math.max(-1, ...editing.product_images
            .filter((i) => !payload.removedImageIds.includes(i.id))
            .map((i) => i.sort_order)) + 1
        : 0;
      for (let i = 0; i < payload.newFiles.length; i++) {
        const filename = await uploadProductImage(productId, payload.newFiles[i]);
        await insertProductImage(productId, filename, baseSort + i);
      }

      toast({ title: editing ? 'Produto atualizado com sucesso.' : 'Produto criado com sucesso.' });
      setModalOpen(false);
      void reload();
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao salvar produto.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>;
  }

  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-border">
        <button
          type="button"
          onClick={() => setSubTab('list')}
          className={`px-3 py-2 text-xs font-medium transition-colors ${subTab === 'list' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Lista
        </button>
        <button
          type="button"
          onClick={() => setSubTab('bestseller-order')}
          className={`px-3 py-2 text-xs font-medium transition-colors ${subTab === 'bestseller-order' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Ordem dos Bestsellers
        </button>
      </div>

      {subTab === 'bestseller-order' ? (
        <BestsellerProductsOrder products={products} onSaved={() => void reload()} />
      ) : (
      <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Produtos ({products.length})</h3>
        <Button size="sm" onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1"><Plus size={14} /> Novo Produto</Button>
      </div>

      {products.length === 0 ? <EmptyState label="produto" /> : (
        <div className="overflow-x-auto">
          <table className={tableCls}>
            <thead>
              <tr className="border-b border-border">
                <th className={thCls}>Produto</th>
                <th className={thCls}>SKU</th>
                <th className={thCls}>Coleção</th>
                <th className={thCls}>Preço</th>
                <th className={thCls}>Visível</th>
                <th className={thCls}>Bestseller</th>
                <th className={thCls}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const cover = p.product_images.length > 0
                  ? productImagePublicUrl(p.product_images.slice().sort((a, b) => a.sort_order - b.sort_order)[0].filename)
                  : null;
                return (
                  <tr key={p.id} className="border-b border-border">
                    <td className={tdCls}>
                      <div className="flex items-center gap-2">
                        {cover
                          ? <img src={cover} alt={p.name} className="w-8 h-8 rounded object-cover" />
                          : <div className="w-8 h-8 rounded bg-muted" />}
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className={`${tdCls} font-mono text-xs`}>{p.sku}</td>
                    <td className={`${tdCls} text-muted-foreground`}>{p.collections?.name ?? '—'}</td>
                    <td className={tdCls}>R$ {Number(p.price).toFixed(2)}</td>
                    <td className={tdCls}>{p.visible ? 'Sim' : '—'}</td>
                    <td className={tdCls}>{p.is_bestseller ? 'Sim' : '—'}</td>
                    <td className={tdCls}>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="text-accent hover:text-accent/80"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteTarget(p)} className="text-destructive hover:text-destructive/80"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)} title={editing ? 'Editar Produto' : 'Novo Produto'}>
        <ProductForm
          product={editing}
          collections={collections}
          saving={saving}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Excluir produto"
        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
      </>
      )}
    </div>
  );
}

function ProductForm({
  product,
  collections,
  saving,
  onSave,
  onCancel,
}: {
  product: AdminProductRow | null;
  collections: AdminCollectionRow[];
  saving: boolean;
  onSave: (payload: ProductFormPayload) => void;
  onCancel: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    sku: product?.sku ?? '',
    description: product?.description ?? '',
    details: product?.details ?? '',
    suggested_use: product?.suggested_use ?? '',
    composition: product?.composition ?? '',
    notes: product?.notes ?? '',
    ritual: product?.ritual ?? '',
    accord: product?.accord ?? '',
    price: product?.price ?? 0,
    weight_g: product?.weight_g ?? 0,
    burn_hours: product?.burn_hours ?? 0,
    collection_id: product?.collection_id ?? '',
    visible: product?.visible ?? true,
    is_bestseller: Boolean(product?.is_bestseller),
    stock_quantity: product?.stock_quantity ?? 0,
  });
  const [existingImages, setExistingImages] = useState<Tables<'product_images'>[]>(
    (product?.product_images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order),
  );
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const autoSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setNewFiles((prev) => [...prev, ...Array.from(files)]);
    e.target.value = '';
  };

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((i) => i.id !== id));
    setRemovedImageIds((prev) => [...prev, id]);
  };

  const removeNewFile = (idx: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const insert: TablesInsert<'products'> = {
      name: form.name,
      slug: form.slug,
      sku: form.sku,
      price: Number(form.price),
      weight_g: Number(form.weight_g),
      burn_hours: Number(form.burn_hours),
      collection_id: form.collection_id || null,
      description: form.description || null,
      details: form.details || null,
      suggested_use: form.suggested_use || null,
      composition: form.composition || null,
      notes: form.notes || null,
      ritual: form.ritual || null,
      accord: form.accord || null,
      visible: form.visible,
      is_bestseller: Boolean(form.is_bestseller),
      stock_quantity: Number(form.stock_quantity) || 0,
    };
    onSave({ insert, newFiles, removedImageIds });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Nome</label>
        <Input value={form.name} onChange={e => { const name = e.target.value; setForm(f => ({ ...f, name, slug: product ? f.slug : autoSlug(name) })); }} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Slug</label>
          <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">SKU</label>
          <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} required />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Descrição</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={3} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Preço (R$)</label>
          <Input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} required />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Peso (g)</label>
          <Input type="number" min="0" step="1" value={form.weight_g} onChange={e => setForm(f => ({ ...f, weight_g: Number(e.target.value) }))} required />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Queima (h)</label>
          <Input type="number" min="0" step="1" value={form.burn_hours} onChange={e => setForm(f => ({ ...f, burn_hours: Number(e.target.value) }))} required />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Coleção</label>
        <select value={form.collection_id} onChange={e => setForm(f => ({ ...f, collection_id: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent">
          <option value="">Sem coleção</option>
          {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Acorde</label>
        <Input value={form.accord} onChange={e => setForm(f => ({ ...f, accord: e.target.value }))} placeholder="ex: floral / amadeirado" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Detalhes</label>
        <textarea value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Sugestão de uso</label>
        <textarea value={form.suggested_use} onChange={e => setForm(f => ({ ...f, suggested_use: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Composição</label>
        <textarea value={form.composition} onChange={e => setForm(f => ({ ...f, composition: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Notas</label>
        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Ritual</label>
        <textarea value={form.ritual} onChange={e => setForm(f => ({ ...f, ritual: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Switch checked={form.visible} onCheckedChange={v => setForm(f => ({ ...f, visible: v }))} />
          <label className="text-sm">Visível</label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.is_bestseller} onCheckedChange={v => setForm(f => ({ ...f, is_bestseller: v }))} />
          <label className="text-sm">Bestseller</label>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Estoque</label>
          <Input
            type="number"
            min="0"
            step="1"
            className="w-24"
            value={form.stock_quantity}
            onChange={e => setForm(f => ({ ...f, stock_quantity: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Imagens</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {existingImages.map((img) => (
            <div key={img.id} className="relative w-20 h-20 border border-border rounded overflow-hidden group">
              <img src={productImagePublicUrl(img.filename)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeExistingImage(img.id)}
                className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remover imagem"
              >
                <X size={12} />
              </button>
              <span className="absolute bottom-0 left-0 bg-black/50 text-white text-[9px] px-1">{img.sort_order + 1}</span>
            </div>
          ))}
          {newFiles.map((file, i) => (
            <div key={`new-${i}`} className="relative w-20 h-20 border border-accent rounded overflow-hidden group">
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeNewFile(i)}
                className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remover arquivo"
              >
                <X size={12} />
              </button>
              <span className="absolute bottom-0 left-0 bg-accent text-accent-foreground text-[9px] px-1">novo</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs gap-1">
            <Upload size={12} /> Adicionar imagens
          </Button>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          {saving ? 'Salvando…' : product ? 'Salvar' : 'Criar'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancelar</Button>
      </div>
    </form>
  );
}

/* ═══════════ COLLECTIONS ═══════════ */
type CollectionFormPayload = {
  insert: TablesInsert<'collections'>;
  coverFile: File | null;
  removeCover: boolean;
};

function CollectionsTab() {
  const { toast } = useToast();
  const [collections, setCollections] = useState<AdminCollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCollectionRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCollectionRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [orderTarget, setOrderTarget] = useState<AdminCollectionRow | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const cols = await getAdminCollections();
      setCollections(cols);
    } catch (err) {
      console.error('[CollectionsTab] failed to load', err);
      toast({ title: 'Erro ao carregar coleções.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, []);

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: AdminCollectionRow) => { setEditing(c); setModalOpen(true); };

  const handleDelete = async (target: AdminCollectionRow) => {
    try {
      await deleteAdminCollection(target.id);
      setCollections(prev => prev.filter(c => c.id !== target.id));
      toast({ title: 'Coleção excluída com sucesso.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao excluir coleção.', variant: 'destructive' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSave = async (payload: CollectionFormPayload) => {
    setSaving(true);
    try {
      let coverUrl: string | null = payload.insert.cover_image ?? null;
      if (payload.coverFile) {
        coverUrl = await uploadCollectionCover(payload.coverFile);
      } else if (payload.removeCover) {
        coverUrl = null;
      }
      const fullInsert: TablesInsert<'collections'> = { ...payload.insert, cover_image: coverUrl };
      if (editing) {
        await updateAdminCollection(editing.id, fullInsert);
      } else {
        await createAdminCollection(fullInsert);
      }
      toast({ title: editing ? 'Coleção atualizada com sucesso.' : 'Coleção criada com sucesso.' });
      setModalOpen(false);
      void reload();
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao salvar coleção.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Coleções ({collections.length})</h3>
        <Button size="sm" onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1"><Plus size={14} /> Nova Coleção</Button>
      </div>

      {collections.length === 0 ? <EmptyState label="coleção" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(c => (
            <div key={c.id} className={`${cardCls} relative overflow-hidden`}>
              {c.cover_image && (
                <img src={c.cover_image} alt={c.name} className="w-full h-32 object-cover rounded mb-3" />
              )}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-sm">{c.numeral && <span className="text-muted-foreground mr-1">{c.numeral}</span>}{c.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                  {c.detail && <p className="text-xs text-muted-foreground mt-1">{c.detail}</p>}
                  {c.price_label && <p className="text-xs font-medium mt-1">{c.price_label}</p>}
                  <p className="text-xs text-muted-foreground mt-1">slug: <code className="font-mono">{c.slug}</code></p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {c.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <button onClick={() => openEdit(c)} className="text-xs text-accent hover:underline flex items-center gap-1"><Pencil size={12} /> Editar</button>
                <button onClick={() => setOrderTarget(c)} className="text-xs text-accent hover:underline flex items-center gap-1"><ArrowUpDown size={12} /> Ordenar produtos</button>
                <button onClick={() => setDeleteTarget(c)} className="text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 size={12} /> Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!orderTarget}
        onClose={() => setOrderTarget(null)}
        title={orderTarget ? `Ordenar produtos — ${orderTarget.name}` : 'Ordenar produtos'}
      >
        {orderTarget && (
          <CollectionProductsOrder
            collectionId={orderTarget.id}
            onClose={() => setOrderTarget(null)}
          />
        )}
      </Modal>

      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)} title={editing ? 'Editar Coleção' : 'Nova Coleção'}>
        <CollectionForm
          collection={editing}
          saving={saving}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Excluir coleção"
        description="Tem certeza que deseja excluir esta coleção? Esta ação não pode ser desfeita."
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  );
}

function CollectionForm({
  collection,
  saving,
  onSave,
  onCancel,
}: {
  collection: AdminCollectionRow | null;
  saving: boolean;
  onSave: (payload: CollectionFormPayload) => void;
  onCancel: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: collection?.name ?? '',
    slug: collection?.slug ?? '',
    description: collection?.description ?? '',
    numeral: collection?.numeral ?? '',
    detail: collection?.detail ?? '',
    story: collection?.story ?? '',
    price_label: collection?.price_label ?? '',
    is_active: collection?.is_active ?? true,
    sort_order: collection?.sort_order ?? 0,
  });
  const [existingCover, setExistingCover] = useState<string | null>(collection?.cover_image ?? null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const autoSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setRemoveCover(false);
    e.target.value = '';
  };

  const clearCover = () => {
    setCoverFile(null);
    setExistingCover(null);
    setRemoveCover(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const insert: TablesInsert<'collections'> = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      numeral: form.numeral || null,
      detail: form.detail || null,
      story: form.story || null,
      price_label: form.price_label || null,
      is_active: form.is_active,
      sort_order: form.sort_order,
      cover_image: existingCover,
    };
    onSave({ insert, coverFile, removeCover });
  };

  const previewSrc = coverFile ? URL.createObjectURL(coverFile) : existingCover;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Nome</label>
        <Input value={form.name} onChange={e => { const name = e.target.value; setForm(f => ({ ...f, name, slug: collection ? f.slug : autoSlug(name) })); }} required />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Slug</label>
        <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Numeral</label>
          <Input value={form.numeral} onChange={e => setForm(f => ({ ...f, numeral: e.target.value }))} placeholder="ex: I, II, III" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Detalhe</label>
          <Input value={form.detail} onChange={e => setForm(f => ({ ...f, detail: e.target.value }))} placeholder="ex: Latinha 160g · dois pavios" />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Descrição</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Story (texto da hero)</label>
        <textarea value={form.story} onChange={e => setForm(f => ({ ...f, story: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={3} placeholder="Texto descritivo longo para a hero da página da coleção" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Faixa de preço</label>
        <Input value={form.price_label} onChange={e => setForm(f => ({ ...f, price_label: e.target.value }))} placeholder="ex: a partir de R$ 72" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Imagem de capa</label>
        {previewSrc && (
          <div className="relative w-32 h-32 border border-border rounded overflow-hidden mb-2 group">
            <img src={previewSrc} alt="capa" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={clearCover}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded"
              aria-label="Remover capa"
            >
              <X size={12} />
            </button>
            {coverFile && (
              <span className="absolute bottom-0 left-0 bg-accent text-accent-foreground text-[9px] px-1">novo</span>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs gap-1">
          <Upload size={12} /> {previewSrc ? 'Trocar imagem' : 'Selecionar imagem'}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
          <label className="text-sm">Ativa</label>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Ordem</label>
          <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          {saving ? 'Salvando…' : collection ? 'Salvar' : 'Criar'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancelar</Button>
      </div>
    </form>
  );
}

/* ═══════════ COLLECTION PRODUCTS ORDER (drag-and-drop) ═══════════ */
type OrderItem = { id: string; name: string; sku: string; thumbnail: string | null };

function SortableProductRow({ item }: { item: OrderItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-2 border border-border rounded bg-card"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        aria-label="Arrastar"
      >
        <GripVertical size={16} />
      </button>
      <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-muted">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground font-mono truncate">{item.sku}</p>
      </div>
    </div>
  );
}

function CollectionProductsOrder({ collectionId, onClose }: { collectionId: string; onClose: () => void }) {
  const { toast } = useToast();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [originalIds, setOriginalIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAdminProductsByCollection(collectionId)
      .then(rows => {
        if (cancelled) return;
        const mapped: OrderItem[] = rows.map(r => {
          const firstImg = (r.product_images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)[0];
          return {
            id: r.id,
            name: r.name,
            sku: r.sku ?? '',
            thumbnail: firstImg ? productImagePublicUrl(firstImg.filename) : null,
          };
        });
        setItems(mapped);
        setOriginalIds(mapped.map(m => m.id));
      })
      .catch(err => {
        console.error('[CollectionProductsOrder] load failed', err);
        toast({ title: 'Erro ao carregar produtos da coleção.', variant: 'destructive' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [collectionId, toast]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems(prev => {
      const oldIndex = prev.findIndex(p => p.id === active.id);
      const newIndex = prev.findIndex(p => p.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const dirty = items.some((it, idx) => originalIds[idx] !== it.id);

  const handleSave = async () => {
    setSaving(true);
    try {
      const ordered = items.map((it, idx) => ({ id: it.id, sort_order: idx }));
      await updateProductsSortOrder(ordered);
      setOriginalIds(items.map(i => i.id));
      toast({ title: 'Ordem salva com sucesso.' });
      onClose();
    } catch (err) {
      console.error('[CollectionProductsOrder] save failed', err);
      toast({ title: 'Erro ao salvar ordem. Alguns produtos podem não ter sido atualizados.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Nenhum produto vinculado a esta coleção.</p>;
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">
        Arraste para reordenar. A ordem definida aqui aparece na página pública da coleção.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {items.map(item => <SortableProductRow key={item.id} item={item} />)}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex gap-2 pt-4 mt-4 border-t border-border">
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? 'Salvando…' : 'Salvar ordem'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
      </div>
    </div>
  );
}

/* ═══════════ BESTSELLER ORDER (drag-and-drop) ═══════════ */
function BestsellerProductsOrder({ products, onSaved }: { products: AdminProductRow[]; onSaved: () => void }) {
  const { toast } = useToast();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [originalIds, setOriginalIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    const bestsellers = products
      .filter(p => p.is_bestseller)
      .slice()
      .sort((a, b) => {
        const ao = a.bestseller_sort_order ?? 0;
        const bo = b.bestseller_sort_order ?? 0;
        if (ao !== bo) return ao - bo;
        // Tie-break: created_at desc (mantem o default antigo)
        return (b.created_at ?? '').localeCompare(a.created_at ?? '');
      });
    const mapped: OrderItem[] = bestsellers.map(p => {
      const firstImg = (p.product_images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)[0];
      return {
        id: p.id,
        name: p.name,
        sku: p.sku ?? '',
        thumbnail: firstImg ? productImagePublicUrl(firstImg.filename) : null,
      };
    });
    setItems(mapped);
    setOriginalIds(mapped.map(m => m.id));
  }, [products]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems(prev => {
      const oldIndex = prev.findIndex(p => p.id === active.id);
      const newIndex = prev.findIndex(p => p.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const dirty = items.some((it, idx) => originalIds[idx] !== it.id);

  const handleSave = async () => {
    setSaving(true);
    try {
      const ordered = items.map((it, idx) => ({ id: it.id, bestseller_sort_order: idx }));
      await updateBestsellerSortOrder(ordered);
      setOriginalIds(items.map(i => i.id));
      toast({ title: 'Ordem dos bestsellers salva.' });
      onSaved();
    } catch (err) {
      console.error('[BestsellerProductsOrder] save failed', err);
      toast({ title: 'Erro ao salvar ordem. Alguns produtos podem não ter sido atualizados.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        Nenhum produto marcado como bestseller. Marque a flag "Bestseller" em algum produto para começar.
      </p>
    );
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">
        Arraste para reordenar os {items.length} bestsellers. A ordem é usada por <code>getBestsellerProducts</code>.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {items.map(item => <SortableProductRow key={item.id} item={item} />)}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex gap-2 pt-4 mt-4 border-t border-border">
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? 'Salvando…' : 'Salvar ordem'}
        </Button>
      </div>
    </div>
  );
}

/* ═══════════ COLLABS ═══════════ */
function CollabsTab() {
  const { toast } = useToast();
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Collab | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    getAdminCollabs()
      .then(setCollabs)
      .catch(err => {
        console.error('[CollabsTab] load failed', err);
        toast({ title: 'Erro ao carregar collabs.', variant: 'destructive' });
      });
  }, [toast]);

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: Collab) => { setEditing(c); setModalOpen(true); };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdminCollab(id);
      setCollabs(prev => prev.filter(c => c.id !== id));
      setDeleteTarget(null);
      toast({ title: 'Collab excluída com sucesso.' });
    } catch (err) {
      console.error('[CollabsTab] delete failed', err);
      toast({ title: 'Erro ao excluir collab.', variant: 'destructive' });
    }
  };

  const handleSave = async (data: Partial<Collab>) => {
    try {
      if (editing) {
        const updated = await updateAdminCollab(editing.id, data);
        setCollabs(prev => prev.map(c => (c.id === editing.id ? updated : c)));
      } else {
        // Sempre adiciona ao fim. Inserir manualmente em uma posição
        // intermediaria duplicaria sort_order de alguma collab existente
        // e quebrava a renderizacao da home (chave React duplicada).
        // Reordenacao posterior via edicao explicita do campo Ordem.
        const nextSortOrder = collabs.length === 0
          ? 0
          : Math.max(...collabs.map(c => c.sort_order)) + 1;
        const created = await createAdminCollab({
          ...data,
          sort_order: nextSortOrder,
        });
        setCollabs(prev => [...prev, created]);
      }
      setModalOpen(false);
      toast({ title: editing ? 'Collab atualizada com sucesso.' : 'Collab criada com sucesso.' });
    } catch (err) {
      console.error('[CollabsTab] save failed', err);
      toast({ title: 'Erro ao salvar collab.', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Collabs ({collabs.length})</h3>
        <Button size="sm" onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1"><Plus size={14} /> Nova Collab</Button>
      </div>

      {collabs.length === 0 ? <EmptyState label="collab" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collabs.map(c => (
            <div key={c.id} className={cardCls}>
              <div className="flex gap-3">
                <div className="flex-shrink-0 flex gap-1">
                  {c.images.slice(0, 2).map((src, i) => (
                    <div key={i} className="w-16 h-20 overflow-hidden rounded border border-border">
                      {src.endsWith('.mp4') ? (
                        <VideoPlayer src={src} className="w-full h-full object-cover" />
                      ) : (
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{c.name}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  {c.caption && <p className="text-xs text-accent mt-0.5">{c.caption}</p>}
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">slug: <code className="font-mono">{c.slug}</code> · {c.images.length} mídia(s)</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <button onClick={() => openEdit(c)} className="text-xs text-accent hover:underline flex items-center gap-1"><Pencil size={12} /> Editar</button>
                <button onClick={() => setDeleteTarget(c.id)} className="text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 size={12} /> Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Collab' : 'Nova Collab'}>
        <CollabForm collab={editing} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Excluir collab"
        description="Tem certeza que deseja excluir esta collab? Esta ação não pode ser desfeita."
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  );
}

function CollabForm({ collab, onSave, onCancel }: { collab: Collab | null; onSave: (data: Partial<Collab>) => void; onCancel: () => void }) {
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

  const autoSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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

/* ═══════════ COUPONS ═══════════ */
type CouponFormPayload = {
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

function formatDiscount(c: Coupon): string {
  return c.type === 'percent'
    ? `${c.value}%`
    : `R$ ${c.value.toFixed(2)}`;
}

function formatValidity(c: Coupon): string {
  if (!c.valid_until) return 'Sem expiração';
  return new Date(c.valid_until).toLocaleDateString('pt-BR');
}

function formatUses(c: Coupon): string {
  if (c.max_uses == null) return `${c.current_uses}`;
  return `${c.current_uses}/${c.max_uses}`;
}

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

function CouponsTab() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [collections, setCollections] = useState<AdminCollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminCoupons(), getAdminCollections()])
      .then(([cs, cols]) => {
        setCoupons(cs);
        setCollections(cols);
      })
      .catch(err => {
        console.error('[CouponsTab] load failed', err);
        toast({ title: 'Erro ao carregar cupons.', variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const collectionName = (id: string | null) =>
    id ? collections.find(c => c.id === id)?.name ?? '—' : 'Todas';

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: Coupon) => { setEditing(c); setModalOpen(true); };

  // Toggle is_active otimista com rollback em erro.
  const handleToggleActive = async (coupon: Coupon) => {
    const next = !coupon.is_active;
    setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: next } : c));
    try {
      await updateAdminCoupon(coupon.id, { is_active: next });
      toast({ title: next ? 'Cupom ativado.' : 'Cupom desativado.' });
    } catch (err) {
      console.error('[CouponsTab] toggle failed', err);
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: coupon.is_active } : c));
      toast({ title: 'Erro ao alterar status do cupom.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdminCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      setDeleteTarget(null);
      toast({ title: 'Cupom excluído com sucesso.' });
    } catch (err) {
      console.error('[CouponsTab] delete failed', err);
      toast({ title: 'Erro ao excluir cupom.', variant: 'destructive' });
    }
  };

  const handleSave = async (data: CouponFormPayload) => {
    try {
      if (editing) {
        const updated = await updateAdminCoupon(editing.id, data);
        setCoupons(prev => prev.map(c => (c.id === editing.id ? updated : c)));
      } else {
        const created = await createAdminCoupon(data);
        setCoupons(prev => [created, ...prev]);
      }
      setModalOpen(false);
      toast({ title: editing ? 'Cupom atualizado com sucesso.' : 'Cupom criado com sucesso.' });
    } catch (err) {
      console.error('[CouponsTab] save failed', err);
      const msg = err instanceof Error ? err.message : 'Erro ao salvar cupom.';
      toast({ title: msg, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Cupons ({coupons.length})</h3>
        <Button size="sm" onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1"><Plus size={14} /> Novo Cupom</Button>
      </div>

      {coupons.length === 0 ? <EmptyState label="cupom" /> : (
        <div className="overflow-x-auto">
          <table className={tableCls}>
            <thead>
              <tr className="border-b border-border">
                <th className={thCls}>Código</th>
                <th className={thCls}>Tipo</th>
                <th className={thCls}>Valor</th>
                <th className={thCls}>Validade</th>
                <th className={thCls}>Usos</th>
                <th className={thCls}>Coleção</th>
                <th className={thCls}>Ativo</th>
                <th className={thCls}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b border-border">
                  <td className={`${tdCls} font-mono`}>{c.code}</td>
                  <td className={tdCls}>{c.type === 'percent' ? 'Percentual' : 'Valor fixo'}</td>
                  <td className={tdCls}>{formatDiscount(c)}</td>
                  <td className={tdCls}>{formatValidity(c)}</td>
                  <td className={tdCls}>{formatUses(c)}</td>
                  <td className={tdCls}>{collectionName(c.collection_id)}</td>
                  <td className={tdCls}>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} mr-2`}>
                      {c.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    <Switch checked={c.is_active} onCheckedChange={() => handleToggleActive(c)} />
                  </td>
                  <td className={tdCls}>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="text-accent hover:text-accent/80" title="Editar"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteTarget(c.id)} className="text-destructive hover:text-destructive/80" title="Excluir"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Cupom' : 'Novo Cupom'}>
        <CouponForm
          coupon={editing}
          collections={collections}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Excluir cupom"
        description="Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita."
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  );
}

function CouponForm({
  coupon,
  collections,
  onSave,
  onCancel,
}: {
  coupon: Coupon | null;
  collections: AdminCollectionRow[];
  onSave: (data: CouponFormPayload) => void;
  onCancel: () => void;
}) {
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

/* ═══════════ CAMPAIGNS ═══════════ */
function CampaignsTab() {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const previewHtml = `
    <div style="font-family:Georgia,serif;background:#f5f0eb;padding:32px;border-radius:4px;">
      <div style="background:#fffdf9;border:1px solid #e8dfd4;border-radius:4px;max-width:560px;margin:0 auto;overflow:hidden;">
        <div style="text-align:center;padding:28px 32px 20px;border-bottom:1px solid #e8dfd4;">
          <p style="margin:0;font-size:22px;letter-spacing:0.15em;color:#3a2e26;font-weight:400;text-transform:uppercase;">L O I Ê</p>
          <p style="margin:5px 0 0;font-size:10px;letter-spacing:0.2em;color:#9c8677;text-transform:uppercase;">Velas artesanais</p>
        </div>
        <div style="padding:24px 32px 8px;">
          <h2 style="margin:0 0 14px;font-size:20px;font-weight:400;color:#3a2e26;">${subject || '(sem assunto)'}</h2>
          <div style="font-size:14px;color:#5a4a3f;line-height:1.8;white-space:pre-wrap;">${content || '(sem conteúdo)'}</div>
        </div>
        <div style="text-align:center;padding:16px 32px;border-top:1px solid #e8dfd4;margin-top:24px;">
          <p style="margin:0;font-size:10px;color:#b0a090;">© ${new Date().getFullYear()} Loiê · Velas artesanais feitas com intenção</p>
          <p style="margin:4px 0 0;font-size:10px;color:#b0a090;">Descadastrar</p>
        </div>
      </div>
    </div>
  `;

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({ title: 'Preencha o assunto e o conteúdo antes de enviar.', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const { count } = await sendCampaign(subject, content);
      toast({ title: `Campanha enviada para ${count} destinatário(s).` });
    } catch (err: any) {
      toast({ title: err?.message || 'Erro ao enviar campanha.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Assunto</label>
        <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex: Novidades Loiê — coleção primavera" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Conteúdo</label>
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Escreva o texto do e-mail aqui..."
          className="min-h-[200px] resize-y"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={() => setPreviewOpen(true)} className="gap-1 text-sm">
          <Mail size={14} /> Pré-visualizar e-mail
        </Button>
        <Button
          onClick={handleSend}
          disabled={sending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1 text-sm"
        >
          <Send size={14} />
          {sending ? 'Enviando…' : 'Enviar para todos os clientes'}
        </Button>
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Pré-visualização do e-mail">
        <div
          className="rounded border border-border overflow-hidden"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </Modal>
    </div>
  );
}

/* ═══════════ NEWSLETTER ═══════════ */
function NewsletterTab() {
  const [subs, setSubs] = useState<NewsletterSubscriber[]>([]);

  useEffect(() => {
    getAdminNewsletter().then(setSubs);
  }, []);

  return (
    <div>
      <h3 className="text-sm font-medium mb-4">Assinantes Newsletter ({subs.length})</h3>
      {subs.length === 0 ? <EmptyState label="assinante" /> : (
        <div className="overflow-x-auto">
          <table className={tableCls}>
            <thead><tr className="border-b border-border"><th className={thCls}>E-mail</th><th className={thCls}>Cupom</th><th className={thCls}>Data</th></tr></thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.id} className="border-b border-border">
                  <td className={tdCls}>{s.email}</td>
                  <td className={`${tdCls} font-mono text-xs`}>{s.coupon_code}</td>
                  <td className={`${tdCls} text-muted-foreground`}>{s.subscribed_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ═══════════ CAMPAIGN ═══════════ */
function CampaignTab() {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({ title: 'Preencha o assunto e o conteúdo', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const emails = await getAdminNewsletterEmails();
      if (emails.length === 0) {
        toast({ title: 'Nenhum assinante encontrado' });
        setSending(false);
        return;
      }

      let sent = 0;
      let failed = 0;
      for (const email of emails) {
        try {
          await sendCampaignEmail(subject.trim(), content.trim(), email);
          sent++;
        } catch {
          failed++;
        }
      }

      toast({
        title: `Campanha enviada`,
        description: `${sent} e-mail(s) enviado(s)${failed > 0 ? `, ${failed} falha(s)` : ''}`,
      });
      setSubject('');
      setContent('');
    } catch {
      toast({ title: 'Erro ao enviar campanha', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-1">Campanha de e-mail</h3>
        <p className="text-xs text-muted-foreground">O e-mail será enviado para todos os assinantes da newsletter. Inclui link de descadastro automaticamente.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Assunto</label>
          <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="ex: Novidades da Loiê — nova coleção disponível" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Conteúdo (HTML ou texto simples)</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={10}
            placeholder={'<p>Olá! Temos novidades para você...</p>\n\n<p>Texto do e-mail aqui.</p>'}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-y font-mono"
          />
        </div>

        {subject && content && (
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Pré-visualização</label>
            <div
              className="border border-border rounded-md p-4 bg-[#fcf5e0] text-[#29241f] text-sm"
              style={{ fontFamily: "'Wagon', sans-serif" }}
            >
              <div className="text-center mb-4 pb-3 border-b border-[#e8dfc8]">
                <p className="text-base font-normal tracking-[0.3em] uppercase">LOIÊ</p>
                <p className="text-xs text-[#726f09] mt-1">{subject}</p>
              </div>
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </div>
        )}

        <Button onClick={handleSend} disabled={!subject.trim() || !content.trim() || sending} className="gap-2">
          <Send size={14} /> {sending ? 'Enviando...' : 'Enviar para todos os assinantes'}
        </Button>
      </div>
    </div>
  );
}

function MensagensTab() {
  const [mensagens, setMensagens] = useState<{ id: string; nome: string; assunto: string | null; mensagem: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminMensagens()
      .then(setMensagens)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-4">Mensagens recebidas ({mensagens.length})</h3>
      {loading ? (
        <p className="text-xs text-muted-foreground">Carregando...</p>
      ) : mensagens.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhuma mensagem ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground w-36">data</th>
                <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground w-32">nome</th>
                <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground w-24">assunto</th>
                <th className="text-left py-2 text-xs font-medium text-muted-foreground">mensagem</th>
              </tr>
            </thead>
            <tbody>
              {mensagens.map((m) => (
                <tr key={m.id} className="border-b border-border/50 align-top">
                  <td className="py-3 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(m.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 pr-4 text-xs">{m.nome}</td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground">{m.assunto ?? '—'}</td>
                  <td className="py-3 text-xs leading-relaxed" style={{ maxWidth: 480 }}>{m.mensagem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Admin;
