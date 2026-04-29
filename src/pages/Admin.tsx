import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  getAdminKPIs, getAdminSalesTimeseries, getAdminTopProducts, getAdminCustomers,
  getAdminNewsletter,
  sendCampaign, sendCampaignEmail, getAdminNewsletterEmails,
  getAdminMensagens,
} from '@/lib/api';
import type { KPIs, SalesTimeseriesPoint, TopProduct, Customer, NewsletterSubscriber } from '@/types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, ShoppingCart, Users, TrendingUp, Mail, Send } from 'lucide-react';
import { cardCls, tableCls, thCls, tdCls } from '@/components/admin/shared/styles';
import { EmptyState } from '@/components/admin/shared/EmptyState';
import { Modal } from '@/components/admin/shared/Modal';
import { ProductsTab } from '@/components/admin/products/ProductsTab';
import { CollectionsTab } from '@/components/admin/collections/CollectionsTab';
import { CouponsTab } from '@/components/admin/coupons/CouponsTab';
import { ReviewsTab } from '@/components/admin/reviews/ReviewsTab';
import { CollabsTab } from '@/components/admin/collabs/CollabsTab';
import { OrdersTab } from '@/components/admin/orders/OrdersTab';

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
