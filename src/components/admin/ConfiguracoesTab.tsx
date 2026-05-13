import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SiteContentTab } from '@/components/admin/site-content/SiteContentTab';
import { PreferencesTab } from '@/components/admin/preferences/PreferencesTab';

const SUBTABS = [
  { value: 'conteudo', label: 'Conteúdo do site' },
  { value: 'painel',   label: 'Painel' },
] as const;

/**
 * Aba "Configurações Gerais" do painel admin. Agrupa:
 * - Conteúdo do site (site_content): textos, imagens, listas das páginas
 * - Painel: preferências de UI do admin (tamanho, densidade, tipografia)
 */
export function ConfiguracoesTab() {
  const [sub, setSub] = useState<string>('conteudo');

  return (
    <div className="space-y-5">
      <Tabs value={sub} onValueChange={setSub} className="space-y-5">
        <TabsList className="flex flex-wrap">
          {SUBTABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="conteudo"><SiteContentTab /></TabsContent>
        <TabsContent value="painel"><PreferencesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

export default ConfiguracoesTab;
