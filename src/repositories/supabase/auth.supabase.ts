import type { AuthRepository } from "../interfaces/auth.repository";
import { supabase } from "../../shared/lib/supabase/supabaseClient";
import { throwIfError } from "./_shared";

class SupabaseAuthRepository implements AuthRepository {
  async signInWithPassword(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    throwIfError(error);
  }

  async signUpWithPassword(email: string, password: string, options?: { emailRedirectTo?: string }): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: options?.emailRedirectTo,
      },
    });

    throwIfError(error);
  }

  async signInWithGithub(redirectTo: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
      },
    });

    throwIfError(error);
  }

  async exchangeCodeForSession(callbackUrl: string): Promise<void> {
    const { error } = await supabase.auth.exchangeCodeForSession(callbackUrl);
    throwIfError(error);
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    throwIfError(error);
  }
}

export const authRepository: AuthRepository = new SupabaseAuthRepository();
