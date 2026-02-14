import { createClient } from "@supabase/supabase-js";
import { appEnv } from "../../config/env";

export const supabase = createClient(appEnv.supabaseUrl, appEnv.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    storageKey: "fw-community-auth",
  },
  db: {
    schema: "public",
  },
});
