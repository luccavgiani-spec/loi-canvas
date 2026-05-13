/* Mapeia os 5 controles de apresentação em classes Tailwind.
   Quando o valor é 'padrao' (ou ausente), retorna string vazia —
   o CSS hardcoded do componente prevalece. */
import type {
  PresentationOverrides,
  FontOverride,
  SizeOverride,
  AlignOverride,
  VerticalOverride,
  CaseOverride,
} from './types';

const FONT_MAP: Record<Exclude<FontOverride, 'padrao'>, string> = {
  wagon: 'font-wagon',
  sackers: 'font-sackers',
  cormorant: 'font-cormorant',
};

const SIZE_MAP: Record<Exclude<SizeOverride, 'padrao'>, string> = {
  pequeno: 'text-sm',
  medio: 'text-base',
  grande: 'text-2xl',
  destaque: 'text-5xl',
};

const ALIGN_MAP: Record<Exclude<AlignOverride, 'padrao'>, string> = {
  esquerda: 'text-left',
  centro: 'text-center',
  direita: 'text-right',
};

const VERTICAL_MAP: Record<Exclude<VerticalOverride, 'padrao'>, string> = {
  topo: 'items-start',
  centro: 'items-center',
  base: 'items-end',
};

const CASE_MAP: Record<Exclude<CaseOverride, 'padrao'>, string> = {
  maiusculo: 'uppercase',
  minusculo: 'lowercase',
  capitalizar: 'capitalize',
};

export function overridesToClasses(o?: PresentationOverrides): string {
  if (!o) return '';
  const out: string[] = [];
  if (o.fonte && o.fonte !== 'padrao') out.push(FONT_MAP[o.fonte]);
  if (o.tamanho && o.tamanho !== 'padrao') out.push(SIZE_MAP[o.tamanho]);
  if (o.alinhamento && o.alinhamento !== 'padrao') out.push(ALIGN_MAP[o.alinhamento]);
  if (o.caixa && o.caixa !== 'padrao') out.push(CASE_MAP[o.caixa]);
  return out.filter(Boolean).join(' ');
}

export function verticalOverrideClass(o?: PresentationOverrides): string {
  if (!o || !o.posicao_vertical || o.posicao_vertical === 'padrao') return '';
  return VERTICAL_MAP[o.posicao_vertical];
}

export const PRESENTATION_DEFAULTS: PresentationOverrides = {
  fonte: 'padrao',
  tamanho: 'padrao',
  alinhamento: 'padrao',
  posicao_vertical: 'padrao',
  caixa: 'padrao',
};
