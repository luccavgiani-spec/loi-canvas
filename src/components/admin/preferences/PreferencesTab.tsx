import { Button } from '@/components/ui/button';
import { useAdminPreferences, type AdminFontSize, type AdminDensity, type AdminTypography } from './AdminPreferencesContext';

const FONT_SIZE_OPTIONS: Array<{ value: AdminFontSize; label: string; px: string }> = [
  { value: 'pequeno', label: 'Pequeno', px: '14px' },
  { value: 'normal',  label: 'Normal',  px: '16px' },
  { value: 'grande',  label: 'Grande',  px: '18px' },
  { value: 'extra',   label: 'Extra',   px: '20px' },
];

const DENSITY_OPTIONS: Array<{ value: AdminDensity; label: string; hint: string }> = [
  { value: 'compacto',    label: 'Compacto',    hint: 'menos espaço entre elementos' },
  { value: 'normal',      label: 'Normal',      hint: 'espaçamento padrão' },
  { value: 'confortavel', label: 'Confortável', hint: 'mais respiro entre elementos' },
];

const TYPOGRAPHY_OPTIONS: Array<{ value: AdminTypography; label: string; hint: string }> = [
  { value: 'sistema',  label: 'Sistema',  hint: 'sans-serif do sistema (padrão)' },
  { value: 'serifada', label: 'Serifada', hint: 'Cormorant Garamond para leitura confortável' },
];

const cardCls = 'border border-border rounded-md p-5 bg-card space-y-3';
const labelCls = 'block text-xs uppercase tracking-wider text-muted-foreground mb-1.5';

export function PreferencesTab() {
  const { prefs, setPrefs, reset } = useAdminPreferences();

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h2 className="text-lg font-medium">Preferências do painel</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ajustes locais de tamanho, espaçamento e tipografia da interface administrativa.
          Salvos no seu navegador (não afetam o site público nem outros usuários).
        </p>
      </header>

      {/* Tamanho da fonte */}
      <section className={cardCls}>
        <div>
          <label className={labelCls}>Tamanho da fonte</label>
          <p className="text-xs text-muted-foreground">
            Define o tamanho base do texto em todo o painel. Tudo escala proporcionalmente.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {FONT_SIZE_OPTIONS.map((opt) => {
            const active = prefs.fontSize === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setPrefs({ fontSize: opt.value })}
                className={`text-sm px-4 py-3 rounded-md border transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className="font-medium">{opt.label}</div>
                <div className={`text-xs mt-0.5 ${active ? 'opacity-80' : 'text-muted-foreground'}`}>{opt.px}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Densidade */}
      <section className={cardCls}>
        <div>
          <label className={labelCls}>Densidade</label>
          <p className="text-xs text-muted-foreground">
            Quanto espaço entre elementos. Vale para containers que respeitam a variável
            <code className="mx-1 px-1 py-0.5 bg-muted rounded text-[11px]">--admin-density-scale</code>.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {DENSITY_OPTIONS.map((opt) => {
            const active = prefs.density === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setPrefs({ density: opt.value })}
                className={`text-sm px-4 py-3 rounded-md border transition-colors text-left ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className="font-medium">{opt.label}</div>
                <div className={`text-xs mt-0.5 ${active ? 'opacity-80' : 'text-muted-foreground'}`}>{opt.hint}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tipografia */}
      <section className={cardCls}>
        <div>
          <label className={labelCls}>Tipografia da UI</label>
          <p className="text-xs text-muted-foreground">
            Família de fonte aplicada ao texto corrido do painel.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {TYPOGRAPHY_OPTIONS.map((opt) => {
            const active = prefs.typography === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setPrefs({ typography: opt.value })}
                className={`text-sm px-4 py-3 rounded-md border transition-colors text-left ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className="font-medium">{opt.label}</div>
                <div className={`text-xs mt-0.5 ${active ? 'opacity-80' : 'text-muted-foreground'}`}>{opt.hint}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Preview */}
      <section className={cardCls}>
        <div>
          <label className={labelCls}>Preview</label>
          <p className="text-xs text-muted-foreground">Sample renderizado com as preferências atuais.</p>
        </div>
        <div className="border border-border rounded-md p-4 bg-background space-y-2">
          <h3 className="text-lg font-medium">Cabeçalho de exemplo</h3>
          <p className="text-base">
            Este é um parágrafo de exemplo para validar o tamanho da fonte e o espaçamento.
          </p>
          <p className="text-sm text-muted-foreground">
            Texto secundário, geralmente usado em legendas, hints e descrições subordinadas.
          </p>
        </div>
      </section>

      <div className="flex justify-end">
        <Button variant="outline" onClick={reset} className="text-sm">
          Restaurar padrões
        </Button>
      </div>
    </div>
  );
}

export default PreferencesTab;
