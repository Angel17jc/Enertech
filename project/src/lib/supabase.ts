import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseMissingConfig = !supabaseUrl || !supabaseAnonKey;

const missingConfigError = () =>
  new Error('Supabase config missing: define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env');

const stubQuery = () => {
  const error = missingConfigError();
  return {
    select: () => stubQuery(),
    insert: async () => ({ error }),
    update: async () => ({ error }),
    delete: async () => ({ error }),
    eq: () => stubQuery(),
    maybeSingle: async () => ({ data: null, error }),
    single: async () => ({ data: null, error }),
  };
};

const stubSupabase: any = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: missingConfigError() }),
    onAuthStateChange: () => ({
      data: {
        subscription: { unsubscribe: () => {} },
      },
    }),
    signInWithPassword: async () => ({ error: missingConfigError() }),
    signUp: async () => ({ data: { user: null }, error: missingConfigError() }),
    signOut: async () => ({ error: missingConfigError() }),
  },
  from: () => stubQuery(),
};

export const supabase = supabaseMissingConfig ? stubSupabase : createClient(supabaseUrl, supabaseAnonKey);
