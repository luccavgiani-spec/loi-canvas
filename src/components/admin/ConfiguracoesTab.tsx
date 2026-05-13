import { useState } from 'react';
import { SiteContentTab } from '@/components/admin/site-content/SiteContentTab';
import { PreferencesTab } from '@/components/admin/preferences/PreferencesTab';

type SubTab = 'conteudo' | 'painel';

const SUBTABS: Array<{ value: SubTab; label: string; hint: string }> = [
  { value: 'conteudo', label: 'Conteúdo do site', hint: 'textos, imagens e listas das páginas' },
  { value: 'painel',   label: 'Painel',           hint: 'preferências de UI do admin' },
];

/**
 * Aba "Configurações Gerais" do painel admin. Agrupa:
 * - Conteúdo do site (site_content): textos, imagens, listas das páginas
 * - Painel: preferências de UI do admin (tamanho, densidade, tipografia)
 *
 * Nav editorial customizada (underline + caps Sackers) — distinta da
 * TabsList superior do shadcn pra evitar duplo bg-muted aninhado.
 */
export function ConfiguracoesTab() {
  const [sub, setSub] = useState<SubTab>('conteudo');
  const active = SUBTABS.find((t) => t.value === sub);

  return (
    <div className="space-y-5">
      <nav
        role="tablist"
        aria-label="Sub-abas de configurações gerais"
        className="flex items-end gap-8 border-b border-border"
      >
        {SUBTABS.map((t) => {
          const isActive = sub === t.value;
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => setSub(t.value)}
              className={`relative pb-3 -mb-px text-sm tracking-[0.18em] uppercase transition-colors ${
                isActive
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground/70 hover:text-foreground'
              }`}
              style={{ fontFamily: "'Sackers Gothic', sans-serif", fontWeight: isActive ? 400 : 300 }}
            >
              {t.label}
              <span
                aria-hidden
                className={`absolute left-0 right-0 bottom-0 h-[2px] transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ background: '#29241f' }}
              />
            </button>
          );
        })}
      </nav>

      {active && (
        <p className="text-xs text-muted-foreground/70 -mt-2">{active.hint}</p>
      )}

      <div role="tabpanel" className="pt-2">
        {sub === 'conteudo' && <SiteContentTab />}
        {sub === 'painel' && <PreferencesTab />}
      </div>
    </div>
  );
}

export default ConfiguracoesTab;
