export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://xigituxddrtsqhmrmsvy.supabase.co";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

export const MP_PUBLIC_KEY = "APP_USR-c99fa810-a397-4f5d-91e2-8518dc601b2d";

// Defaults usados como fallback enquanto o valor real é carregado da tabela `settings`.
// O admin pode editar os valores reais; estes ficam como rede de segurança.
export const DEFAULT_SHIPPING_FLAT_RATE = 15;
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 299;
