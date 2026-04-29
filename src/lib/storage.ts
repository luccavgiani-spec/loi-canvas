// Supabase Storage public URL builder
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = "https://xigituxddrtsqhmrmsvy.supabase.co";
const BUCKET = "produtos";
const BANNER_BUCKET = "banner";
const LEMBRANCAS_BUCKET = "lembrancas";
const ABOUT_BUCKET = "about";

// 1 year browser cache — these are static product assets that rarely change.
// Reduces Supabase cached egress by avoiding repeated CDN fetches.
const CACHE_CONTROL = 'max-age=31536000, public, immutable';

export function storageUrl(filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(filename)}?cache-control=${encodeURIComponent(CACHE_CONTROL)}`;
}

export function bannerUrl(filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BANNER_BUCKET}/${encodeURIComponent(filename)}`;
}

export function lembrancasUrl(filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${LEMBRANCAS_BUCKET}/${encodeURIComponent(filename)}?cache-control=${encodeURIComponent(CACHE_CONTROL)}`;
}

export function aboutUrl(filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${ABOUT_BUCKET}/${encodeURIComponent(filename)}?cache-control=${encodeURIComponent(CACHE_CONTROL)}`;
}

const COLLABS_BUCKET = "collabs";

export function collabsUrl(filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${COLLABS_BUCKET}/${encodeURIComponent(filename)}?cache-control=${encodeURIComponent(CACHE_CONTROL)}`;
}

export async function uploadCollabMedia(file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(COLLABS_BUCKET)
    .upload(filename, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;
  return collabsUrl(filename);
}

/** Return the first non-video image from a list, useful as poster for <video> */
export function videoPoster(images: string[]): string | undefined {
  return images.find(src => !src.match(/\.mp4$/i));
}
