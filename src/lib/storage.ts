// Supabase Storage public URL builder for the "produtos" bucket
const SUPABASE_URL = "https://xigituxddrtsqhmrmsvy.supabase.co";
const BUCKET = "produtos";

export function storageUrl(filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(filename)}`;
}
