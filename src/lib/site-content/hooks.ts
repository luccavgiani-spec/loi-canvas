import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  fetchSectionContent,
  fetchListItems,
  fetchAllPageContent,
  fetchAllPageListItems,
  updateBlock,
  updateListItem,
  insertListItem,
  deleteListItem,
  reorderListItems,
  updateSectionVisibility,
  type UpdateBlockInput,
  type UpdateListItemInput,
  type InsertListItemInput,
} from './api';
import type { SectionContent, SiteContentListItem, SiteContentBlock } from './types';

export const SITE_CONTENT_STALE_TIME = 1000 * 60 * 5;

export function siteContentSectionKey(pageKey: string, sectionKey: string) {
  return ['site_content', pageKey, sectionKey] as const;
}

export function siteContentListKey(pageKey: string, sectionKey: string, listKey: string) {
  return ['site_content_list', pageKey, sectionKey, listKey] as const;
}

export function siteContentPageKey(pageKey: string) {
  return ['site_content_page', pageKey] as const;
}

export function siteContentPageListsKey(pageKey: string) {
  return ['site_content_page_lists', pageKey] as const;
}

export function useSiteContent(pageKey: string, sectionKey: string) {
  return useQuery({
    queryKey: siteContentSectionKey(pageKey, sectionKey),
    queryFn: () => fetchSectionContent(pageKey, sectionKey),
    staleTime: SITE_CONTENT_STALE_TIME,
  });
}

export function useSiteContentList(pageKey: string, sectionKey: string, listKey: string) {
  return useQuery({
    queryKey: siteContentListKey(pageKey, sectionKey, listKey),
    queryFn: () => fetchListItems(pageKey, sectionKey, listKey),
    staleTime: SITE_CONTENT_STALE_TIME,
  });
}

export function useSiteContentPage(pageKey: string) {
  return useQuery<SiteContentBlock[]>({
    queryKey: siteContentPageKey(pageKey),
    queryFn: () => fetchAllPageContent(pageKey),
    staleTime: SITE_CONTENT_STALE_TIME,
  });
}

export function useSiteContentPageLists(pageKey: string) {
  return useQuery<SiteContentListItem[]>({
    queryKey: siteContentPageListsKey(pageKey),
    queryFn: () => fetchAllPageListItems(pageKey),
    staleTime: SITE_CONTENT_STALE_TIME,
  });
}

function invalidatePage(qc: ReturnType<typeof useQueryClient>, pageKey: string) {
  qc.invalidateQueries({ queryKey: ['site_content', pageKey] });
  qc.invalidateQueries({ queryKey: ['site_content_list', pageKey] });
  qc.invalidateQueries({ queryKey: siteContentPageKey(pageKey) });
  qc.invalidateQueries({ queryKey: siteContentPageListsKey(pageKey) });
}

export function useUpdateBlock(pageKey: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBlockInput) => updateBlock(input),
    onSuccess: () => invalidatePage(qc, pageKey),
  });
}

export function useUpdateListItem(pageKey: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateListItemInput) => updateListItem(input),
    onSuccess: () => invalidatePage(qc, pageKey),
  });
}

export function useInsertListItem(pageKey: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InsertListItemInput) => insertListItem(input),
    onSuccess: () => invalidatePage(qc, pageKey),
  });
}

export function useDeleteListItem(pageKey: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteListItem(id),
    onSuccess: () => invalidatePage(qc, pageKey),
  });
}

export function useReorderListItems(pageKey: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reorderListItems(ids),
    onSuccess: () => invalidatePage(qc, pageKey),
  });
}

export function useUpdateSectionVisibility(pageKey: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionKey, isVisible }: { sectionKey: string; isVisible: boolean }) =>
      updateSectionVisibility(pageKey, sectionKey, isVisible),
    onSuccess: () => invalidatePage(qc, pageKey),
  });
}

/** Helper: lê um bloco de uma seção carregada com useSiteContent.
 * Retorna o texto/url/etc. com fallback explícito. */
export function readBlockText(section: SectionContent | undefined, blockKey: string, fallback: string): string {
  const block = section?.[blockKey];
  if (!block || !block.is_visible) return fallback;
  return block.value_text ?? fallback;
}

export function readBlockImage(section: SectionContent | undefined, blockKey: string, fallback: string): string {
  const block = section?.[blockKey];
  if (!block) return fallback;
  return block.value_image_url ?? fallback;
}

export function readBlockUrl(section: SectionContent | undefined, blockKey: string, fallback: string): string {
  const block = section?.[blockKey];
  if (!block) return fallback;
  return block.value_url ?? fallback;
}
