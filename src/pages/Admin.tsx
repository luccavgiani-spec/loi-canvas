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
  getAdminReviews, approveAdminReview, unpublishAdminReview, deleteAdminReview, createAdminReview,
} from '@/lib/api';
import type { AdminProductRow, AdminCollectionRow, AdminReview } from '@/lib/api';
import { uploadCollabMedia } from '@/lib/storage';
import type { KPIs, SalesTimeseriesPoint, TopProduct, Order, Customer, NewsletterSubscriber, Coupon, Collab } from '@/types';
import type { TablesInsert, TablesUpdate, Tables } from '@/integrations/supabase/types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, ShoppingCart, Users, TrendingUp, Plus, Pencil, Trash2, X, Upload, Package, Truck, Mail, Send, ArrowUpDown, Eye, Star, Check } from 'lucide-react';
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
} from '@dnd-kit/sortable';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { cardCls, tableCls, thCls, tdCls } from '@/components/admin/shared/styles';
import { ConfirmDeleteDialog } from '@/components/admin/shared/ConfirmDeleteDialog';
import { EmptyState } from '@/components/admin/shared/EmptyState';
import { Modal } from '@/components/admin/shared/Modal';
import { ImageUploader } from '@/components/admin/shared/ImageUploader';
import { SortableProductRow, type OrderItem } from '@/components/admin/shared/SortableProductRow';
import { ProductsTab } from '@/components/admin/products/ProductsTab';
import { CollectionsTab } from '@/components/admin/collections/CollectionsTab';
import { CouponsTab } from '@/components/admin/coupons/CouponsTab';

/* ═══════════ ADMIN ═══════════ */
const ADMIN_TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'orders', label: 'Pedidos' },
  { value: 'customers', label: 'Clientes' },
  { value: 'products', label: 'Produtos' },
  { value: 'collections', label: 'Coleções' },
  { value: 'collabs', label: 'Collabs' },
  { value: 'coupons', label: 'Cupons' },
  { value: 'reviews', label: 'Avaliações' },
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
        <TabsContent value="reviews"><ReviewsTab /></TabsContent>
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


/* ═══════════ REVIEWS ═══════════ */
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

function ReviewsTab() {
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

function CreateReviewForm({ onCreated }: { onCreated: () => void }) {
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
