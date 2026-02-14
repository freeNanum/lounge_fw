interface AppEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

function getRequiredEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY"): string {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const appEnv: AppEnv = {
  supabaseUrl: getRequiredEnv("VITE_SUPABASE_URL"),
  supabaseAnonKey: getRequiredEnv("VITE_SUPABASE_ANON_KEY"),
};
