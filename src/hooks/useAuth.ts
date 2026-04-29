import { useEffect, useState } from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type AdminRole = 'owner' | 'editor';

export interface AuthState {
  user: User | null;
  isAdmin: boolean;
  role: AdminRole | null;
  loading: boolean;
}

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

async function loadAdminProfile(user: User) {
  // admin_users.user_id is the FK to auth.users.id; RLS limits the result
  // to the caller's own row. Empty result means the user is not an admin.
  // Cast: generated types still reflect the legacy schema (id/email only).
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
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) {
    setState({ user, isAdmin: false, role: null, loading: false });
    return;
  }
  setState({ user, isAdmin: true, role: data.role, loading: false });
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
  ): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  return { ...state, signIn, signOut };
}
