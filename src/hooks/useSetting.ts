import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSetting<T>(key: string, defaultValue: T): T {
  const { data } = useQuery({
    queryKey: ['setting', key],
    queryFn: async () => {
      const { data, error } = await (supabase as unknown as {
        from: (t: string) => {
          select: (c: string) => {
            eq: (col: string, val: string) => {
              maybeSingle: () => Promise<{ data: { value: unknown } | null; error: unknown }>;
            };
          };
        };
      })
        .from('settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      if (error) throw error;
      return (data?.value ?? null) as T | null;
    },
  });
  return (data ?? defaultValue) as T;
}
