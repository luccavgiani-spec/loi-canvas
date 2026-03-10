import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  getAdminKPIs, getAdminSalesTimeseries, getAdminTopProducts, getAdminOrders, getAdminCustomers,
  getAdminNewsletter, getAdminCoupons, getAdminCollections, getAdminCollabs,
  createAdminProduct, updateAdminProduct, deleteAdminProduct,
  createAdminCollection, updateAdminCollection, deleteAdminCollection,
  createAdminCollab, updateAdminCollab, deleteAdminCollab,
} from '@/lib/api';
import { mockProducts } from '@/lib/mocks';
import type { KPIs, SalesTimeseriesPoint, TopProduct, Order, Customer, NewsletterSubscriber, Coupon, Product, Collection, Collab } from '@/types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { DollarSign, ShoppingCart, Users, TrendingUp, Plus, Pencil, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';

/* ─────────── Shared styles ─────────── */
const cardCls = 'bg-card border border-border rounded-lg p-4';
const tableCls = 'w-full text-sm';
const thCls = 'py-3 pr-4 text-left text-xs text-muted-foreground uppercase tracking-wider';
const tdCls = 'py-3 pr-4';

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
          <h2 className="text-lg font-heading font-semibold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─────────── Image Upload UI ─────────── */
function ImageUploader({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange([...images, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
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
              <video src={src} className="w-full h-full object-cover" muted />
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
        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="text-xs gap-1">
          <Upload size={12} /> Upload
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleUrlAdd} className="text-xs gap-1">
          <ImageIcon size={12} /> URL
        </Button>
      </div>
    </div>
  );
}

/* ═══════════ ADMIN ═══════════ */
const Admin = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');

  if (!isAuth) {
    return (
      <Layout hideFooter>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="max-w-sm w-full p-8 bg-card border border-border rounded-lg">
            <h1 className="heading-display text-2xl mb-4 text-center">Admin</h1>
            <p className="text-xs text-muted-foreground text-center mb-6">Placeholder auth — será substituído por Supabase Auth</p>
            <Input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="mb-3" />
            <Button onClick={() => setIsAuth(true)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
              Entrar
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <div className="container py-8">
        <h1 className="heading-display text-3xl mb-6">Painel Admin</h1>
        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="collections">Coleções</TabsTrigger>
            <TabsTrigger value="collabs">Collabs</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="customers"><CustomersTab /></TabsContent>
          <TabsContent value="products"><ProductsTab /></TabsContent>
          <TabsContent value="collections"><CollectionsTab /></TabsContent>
          <TabsContent value="collabs"><CollabsTab /></TabsContent>
          <TabsContent value="newsletter"><NewsletterTab /></TabsContent>
        </Tabs>
      </div>
    </Layout>
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    getAdminOrders({ status: status || undefined }).then(setOrders);
  }, [status]);

  const statuses = ['', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'];

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
          <thead><tr className="border-b border-border"><th className={thCls}>Pedido</th><th className={thCls}>Cliente</th><th className={thCls}>Status</th><th className={thCls}>Total</th><th className={thCls}>Data</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-border">
                <td className={`${tdCls} font-medium`}>{o.id}</td>
                <td className={tdCls}>{o.customer.name}</td>
                <td className={tdCls}><span className="badge-product badge-new rounded-sm">{o.status}</span></td>
                <td className={tdCls}>R$ {o.total.toFixed(2)}</td>
                <td className={`${tdCls} text-muted-foreground`}>{o.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
function ProductsTab() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => { getAdminCollections().then(setCollections); }, []);

  const emptyProduct: Partial<Product> = { name: '', slug: '', description: '', price: 0, collection: '', images: [], tags: [], badge: undefined, is_bestseller: false };

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setModalOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    try { await deleteAdminProduct(id); } catch { /* mock */ }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleSave = async (data: Partial<Product>) => {
    if (editing) {
      try { await updateAdminProduct(editing.id, data); } catch { /* mock */ }
      setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...data } as Product : p));
    } else {
      const newP = { ...emptyProduct, ...data, id: `new-${Date.now()}`, rating_avg: 0, rating_count: 0, created_at: new Date().toISOString().split('T')[0] } as Product;
      try { await createAdminProduct(data); } catch { /* mock */ }
      setProducts(prev => [...prev, newP]);
    }
    setModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Produtos ({products.length})</h3>
        <Button size="sm" onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1"><Plus size={14} /> Novo Produto</Button>
      </div>
      <div className="overflow-x-auto">
        <table className={tableCls}>
          <thead>
            <tr className="border-b border-border">
              <th className={thCls}>Produto</th>
              <th className={thCls}>Coleção</th>
              <th className={thCls}>Preço</th>
              <th className={thCls}>Badge</th>
              <th className={thCls}>Bestseller</th>
              <th className={thCls}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-border">
                <td className={tdCls}>
                  <div className="flex items-center gap-2">
                    <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded object-cover" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className={`${tdCls} text-muted-foreground`}>{p.collection}</td>
                <td className={tdCls}>R$ {p.price.toFixed(2)}</td>
                <td className={tdCls}>{p.badge && <span className={`badge-product badge-${p.badge} rounded-sm`}>{p.badge}</span>}</td>
                <td className={tdCls}>{p.is_bestseller ? 'Sim' : '—'}</td>
                <td className={tdCls}>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-accent hover:text-accent/80"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive/80"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Produto' : 'Novo Produto'}>
        <ProductForm product={editing} collections={collections} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}

function ProductForm({ product, collections, onSave, onCancel }: { product: Product | null; collections: Collection[]; onSave: (data: Partial<Product>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    details: product?.details || '',
    how_to_use: product?.how_to_use || '',
    care_instructions: product?.care_instructions || '',
    price: product?.price || 0,
    compare_at_price: product?.compare_at_price || 0,
    collection: product?.collection || '',
    tags: product?.tags?.join(', ') || '',
    badge: product?.badge || '',
    is_bestseller: product?.is_bestseller || false,
    images: product?.images || [] as string[],
  });

  const autoSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name,
      slug: form.slug,
      description: form.description,
      details: form.details || undefined,
      how_to_use: form.how_to_use || undefined,
      care_instructions: form.care_instructions || undefined,
      price: Number(form.price),
      compare_at_price: Number(form.compare_at_price) || undefined,
      collection: form.collection,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      badge: (form.badge as Product['badge']) || undefined,
      is_bestseller: form.is_bestseller,
      images: form.images,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Nome</label>
        <Input value={form.name} onChange={e => { const name = e.target.value; setForm(f => ({ ...f, name, slug: product ? f.slug : autoSlug(name) })); }} required />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Slug</label>
        <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Descrição</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Preço (R$)</label>
          <Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Preço anterior</label>
          <Input type="number" step="0.01" value={form.compare_at_price} onChange={e => setForm(f => ({ ...f, compare_at_price: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Coleção</label>
          <select value={form.collection} onChange={e => setForm(f => ({ ...f, collection: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent">
            <option value="">Selecione...</option>
            {collections.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Badge</label>
          <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent">
            <option value="">Nenhum</option>
            <option value="new">Novo</option>
            <option value="sale">Promoção</option>
            <option value="limited">Edição Limitada</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Tags (separadas por vírgula)</label>
        <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="floral, cítrico" />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={form.is_bestseller} onCheckedChange={v => setForm(f => ({ ...f, is_bestseller: v }))} />
        <label className="text-sm">Bestseller</label>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Detalhes</label>
        <textarea value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Como usar</label>
        <textarea value={form.how_to_use} onChange={e => setForm(f => ({ ...f, how_to_use: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Cuidados</label>
        <textarea value={form.care_instructions} onChange={e => setForm(f => ({ ...f, care_instructions: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Imagens</label>
        <ImageUploader images={form.images} onChange={imgs => setForm(f => ({ ...f, images: imgs }))} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">{product ? 'Salvar' : 'Criar'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}

/* ═══════════ COLLECTIONS ═══════════ */
function CollectionsTab() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);

  useEffect(() => { getAdminCollections().then(setCollections); }, []);

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: Collection) => { setEditing(c); setModalOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta coleção?')) return;
    try { await deleteAdminCollection(id); } catch { /* mock */ }
    setCollections(prev => prev.filter(c => c.id !== id));
  };

  const handleSave = async (data: Partial<Collection>) => {
    if (editing) {
      try { await updateAdminCollection(editing.id, data); } catch { /* mock */ }
      setCollections(prev => prev.map(c => c.id === editing.id ? { ...c, ...data } as Collection : c));
    } else {
      const newC = { ...data, id: `col-${Date.now()}`, is_active: true, sort_order: collections.length, created_at: new Date().toISOString().split('T')[0] } as Collection;
      try { await createAdminCollection(data); } catch { /* mock */ }
      setCollections(prev => [...prev, newC]);
    }
    setModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Coleções ({collections.length})</h3>
        <Button size="sm" onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1"><Plus size={14} /> Nova Coleção</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map(c => (
          <div key={c.id} className={`${cardCls} relative overflow-hidden`}>
            {c.cover_image && (
              <img src={c.cover_image} alt={c.name} className="w-full h-32 object-cover rounded mb-3" />
            )}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-sm">{c.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                <p className="text-xs text-muted-foreground mt-1">slug: <code className="font-mono">{c.slug}</code></p>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {c.is_active ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <button onClick={() => openEdit(c)} className="text-xs text-accent hover:underline flex items-center gap-1"><Pencil size={12} /> Editar</button>
              <button onClick={() => handleDelete(c.id)} className="text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 size={12} /> Excluir</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Coleção' : 'Nova Coleção'}>
        <CollectionForm collection={editing} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}

function CollectionForm({ collection, onSave, onCancel }: { collection: Collection | null; onSave: (data: Partial<Collection>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: collection?.name || '',
    slug: collection?.slug || '',
    description: collection?.description || '',
    cover_image: collection?.cover_image || '',
    is_active: collection?.is_active ?? true,
    sort_order: collection?.sort_order ?? 0,
  });

  const coverImages = form.cover_image ? [form.cover_image] : [];
  const autoSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form });
  };

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
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Descrição</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent resize-none" rows={2} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Imagem de capa</label>
        <ImageUploader images={coverImages} onChange={imgs => setForm(f => ({ ...f, cover_image: imgs[imgs.length - 1] || '' }))} />
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
        <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">{collection ? 'Salvar' : 'Criar'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}

/* ═══════════ COLLABS ═══════════ */
function CollabsTab() {
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Collab | null>(null);

  useEffect(() => { getAdminCollabs().then(setCollabs); }, []);

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: Collab) => { setEditing(c); setModalOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta collab?')) return;
    try { await deleteAdminCollab(id); } catch { /* mock */ }
    setCollabs(prev => prev.filter(c => c.id !== id));
  };

  const handleSave = async (data: Partial<Collab>) => {
    if (editing) {
      try { await updateAdminCollab(editing.id, data); } catch { /* mock */ }
      setCollabs(prev => prev.map(c => c.id === editing.id ? { ...c, ...data } as Collab : c));
    } else {
      const newC = { ...data, id: `cb-${Date.now()}`, is_active: true, sort_order: collabs.length, created_at: new Date().toISOString().split('T')[0] } as Collab;
      try { await createAdminCollab(data); } catch { /* mock */ }
      setCollabs(prev => [...prev, newC]);
    }
    setModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Collabs ({collabs.length})</h3>
        <Button size="sm" onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1"><Plus size={14} /> Nova Collab</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {collabs.map(c => (
          <div key={c.id} className={cardCls}>
            <div className="flex gap-3">
              <div className="flex-shrink-0 flex gap-1">
                {c.images.slice(0, 2).map((src, i) => (
                  <div key={i} className="w-16 h-20 overflow-hidden rounded border border-border">
                    {src.endsWith('.mp4') ? (
                      <video src={src} className="w-full h-full object-cover" muted />
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
              <button onClick={() => handleDelete(c.id)} className="text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 size={12} /> Excluir</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Collab' : 'Nova Collab'}>
        <CollabForm collab={editing} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}

function CollabForm({ collab, onSave, onCancel }: { collab: Collab | null; onSave: (data: Partial<Collab>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: collab?.name || '',
    slug: collab?.slug || '',
    caption: collab?.caption || '',
    description: collab?.description || '',
    images: collab?.images || [] as string[],
    is_active: collab?.is_active ?? true,
    sort_order: collab?.sort_order ?? 0,
  });

  const autoSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        <ImageUploader images={form.images} onChange={imgs => setForm(f => ({ ...f, images: imgs }))} />
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
        <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">{collab ? 'Salvar' : 'Criar'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}

/* ═══════════ NEWSLETTER ═══════════ */
function NewsletterTab() {
  const [subs, setSubs] = useState<NewsletterSubscriber[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    getAdminNewsletter().then(setSubs);
    getAdminCoupons().then(setCoupons);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4">Assinantes Newsletter ({subs.length})</h3>
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
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Cupons</h3>
        <div className="overflow-x-auto">
          <table className={tableCls}>
            <thead><tr className="border-b border-border"><th className={thCls}>Código</th><th className={thCls}>Desconto</th><th className={thCls}>Usos</th><th className={thCls}>Status</th></tr></thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b border-border">
                  <td className={`${tdCls} font-mono`}>{c.code}</td>
                  <td className={tdCls}>{c.discount_percent}%</td>
                  <td className={tdCls}>{c.uses}</td>
                  <td className={tdCls}>{c.is_active ? <span className="text-green-600 text-xs">Ativo</span> : <span className="text-muted-foreground text-xs">Inativo</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Admin;
