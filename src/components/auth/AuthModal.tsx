import React, { useState } from "react";
import { X, ShieldCheck, Mail, Lock, Sparkles, AlertCircle, Sun } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { CognivaultLogo } from "../common/CognivaultLogo";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, signInWithEmail, signUpWithEmail } =
    useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleAuth = async () => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to sign in with Google. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#FFFCF7] border border-[#E8D6C3] rounded-3xl shadow-2xl p-7 text-[#3B2922]">
        {/* Close Button */}
        <button
          id="close-auth-modal-btn"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-[#6B4938] hover:text-[#3B2922] hover:bg-[#E8D6C3]/40 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header with Cognivault Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <CognivaultLogo size="lg" showWordmark={false} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3B2922] tracking-tight">
            {isSignUp ? "Create Your Private Vault" : "Unlock Cognivault"}
          </h2>
          <p className="text-xs text-[#6B4938] mt-1 max-w-xs mx-auto font-normal leading-relaxed">
            Your personal reflection sanctuary. Secure, isolated, and encrypted to your identity.
          </p>
        </div>

        {/* Security Badge */}
        <div className="mb-5 p-3 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] flex items-start gap-2.5 text-xs text-[#6B4938]">
          <ShieldCheck size={16} className="text-[#A8B29A] shrink-0 mt-0.5" />
          <span className="leading-normal font-medium">
            Strict User Isolation: All reflections are locked under private Firestore security rules.
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#E8D6C3]/50 border border-[#6B4938]/30 text-[#6B4938] text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span className="line-clamp-2">{errorMsg}</span>
          </div>
        )}

        {/* Google One-Click Button */}
        <button
          id="google-signin-btn"
          type="button"
          onClick={handleGoogleAuth}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl bg-[#FFF8EE] hover:bg-[#E8D6C3]/50 border border-[#E8D6C3] text-[#3B2922] font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-[#E8D6C3]"></div>
          <span className="px-3 text-[10px] uppercase font-serif tracking-wider text-[#6B4938]">or email</span>
          <div className="flex-1 border-t border-[#E8D6C3]"></div>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#6B4938] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-3 text-[#6B4938]/60" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] text-[#3B2922] placeholder-[#6B4938]/50 text-xs focus:outline-none focus:border-[#6B4938] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#6B4938] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-3 text-[#6B4938]/60" />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] text-[#3B2922] placeholder-[#6B4938]/50 text-xs focus:outline-none focus:border-[#6B4938] transition-colors"
              />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFFCF7] font-semibold text-xs transition-all shadow-xs mt-1 cursor-pointer disabled:opacity-50 border border-[#E8B84A]/30"
          >
            {isSubmitting ? "Securing Session..." : isSignUp ? "Create Vault Account" : "Sign In to Vault"}
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="mt-4 text-center">
          <button
            id="toggle-auth-mode-btn"
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-[#6B4938] hover:text-[#3B2922] transition-colors cursor-pointer"
          >
            {isSignUp ? "Already have a vault? Sign in" : "Need a vault account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};
