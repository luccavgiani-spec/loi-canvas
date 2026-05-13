import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type {
  SiteContentBlock,
  SiteContentListItem,
  SectionContent,
  PresentationOverrides,
  ContentType,
} from './types';

const SITE_CONTENT_COLUMNS =
  'id, page_key, section_key, block_key, content_type, value_text, value_image_url, value_video_url, value_ref_id, value_url, presentation_overrides, is_visible, updated_at';

const LIST_ITEM_COLUMNS =
  'id, page_key, section_key, list_key, item_index, fields, presentation_overrides, is_visible, updated_at';

function asPresentation(j: Json | null | undefined): PresentationOverrides {
  if (!j || typeof j !== 'object' || Array.isArray(j)) return {};
  return j as PresentationOverrides;
}

function mapBlock(row: Record<string, unknown>): SiteContentBlock {
  return {
    id: row.id as string,
    page_key: row.page_key as string,
    section_key: row.section_key as string,
    block_key: row.block_key as string,
    content_type: row.content_type as ContentType,
    value_text: (row.value_text as string | null) ?? null,
    value_image_url: (row.value_image_url as string | null) ?? null,
    value_video_url: (row.value_video_url as string | null) ?? null,
    value_ref_id: (row.value_ref_id as string | null) ?? null,
    value_url: (row.value_url as string | null) ?? null,
    presentation_overrides: asPresentation(row.presentation_overrides as Json),
    is_visible: Boolean(row.is_visible ?? true),
    updated_at: (row.updated_at as string) ?? '',
  };
}

function mapItem(row: Record<string, unknown>): SiteContentListItem {
  return {
    id: row.id as string,
    page_key: row.page_key as string,
    section_key: row.section_key as string,
    list_key: row.list_key as string,
    item_index: Number(row.item_index ?? 0),
    fields: (row.fields as Record<string, Json>) ?? {},
    presentation_overrides: asPresentation(row.presentation_overrides as Json),
    is_visible: Boolean(row.is_visible ?? true),
    updated_at: (row.updated_at as string) ?? '',
  };
}

/* ── Public reads ──────────────────────────────────────────────────────── */

export async function fetchSectionContent(pageKey: string, sectionKey: string): Promise<SectionContent> {
  const { data, error } = await supabase
    .from('site_content')
    .select(SITE_CONTENT_COLUMNS)
    .eq('page_key', pageKey)
    .eq('section_key', sectionKey);
  if (error) {
    console.warn('[fetchSectionContent] failed:', error.message);
    return {};
  }
  const out: SectionContent = {};
  (data ?? []).forEach((row) => {
    const block = mapBlock(row as Record<string, unknown>);
    out[block.block_key] = block;
  });
  return out;
}

export async function fetchListItems(
  pageKey: string,
  sectionKey: string,
  listKey: string,
): Promise<SiteContentListItem[]> {
  const { data, error } = await supabase
    .from('site_content_list_items')
    .select(LIST_ITEM_COLUMNS)
    .eq('page_key', pageKey)
    .eq('section_key', sectionKey)
    .eq('list_key', listKey)
    .order('item_index', { ascending: true });
  if (error) {
    console.warn('[fetchListItems] failed:', error.message);
    return [];
  }
  return (data ?? []).map((row) => mapItem(row as Record<string, unknown>));
}

/* ── Admin reads ───────────────────────────────────────────────────────── */

export async function fetchAllPageContent(pageKey: string): Promise<SiteContentBlock[]> {
  const { data, error } = await supabase
    .from('site_content')
    .select(SITE_CONTENT_COLUMNS)
    .eq('page_key', pageKey)
    .order('section_key', { ascending: true })
    .order('block_key', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapBlock(row as Record<string, unknown>));
}

export async function fetchAllPageListItems(pageKey: string): Promise<SiteContentListItem[]> {
  const { data, error } = await supabase
    .from('site_content_list_items')
    .select(LIST_ITEM_COLUMNS)
    .eq('page_key', pageKey)
    .order('section_key', { ascending: true })
    .order('list_key', { ascending: true })
    .order('item_index', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapItem(row as Record<string, unknown>));
}

/* ── Admin writes ──────────────────────────────────────────────────────── */

export interface UpdateBlockInput {
  id: string;
  value_text?: string | null;
  value_image_url?: string | null;
  value_video_url?: string | null;
  value_ref_id?: string | null;
  value_url?: string | null;
  presentation_overrides?: PresentationOverrides;
  is_visible?: boolean;
}

export async function updateBlock(input: UpdateBlockInput): Promise<void> {
  const { id, ...patch } = input;
  const { error } = await supabase.from('site_content').update(patch).eq('id', id);
  if (error) throw error;
}

export async function updateSectionVisibility(
  pageKey: string,
  sectionKey: string,
  isVisible: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('site_content')
    .update({ is_visible: isVisible })
    .eq('page_key', pageKey)
    .eq('section_key', sectionKey);
  if (error) throw error;
}

export interface InsertListItemInput {
  page_key: string;
  section_key: string;
  list_key: string;
  fields: Record<string, Json>;
}

export async function insertListItem(input: InsertListItemInput): Promise<SiteContentListItem> {
  // pega o próximo item_index
  const { data: existing } = await supabase
    .from('site_content_list_items')
    .select('item_index')
    .eq('page_key', input.page_key)
    .eq('section_key', input.section_key)
    .eq('list_key', input.list_key)
    .order('item_index', { ascending: false })
    .limit(1);
  const nextIndex = ((existing?.[0]?.item_index as number | undefined) ?? -1) + 1;
  const { data, error } = await supabase
    .from('site_content_list_items')
    .insert({ ...input, item_index: nextIndex } as never)
    .select(LIST_ITEM_COLUMNS)
    .single();
  if (error) throw error;
  return mapItem(data as Record<string, unknown>);
}

export interface UpdateListItemInput {
  id: string;
  fields?: Record<string, Json>;
  presentation_overrides?: PresentationOverrides;
  is_visible?: boolean;
  item_index?: number;
}

export async function updateListItem(input: UpdateListItemInput): Promise<void> {
  const { id, ...patch } = input;
  const { error } = await supabase.from('site_content_list_items').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteListItem(id: string): Promise<void> {
  const { error } = await supabase.from('site_content_list_items').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderListItems(ids: string[]): Promise<void> {
  /* Recebe os IDs na ordem desejada e grava item_index sequencial. */
  const updates = ids.map((id, i) =>
    supabase.from('site_content_list_items').update({ item_index: i }).eq('id', id),
  );
  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error)?.error;
  if (firstError) throw firstError;
}

/* ── Storage helpers ──────────────────────────────────────────────────── */

const SUPABASE_URL = 'https://xigituxddrtsqhmrmsvy.supabase.co';

export function publicStorageUrl(bucket: string, filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURIComponent(filename)}`;
}

export async function uploadAsset(bucket: string, file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;
  return publicStorageUrl(bucket, filename);
}
