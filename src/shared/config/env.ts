interface AppEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

type SupportedEnvKey = "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY" | "VITE_SUPABASE_PUBLISHABLE_KEY";

function readEnv(name: SupportedEnvKey): string | null {
  const value = import.meta.env[name];

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getRequiredEnv(name: SupportedEnvKey): string {
  const value = readEnv(name);

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getSupabasePublicKey(): string {
  const key = readEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ?? readEnv("VITE_SUPABASE_ANON_KEY");

  if (!key) {
    throw new Error("Missing environment variable: VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY");
  }

  if (key === "your-public-anon-key" || key === "your-public-publishable-key") {
    throw new Error("Supabase API key is still set to placeholder value");
  }

  return key;
}

export const appEnv: AppEnv = {
  supabaseUrl: (() => {
    const url = getRequiredEnv("VITE_SUPABASE_URL");
    if (url === "https://your-project-ref.supabase.co") {
      throw new Error("Supabase URL is still set to placeholder value");
    }

    return url;
  })(),
  supabaseAnonKey: getSupabasePublicKey(),
};
