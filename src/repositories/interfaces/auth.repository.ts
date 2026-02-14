export interface SignUpResult {
  sessionCreated: boolean;
  alreadyRegistered: boolean;
}

export interface AuthRepository {
  signInWithPassword(email: string, password: string): Promise<void>;
  signUpWithPassword(email: string, password: string, options?: { emailRedirectTo?: string }): Promise<SignUpResult>;
  resendSignupConfirmation(email: string, options?: { emailRedirectTo?: string }): Promise<void>;
  signInWithGithub(redirectTo: string): Promise<void>;
  exchangeCodeForSession(callbackUrl: string): Promise<void>;
  signOut(): Promise<void>;
}
