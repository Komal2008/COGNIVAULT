import React from "react";
import {
  X,
  ShieldCheck,
  Lock,
  Server,
  KeyRound,
  FileCheck2,
  Database,
  CheckCircle2,
  Sun,
  Coffee,
} from "lucide-react";
import { CognivaultLogo } from "../common/CognivaultLogo";

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#FFFCF7] border border-[#E8D6C3] rounded-3xl shadow-2xl p-7 sm:p-8 text-[#3B2922]">
        <button
          id="close-security-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#6B4938] hover:text-[#3B2922] hover:bg-[#E8D6C3]/40 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="p-2.5 rounded-2xl bg-[#E8D6C3]/50 border border-[#E8D6C3] text-[#3B2922]">
            <ShieldCheck size={22} className="text-[#3B2922]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3B2922]">
              Cognivault Security Architecture
            </h2>
            <p className="text-[10px] text-[#6B4938] uppercase tracking-wider font-semibold">
              Enterprise-Grade Zero-Trust Privacy Blueprint
            </p>
          </div>
        </div>

        <p className="text-sm text-[#6B4938] leading-relaxed mb-6 font-normal">
          Cognivault is engineered with security as a first-class requirement. We believe personal
          reflection demands uncompromising cryptographic safeguards and mathematical tenant isolation.
        </p>

        {/* Security Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Pillar 1: Firestore Rules & ABAC */}
          <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] space-y-2">
            <div className="flex items-center gap-2 text-[#3B2922] font-serif font-bold text-xs">
              <Database size={15} className="text-[#6B4938]" />
              <span>User-Isolated Firestore ABAC</span>
            </div>
            <p className="text-xs text-[#6B4938] leading-relaxed">
              All records reside strictly under <code className="text-[#3B2922] bg-[#E8D6C3]/50 px-1 py-0.5 rounded text-[11px] font-mono">/users/&#123;uid&#125;</code>.
              Firestore security rules enforce <code className="text-[#3B2922] bg-[#E8D6C3]/50 px-1 py-0.5 rounded text-[11px] font-mono">request.auth.uid == uid</code>.
              Cross-user queries and IDOR attacks are rejected at the database engine level.
            </p>
          </div>

          {/* Pillar 2: Server-Side Gemini API */}
          <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] space-y-2">
            <div className="flex items-center gap-2 text-[#3B2922] font-serif font-bold text-xs">
              <Server size={15} className="text-[#6B4938]" />
              <span>Server-Side Gemini Gateway</span>
            </div>
            <p className="text-xs text-[#6B4938] leading-relaxed">
              No Gemini API keys are ever shipped to the browser or embedded in client bundles.
              All reflection requests run via containerized Express endpoints with volumetric payload limits.
            </p>
          </div>

          {/* Pillar 3: Secret Manager */}
          <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] space-y-2">
            <div className="flex items-center gap-2 text-[#3B2922] font-serif font-bold text-xs">
              <KeyRound size={15} className="text-[#6B4938]" />
              <span>Secret Manager Guardrails</span>
            </div>
            <p className="text-xs text-[#6B4938] leading-relaxed">
              API keys and service credentials are provisioned through Google Cloud Secret Manager.
              Zero credentials in Git, zero plain-text secrets in client-side storage, and zero secrets in logs.
            </p>
          </div>

          {/* Pillar 4: Prompt Injection Defense */}
          <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] space-y-2">
            <div className="flex items-center gap-2 text-[#3B2922] font-serif font-bold text-xs">
              <Lock size={15} className="text-[#6B4938]" />
              <span>Prompt Injection Isolation</span>
            </div>
            <p className="text-xs text-[#6B4938] leading-relaxed">
              User journal content is treated strictly as untrusted subjective text. Reflection prompts
              are bound with clear system boundaries that prevent instruction hijacking.
            </p>
          </div>
        </div>

        {/* Security Checklist */}
        <div className="p-5 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] space-y-3 mb-6">
          <h3 className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#3B2922] flex items-center gap-2">
            <FileCheck2 size={15} className="text-[#A8B29A]" />
            Verified Security Controls
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#6B4938]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#A8B29A] shrink-0" />
              <span>No client-side API key leakage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#A8B29A] shrink-0" />
              <span>Volumetric request limiting (&lt;500KB)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#A8B29A] shrink-0" />
              <span>Immutable timestamp enforcement</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#A8B29A] shrink-0" />
              <span>Sanitized error handling (no stack dumps)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#A8B29A] shrink-0" />
              <span>Client-side Web Speech (no audio storage)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#A8B29A] shrink-0" />
              <span>Default-deny Firestore catch-all rule</span>
            </div>
          </div>
        </div>

        {/* Non-Medical Disclaimer */}
        <div className="p-4 rounded-2xl bg-[#E8D6C3]/30 border border-[#E8D6C3] text-[11px] text-[#6B4938] leading-relaxed font-normal">
          <span className="font-serif font-bold text-[#3B2922] block mb-1">Non-Medical Disclaimer:</span>
          Cognivault is a reflective journaling and personal ideation platform. The AI reflection partner
          and mood atmospheres are designed for personal growth, philosophical inquiry, and creative thinking.
          They do not constitute clinical mental health assessments or medical diagnostic tools.
        </div>
      </div>
    </div>
  );
};
