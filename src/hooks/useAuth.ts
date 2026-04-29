import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type AdminRole = 'owner' | 'editor';

export interface AuthState {
  user: User | null;
  isAdmin: boolean;
  role: AdminRole | null;
  loading: boolean;
}

export type SignInResult =
  | { ok: true }
  | { ok: false; reason: 'credentials' | 'forbidden' };

const initialState: AuthState = {
  user: null,
  isAdmin: false,
  role: null,
  loading: true,
};

let currentState: AuthState = initialState;
const listeners = new Set<(state: AuthState) => void>();

function setState(next: AuthState) {
  currentState = next;
  listeners.forEach((fn) => fn(next));
}

// admin_users.user_id is the FK to auth.users.id; the RLS policy limits the
// result to the caller's own row, so an empty/null result means the user is
// not an admin. Cast: generated types still reflect the legacy schema
// (id/email only) until `supabase gen types` is rerun.
async function fetchAdminRole(userId: string): Promise<AdminRole | null> {
  const { data, error } = await (supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{
            data: { role: AdminRole } | null;
            error: unknown;
          }>;
        };
      };
    };
  })
    .from('admin_users')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return data.role;
}

async function loadAdminProfile(user: User) {
  const role = await fetchAdminRole(user.id);
  setState({ user, isAdmin: role !== null, role, loading: false });
}

function applySession(session: Session | null) {
  if (session?.user) {
    void loadAdminProfile(session.user);
  } else {
    setState({ user: null, isAdmin: false, role: null, loading: false });
  }
}

let initialized = false;
function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  void supabase.auth.getSession().then(({ data }) => applySession(data.session));
  supabase.auth.onAuthStateChange((_event, session) => applySession(session));
}

export function useAuth() {
  ensureInitialized();
  const [state, setLocal] = useState<AuthState>(currentState);

  useEffect(() => {
    listeners.add(setLocal);
    setLocal(currentState);
    return () => {
      listeners.delete(setLocal);
    };
  }, []);

  const signIn = async (
    email: string,
    password: string,
  ): Promise<SignInResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) return { ok: false, reason: 'credentials' };

    // Block sign-in for users that exist in auth.users but are not admins.
    // Tearing the session down here keeps non-admins from ever holding a
    // live session, which is safer than relying on the route guard alone.
    const role = await fetchAdminRole(data.user.id);
    if (role === null) {
      await supabase.auth.signOut();
      return { ok: false, reason: 'forbidden' };
    }

    return { ok: true };
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  return { ...state, signIn, signOut };
}
