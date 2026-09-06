import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Server,
  Database,
  KeyRound,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut,
  Lock,
  FileCode,
  AlertTriangle,
  Sun,
  Coffee,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { testConnection } from "../../lib/firebase";

export const SettingsSecurityView: React.FC = () => {
  const { user, signOut, openAuthModal } = useAuth();
  const [firestoreStatus, setFirestoreStatus] = useState<"checking" | "connected" | "error">(
    "checking"
  );
  const [serverHealth, setServerHealth] = useState<{
    status: string;
    geminiConfigured: boolean;
    timestamp: string;
  } | null>(null);
  const [isCheckingServer, setIsCheckingServer] = useState(false);

  const checkConnectivity = async () => {
    setFirestoreStatus("checking");
    setIsCheckingServer(true);

    // Test Firestore client-to-server reachability
    try {
      const isOk = await testConnection();
      setFirestoreStatus(isOk ? "connected" : "error");
    } catch {
      setFirestoreStatus("error");
    }

    // Test Server-side health & Gemini key status
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setServerHealth(data);
      } else {
        setServerHealth(null);
      }
    } catch (err) {
      console.error("Health check error:", err);
      setServerHealth(null);
    } finally {
      setIsCheckingServer(false);
    }
  };

  useEffect(() => {
    checkConnectivity();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D6C3]/40 border border-[#6B4938]/15 text-[#6B4938] text-xs font-semibold mb-2">
            <ShieldCheck size={13} className="text-[#A8B29A]" />
            <span>ZERO-TRUST VERIFICATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3B2922] tracking-tight">
            Settings & Security
          </h1>
          <p className="text-xs sm:text-sm text-[#6B4938] mt-1 font-normal leading-relaxed">
            Real-time diagnostics, cryptographic boundaries, and account isolation for Cognivault.
          </p>
        </div>

        <button
          onClick={checkConnectivity}
          disabled={isCheckingServer}
          className="px-5 py-2.5 rounded-xl bg-[#FFF8EE] hover:bg-[#E8D6C3]/50 border border-[#E8D6C3] text-xs font-semibold text-[#3B2922] flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-center shadow-2xs"
        >
          <RefreshCw size={14} className={`text-[#6B4938] ${isCheckingServer ? "animate-spin" : ""}`} />
          <span>Run System Diagnostics</span>
        </button>
      </div>

      {/* Connectivity & Service Status Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Firestore Database Check */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#3B2922] font-serif font-bold text-sm">
              <Database size={16} className="text-[#6B4938]" />
              <span>Cloud Firestore Database</span>
            </div>
            {firestoreStatus === "connected" ? (
              <span className="flex items-center gap-1.5 text-xs text-[#3B2922] font-semibold bg-[#A8B29A]/20 px-2.5 py-1 rounded-full border border-[#A8B29A]/40">
                <CheckCircle2 size={13} className="text-[#3B2922]" />
                Live & Isolated
              </span>
            ) : firestoreStatus === "checking" ? (
              <span className="text-xs text-[#6B4938] font-mono">Verifying...</span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                <XCircle size={13} />
                Offline
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B4938] leading-relaxed font-normal">
            Direct authenticated SDK connection with deployed security rules enforcing{" "}
            <code className="text-[#3B2922] bg-[#E8D6C3]/50 px-1.5 py-0.5 rounded text-[11px] font-mono">request.auth.uid == uid</code>.
          </p>
          <div className="pt-2 text-[10px] uppercase tracking-wider font-serif font-bold text-[#6B4938]">
            Database: ai-studio-cognivault
          </div>
        </div>

        {/* Server-Side Gemini Gateway Check */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#3B2922] font-serif font-bold text-sm">
              <Server size={16} className="text-[#6B4938]" />
              <span>Server-Side Gemini Gateway</span>
            </div>
            {serverHealth?.geminiConfigured ? (
              <span className="flex items-center gap-1.5 text-xs text-[#3B2922] font-semibold bg-[#E8B84A]/20 px-2.5 py-1 rounded-full border border-[#E8B84A]/40">
                <CheckCircle2 size={13} className="text-[#6B4938]" />
                Secure Key Loaded
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <AlertTriangle size={13} />
                Awaiting Secret
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B4938] leading-relaxed font-normal">
            Express API proxy running on Node.js port 3000. API keys are strictly server-side
            secrets managed outside the client bundle.
          </p>
          <div className="pt-2 text-[10px] uppercase tracking-wider font-serif font-bold text-[#6B4938]">
            Models: gemini-2.5-flash-lite primary, gemini-2.5-flash fallback (via @google/genai)
          </div>
        </div>
      </div>

      {/* Authenticated Account Overview */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-5 shadow-sm">
        <h2 className="text-sm font-serif font-bold text-[#3B2922] flex items-center gap-2">
          <Lock size={16} className="text-[#6B4938]" />
          <span>Vault Access & Identity</span>
        </h2>

        {user ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3]">
                <span className="text-[#6B4938] font-serif font-bold block text-[10px] uppercase tracking-wider">
                  AUTHENTICATED UID
                </span>
                <span className="text-[#3B2922] font-mono font-semibold break-all text-xs mt-1 block">
                  {user.uid}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3]">
                <span className="text-[#6B4938] font-serif font-bold block text-[10px] uppercase tracking-wider">
                  ASSOCIATED EMAIL
                </span>
                <span className="text-[#3B2922] font-medium text-xs mt-1 block">
                  {user.email || "No email provided"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[#6B4938]">
                Current session is cryptographically bound to your private Firestore namespace.
              </span>

              <button
                onClick={signOut}
                className="px-4 py-2 rounded-xl bg-[#FFF8EE] hover:bg-rose-50 hover:text-rose-700 text-[#6B4938] text-xs font-semibold flex items-center gap-2 border border-[#E8D6C3] transition-colors cursor-pointer self-start sm:self-auto"
              >
                <LogOut size={14} />
                <span>Lock & Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] text-center space-y-3">
            <p className="text-xs text-[#6B4938]">
              You are currently viewing Cognivault in guest mode. Reflections are transient until authenticated.
            </p>
            <button
              onClick={openAuthModal}
              className="px-6 py-2.5 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFFCF7] text-xs font-semibold shadow-xs cursor-pointer border border-[#E8B84A]/30"
            >
              Sign In to Provision Private Cloud Vault
            </button>
          </div>
        )}
      </div>

      {/* Firestore Rules Blueprint Display */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-serif font-bold text-[#3B2922] flex items-center gap-2">
            <FileCode size={16} className="text-[#6B4938]" />
            <span>Deployed Firestore Security Rules</span>
          </h2>
          <span className="text-[10px] font-mono text-[#3B2922] bg-[#A8B29A]/20 px-2.5 py-0.5 rounded-md border border-[#A8B29A]/40 font-semibold">
            rules_version = '2'
          </span>
        </div>

        <pre className="p-5 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] text-[#3B2922] text-[11px] font-mono overflow-x-auto leading-relaxed max-h-56">
{`// Master Gate Pattern & User Isolation
match /users/{uid} {
  allow get, list: if isOwner(uid) && isValidId(uid);
  allow create, update: if isOwner(uid) && isValidId(uid) && isValidUser(incoming(), uid);
  allow delete: if isOwner(uid) && isValidId(uid);

  match /conversations/{conversationId} {
    allow get, list: if isOwner(uid) && isValidId(uid);
    allow create: if isOwner(uid) && isValidId(uid) && isValidId(conversationId) &&
                    isValidConversation(incoming(), conversationId);
    ...
  }
}`}
        </pre>
      </div>
    </div>
  );
};
