import type { Json } from '@/integrations/supabase/types';

export type ContentType = 'text' | 'rich_text' | 'image' | 'video' | 'product_ref' | 'collection_ref' | 'url';

export type FontOverride = 'padrao' | 'wagon' | 'sackers' | 'cormorant';
export type SizeOverride = 'padrao' | 'pequeno' | 'medio' | 'grande' | 'destaque';
export type AlignOverride = 'padrao' | 'esquerda' | 'centro' | 'direita';
export type VerticalOverride = 'padrao' | 'topo' | 'centro' | 'base';
export type CaseOverride = 'padrao' | 'maiusculo' | 'minusculo' | 'capitalizar';

export interface PresentationOverrides {
  fonte?: FontOverride;
  tamanho?: SizeOverride;
  alinhamento?: AlignOverride;
  posicao_vertical?: VerticalOverride;
  caixa?: CaseOverride;
}

export interface SiteContentBlock {
  id: string;
  page_key: string;
  section_key: string;
  block_key: string;
  content_type: ContentType;
  value_text: string | null;
  value_image_url: string | null;
  value_video_url: string | null;
  value_ref_id: string | null;
  value_url: string | null;
  presentation_overrides: PresentationOverrides;
  is_visible: boolean;
  updated_at: string;
}

export interface SiteContentListItem {
  id: string;
  page_key: string;
  section_key: string;
  list_key: string;
  item_index: number;
  fields: Record<string, Json>;
  presentation_overrides: PresentationOverrides;
  is_visible: boolean;
  updated_at: string;
}

export type SectionContent = Record<string, SiteContentBlock>;
