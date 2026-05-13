import type { PresentationOverrides } from '@/lib/site-content/types';

interface Props {
  value: PresentationOverrides;
  onChange: (next: PresentationOverrides) => void;
  /** se false, esconde controle de posicao_vertical (só faz sentido em
   *  seções com imagem ao lado do texto). */
  showVertical?: boolean;
}

const selectCls =
  'w-full border border-border rounded-md px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-ring';

const labelCls = 'block text-xs uppercase tracking-wider text-muted-foreground mb-1.5';

const PresentationControls = ({ value, onChange, showVertical = false }: Props) => {
  const set = (patch: Partial<PresentationOverrides>) => onChange({ ...value, ...patch });

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 p-4 border border-dashed border-border rounded-md">
      <div>
        <label className={labelCls}>Fonte</label>
        <select className={selectCls} value={value.fonte ?? 'padrao'} onChange={(e) => set({ fonte: e.target.value as PresentationOverrides['fonte'] })}>
          <option value="padrao">padrão</option>
          <option value="wagon">Wagon</option>
          <option value="sackers">Sackers Gothic</option>
          <option value="cormorant">Cormorant Garamond</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Tamanho</label>
        <select className={selectCls} value={value.tamanho ?? 'padrao'} onChange={(e) => set({ tamanho: e.target.value as PresentationOverrides['tamanho'] })}>
          <option value="padrao">padrão</option>
          <option value="pequeno">pequeno</option>
          <option value="medio">médio</option>
          <option value="grande">grande</option>
          <option value="destaque">destaque</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Alinhamento</label>
        <select className={selectCls} value={value.alinhamento ?? 'padrao'} onChange={(e) => set({ alinhamento: e.target.value as PresentationOverrides['alinhamento'] })}>
          <option value="padrao">padrão</option>
          <option value="esquerda">esquerda</option>
          <option value="centro">centro</option>
          <option value="direita">direita</option>
        </select>
      </div>
      {showVertical && (
        <div>
          <label className={labelCls}>Vertical</label>
          <select className={selectCls} value={value.posicao_vertical ?? 'padrao'} onChange={(e) => set({ posicao_vertical: e.target.value as PresentationOverrides['posicao_vertical'] })}>
            <option value="padrao">padrão</option>
            <option value="topo">topo</option>
            <option value="centro">centro</option>
            <option value="base">base</option>
          </select>
        </div>
      )}
      <div>
        <label className={labelCls}>Caixa</label>
        <select className={selectCls} value={value.caixa ?? 'padrao'} onChange={(e) => set({ caixa: e.target.value as PresentationOverrides['caixa'] })}>
          <option value="padrao">padrão</option>
          <option value="maiusculo">MAIÚSCULO</option>
          <option value="minusculo">minúsculo</option>
          <option value="capitalizar">Capitalizar</option>
        </select>
      </div>
    </div>
  );
};

export default PresentationControls;
