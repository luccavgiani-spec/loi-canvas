// Supabase Storage public URL builder for the "produtos" bucket
const SUPABASE_URL = "https://xigituxddrtsqhmrmsvy.supabase.co";
const BUCKET = "produtos";

// 1 year browser cache — these are static product assets that rarely change.
// Reduces Supabase cached egress by avoiding repeated CDN fetches.
const CACHE_CONTROL = 'max-age=31536000, public, immutable';

export function storageUrl(filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(filename)}?cache-control=${encodeURIComponent(CACHE_CONTROL)}`;
}

/** Return the first non-video image from a list, useful as poster for <video> */
export function videoPoster(images: string[]): string | undefined {
  return images.find(src => !src.match(/\.mp4$/i));
}

// In-memory cache for product images (asset_folder → URL[])
const imageCache = new Map<string, string[]>();

/**
 * List product image/video URLs from Supabase Storage.
 * Files are listed from the `produtos` bucket under the given asset_folder prefix.
 * Results are cached in-memory to avoid repeated API calls.
 */
export async function getProductImages(assetFolder: string | null | undefined): Promise<string[]> {
  if (!assetFolder) return [];

  const cached = imageCache.get(assetFolder);
  if (cached) return cached;

  try {
    // Dynamic import to avoid circular dependency with supabase client
    const { supabase } = await import('@/integrations/supabase/client');

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list('', { search: assetFolder, limit: 50 });

    if (error || !data) {
      console.warn(`[getProductImages] Failed to list files for "${assetFolder}":`, error);
      return [];
    }

    const mediaExtensions = /\.(jpe?g|png|webp|mp4)$/i;
    const urls = data
      .filter(f => f.name.startsWith(assetFolder) && mediaExtensions.test(f.name))
      .sort((a, b) => {
        // Sort: _principal first, then _imagem*, then videos, then _ultima last
        const order = (name: string) => {
          if (name.includes('principal')) return 0;
          if (name.includes('imagem')) return 1;
          if (name.match(/\.mp4$/i)) return 3;
          if (name.includes('ultima')) return 4;
          return 2;
        };
        return order(a.name) - order(b.name);
      })
      .map(f => storageUrl(f.name));

    imageCache.set(assetFolder, urls);
    return urls;
  } catch (err) {
    console.warn(`[getProductImages] Error listing files for "${assetFolder}":`, err);
    return [];
  }
}
