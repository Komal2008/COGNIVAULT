import React, { useEffect, useState } from "react";
import {
  X,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Lock,
  BookOpen,
  KeyRound,
  FileCheck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { CognivaultLogo } from "../common/CognivaultLogo";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface MyVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSecurityArchitecture: () => void;
}

export const MyVaultModal: React.FC<MyVaultModalProps> = ({
  isOpen,
  onClose,
  onOpenSecurityArchitecture,
}) => {
  const { user, signOut } = useAuth();
  const [journalCount, setJournalCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;

    let isMounted = true;
    async function loadStats() {
      try {
        const convsRef = collection(db, "users", user.uid, "conversations");
        const snap = await getDocs(convsRef);
        if (isMounted) {
          setJournalCount(snap.size);
        }
      } catch (err) {
        console.warn("Could not fetch journal count:", err);
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FFFCF7] border border-[#E8D6C3] rounded-3xl shadow-2xl p-7 text-[#3B2922] space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-[#6B4938] hover:text-[#3B2922] hover:bg-[#E8D6C3]/40 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header with Cognivault Logo */}
        <div className="flex items-center gap-3 border-b border-[#E8D6C3] pb-4">
          <CognivaultLogo size="md" />
          <div>
            <h2 className="text-base font-serif font-bold text-[#3B2922]">
              My Vault
            </h2>
            <p className="text-xs text-[#6B4938]">Private Account & Reflection Sanctuary</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full border-2 border-[#E8D6C3] object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#6B4938] text-[#FFFCF7] border border-[#E8D6C3] flex items-center justify-center text-base font-serif font-bold">
              {user.displayName ? user.displayName[0].toUpperCase() : <UserIcon size={20} />}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-serif font-bold text-[#3B2922] truncate">
              {user.displayName || "Anonymous Thinker"}
            </h3>
            <p className="text-xs text-[#6B4938] truncate">{user.email || "Private Session"}</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#A8B29A] font-semibold mt-0.5">
              <CheckCircle2 size={12} />
              Authenticated & Isolated
            </span>
          </div>
        </div>

        {/* Account & Journal Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] space-y-1">
            <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#6B4938] block">
              Journal Count
            </span>
            <div className="text-xl font-serif font-bold text-[#3B2922] flex items-center gap-1.5">
              <BookOpen size={16} className="text-[#6B4938]" />
              <span>{journalCount !== null ? journalCount : "..."}</span>
            </div>
            <p className="text-[10px] text-[#6B4938]/70">Stored in your vault</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] space-y-1">
            <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#6B4938] block">
              Access Control
            </span>
            <div className="text-sm font-serif font-bold text-[#3B2922] flex items-center gap-1.5 pt-0.5">
              <Lock size={15} className="text-[#A8B29A]" />
              <span>Strict ABAC</span>
            </div>
            <p className="text-[10px] text-[#6B4938]/70">request.auth.uid only</p>
          </div>
        </div>

        {/* Privacy Information */}
        <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] space-y-2">
          <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#3B2922] flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#A8B29A]" />
            Privacy & Trust Architecture
          </span>
          <ul className="text-xs text-[#6B4938] space-y-1.5 leading-relaxed font-normal">
            <li className="flex items-start gap-1.5">
              <span className="text-[#E8B84A] font-bold">•</span>
              <span>Your reflections are stored under user-isolated paths: <code className="text-[10px] font-mono bg-[#E8D6C3]/40 px-1 rounded">/users/{user.uid}</code></span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#E8B84A] font-bold">•</span>
              <span>Gemini credentials live strictly in Google Cloud Secret Manager. No keys are ever shipped to the browser.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#E8B84A] font-bold">•</span>
              <span>Raw audio is processed client-side via speech recognition and is never stored or uploaded.</span>
            </li>
          </ul>

          <button
            onClick={() => {
              onClose();
              onOpenSecurityArchitecture();
            }}
            className="text-xs text-[#6B4938] hover:text-[#3B2922] font-semibold underline cursor-pointer pt-1 inline-block"
          >
            Review full zero-trust technical audit →
          </button>
        </div>

        {/* Sign Out Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              onClose();
              signOut();
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out of My Vault</span>
          </button>
        </div>
      </div>
    </div>
  );
};
