// Supabase Storage public URL builder for the "produtos" bucket
const SUPABASE_URL = "https://xigituxddrtsqhmrmsvy.supabase.co";
const BUCKET = "produtos";

// 1 year browser cache — these are static product assets that rarely change.
// Reduces Supabase cached egress by avoiding repeated CDN fetches.
const CACHE_CONTROL = 'max-age=31536000, public, immutable';

export function storageUrl(filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(filename)}?cache-control=${encodeURIComponent(CACHE_CONTROL)}`;
}
