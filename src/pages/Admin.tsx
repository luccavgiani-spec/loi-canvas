import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getAdminKPIs, getAdminSalesTimeseries, getAdminTopProducts, getAdminOrders, getAdminCustomers, getAdminNewsletter, getAdminCoupons } from '@/lib/api';
import { mockProducts } from '@/lib/mocks';
import type { KPIs, SalesTimeseriesPoint, TopProduct, Order, Customer, NewsletterSubscriber, Coupon, Product } from '@/types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';

const Admin = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');

  // Simple placeholder guard
  if (!isAuth) {
    return (
      <Layout hideFooter>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="max-w-sm w-full p-8 bg-card border border-border rounded-lg">
            <h1 className="heading-display text-2xl mb-4 text-center">Admin</h1>
            <p className="text-xs text-muted-foreground text-center mb-6">Placeholder auth — será substituído por Supabase Auth</p>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mb-3"
            />
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
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="customers"><CustomersTab /></TabsContent>
          <TabsContent value="products"><ProductsTab /></TabsContent>
          <TabsContent value="newsletter"><NewsletterTab /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

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

  if (!kpis) return <div className="space-y-4">{Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-20"/>)}</div>;

  const kpiCards = [
    { label: 'Receita', value: `R$ ${kpis.total_revenue.toLocaleString()}`, icon: DollarSign },
    { label: 'Pedidos', value: kpis.total_orders, icon: ShoppingCart },
    { label: 'Ticket Médio', value: `R$ ${kpis.avg_order_value.toFixed(0)}`, icon: TrendingUp },
    { label: 'Novos Clientes', value: kpis.new_customers, icon: Users },
  ];

  // Projection
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
          <div key={k.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <k.icon size={14} className="text-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{k.label}</span>
            </div>
            <p className="text-xl font-heading font-semibold">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
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

      <div className="bg-card border border-border rounded-lg p-4">
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="py-3 pr-4">Pedido</th>
              <th className="py-3 pr-4">Cliente</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Total</th>
              <th className="py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-border">
                <td className="py-3 pr-4 font-medium">{o.id}</td>
                <td className="py-3 pr-4">{o.customer.name}</td>
                <td className="py-3 pr-4"><span className="badge-product badge-new rounded-sm">{o.status}</span></td>
                <td className="py-3 pr-4">R$ {o.total.toFixed(2)}</td>
                <td className="py-3 text-muted-foreground">{o.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    getAdminCustomers().then(setCustomers);
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
            <th className="py-3 pr-4">Nome</th>
            <th className="py-3 pr-4">E-mail</th>
            <th className="py-3 pr-4">Pedidos</th>
            <th className="py-3 pr-4">Total Gasto</th>
            <th className="py-3">Desde</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id} className="border-b border-border">
              <td className="py-3 pr-4 font-medium">{c.name}</td>
              <td className="py-3 pr-4 text-muted-foreground">{c.email}</td>
              <td className="py-3 pr-4">{c.orders_count}</td>
              <td className="py-3 pr-4">R$ {c.total_spent?.toFixed(2)}</td>
              <td className="py-3 text-muted-foreground">{c.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>(mockProducts);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Produtos ({products.length})</h3>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">+ Novo Produto</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="py-3 pr-4">Produto</th>
              <th className="py-3 pr-4">Coleção</th>
              <th className="py-3 pr-4">Preço</th>
              <th className="py-3 pr-4">Badge</th>
              <th className="py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-border">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded object-cover" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{p.collection}</td>
                <td className="py-3 pr-4">R$ {p.price.toFixed(2)}</td>
                <td className="py-3 pr-4">{p.badge && <span className={`badge-product badge-${p.badge} rounded-sm`}>{p.badge}</span>}</td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button className="text-xs text-accent underline">Editar</button>
                    <button className="text-xs text-destructive underline">Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="py-3 pr-4">E-mail</th>
                <th className="py-3 pr-4">Cupom</th>
                <th className="py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.id} className="border-b border-border">
                  <td className="py-3 pr-4">{s.email}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{s.coupon_code}</td>
                  <td className="py-3 text-muted-foreground">{s.subscribed_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Cupons</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="py-3 pr-4">Código</th>
                <th className="py-3 pr-4">Desconto</th>
                <th className="py-3 pr-4">Usos</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b border-border">
                  <td className="py-3 pr-4 font-mono">{c.code}</td>
                  <td className="py-3 pr-4">{c.discount_percent}%</td>
                  <td className="py-3 pr-4">{c.uses}</td>
                  <td className="py-3">{c.is_active ? <span className="text-badge-new text-xs">Ativo</span> : <span className="text-muted-foreground text-xs">Inativo</span>}</td>
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
