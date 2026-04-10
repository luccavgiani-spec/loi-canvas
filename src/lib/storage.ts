// Supabase Storage public URL builder
const SUPABASE_URL = "https://xigituxddrtsqhmrmsvy.supabase.co";
const BUCKET = "produtos";
const BANNER_BUCKET = "banner";
const LEMBRANCAS_BUCKET = "lembrancas";

// 1 year browser cache — these are static product assets that rarely change.
// Reduces Supabase cached egress by avoiding repeated CDN fetches.
const CACHE_CONTROL = 'max-age=31536000, public, immutable';

export function storageUrl(filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(filename)}?cache-control=${encodeURIComponent(CACHE_CONTROL)}`;
}

export function bannerUrl(filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BANNER_BUCKET}/${encodeURIComponent(filename)}?cache-control=${encodeURIComponent(CACHE_CONTROL)}`;
}

export function lembrancasUrl(filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${LEMBRANCAS_BUCKET}/${encodeURIComponent(filename)}?cache-control=${encodeURIComponent(CACHE_CONTROL)}`;
}

/** Return the first non-video image from a list, useful as poster for <video> */
export function videoPoster(images: string[]): string | undefined {
  return images.find(src => !src.match(/\.mp4$/i));
}
