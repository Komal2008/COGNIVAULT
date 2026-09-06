import React from "react";
import {
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  Headphones,
  ArrowRight,
  Lock,
  EyeOff,
  Server,
  Sun,
  Coffee,
  Heart,
  Feather,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { CognivaultLogo } from "../common/CognivaultLogo";

interface LandingViewProps {
  onExploreSandbox: () => void;
  onOpenSecurityModal: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onExploreSandbox,
  onOpenSecurityModal,
}) => {
  const { openAuthModal } = useAuth();

  return (
    <div className="space-y-16 pb-20">
      {/* Warm Cocoa Sunrise Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto pt-6 sm:pt-14 space-y-6">
        {/* Soft Organic Aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#E8B84A]/15 rounded-full blur-3xl pointer-events-none -z-10 animate-sun-glow" />

        {/* Brand Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8D6C3]/40 border border-[#6B4938]/15 text-[#6B4938] text-xs font-sans tracking-wide shadow-xs backdrop-blur-sm">
          <Sun size={14} className="text-[#E8B84A]" />
          <span className="font-semibold">Cocoa Sunrise Sanctuary</span>
          <span className="text-[#6B4938]/40">•</span>
          <span className="text-[#3B2922]/80">Morning Clarity & Reflection</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-2">
          <p className="font-serif text-sm uppercase tracking-[0.25em] text-[#6B4938] font-bold">
            COGNIVAULT
          </p>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-[#3B2922] tracking-tight leading-[1.12]">
            Your thoughts. <br />
            Your intelligence. <br />
            <span className="italic text-[#6B4938] relative inline-block">
              Your vault.
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#E8B84A]/60 rounded-full" />
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#6B4938] max-w-xl mx-auto leading-relaxed font-normal">
          A private AI space to think, reflect, brainstorm and turn conversations into meaningful insights.
        </p>

        {/* Philosophy Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFCF7] border border-[#E8D6C3] text-xs text-[#6B4938] shadow-xs">
          <Coffee size={14} className="text-[#6B4938]" />
          <span className="font-semibold text-[#3B2922]">A Calm Ritual:</span>
          <span>Talk → Reflect → Understand → Discover → Grow</span>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
          <button
            id="landing-unlock-vault-btn"
            onClick={openAuthModal}
            className="px-7 py-3.5 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFFCF7] font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:translate-y-[-1px] active:translate-y-[0px] flex items-center gap-2.5 group cursor-pointer border border-[#E8B84A]/30 hover:border-[#E8B84A]"
          >
            <span>Start Your Journey</span>
            <ArrowRight size={16} className="text-[#E8B84A] transition-transform group-hover:translate-x-1" />
          </button>

          <button
            id="landing-explore-demo-btn"
            onClick={onExploreSandbox}
            className="px-6 py-3.5 rounded-xl bg-[#FFFCF7] hover:bg-[#E8D6C3]/50 border border-[#E8D6C3] text-[#3B2922] font-medium text-sm transition-colors shadow-xs cursor-pointer"
          >
            <span>Explore Reflection Canvas</span>
          </button>
        </div>
      </section>

      {/* Visual Showing Warm Journal & AI Socratic Thought Interface */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="relative p-6 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] shadow-xl shadow-[#3B2922]/5 overflow-hidden">
          {/* Paper Notebook Texture & Corner Ribbon */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#E8B84A]/20 to-transparent pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#E8D6C3]">
            <div className="flex items-center gap-3">
              <CognivaultLogo size="sm" showWordmark={false} />
              <div>
                <h3 className="font-serif text-lg font-bold text-[#3B2922]">
                  Morning Reflection • Sunlit Horizon
                </h3>
                <p className="text-xs text-[#6B4938]">
                  Logged with morning coffee • Mood: <span className="text-[#3B2922] font-semibold">😌 Calm & Focused</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#A8B29A]/20 border border-[#A8B29A]/40 text-[#3B2922] text-xs font-medium">
                🌱 Personal Clarity
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#E8B84A]/20 border border-[#E8B84A]/50 text-[#6B4938] text-xs font-medium">
                💡 Key Insight
              </span>
            </div>
          </div>

          {/* Interactive Journal Preview Simulation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-3 p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3]/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6B4938]">
                <Feather size={14} className="text-[#6B4938]" />
                <span>Your Morning Journaling</span>
              </div>
              <p className="font-serif text-sm text-[#3B2922] leading-relaxed italic">
                "I realized this morning that I don't need to force every project to move at lightning speed.
                The work that feels most meaningful happens when I give myself permission to think deeply without rushing."
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8B84A]/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6B4938]">
                <Sparkles size={14} className="text-[#E8B84A]" />
                <span>Cognivault Socratic Mirror</span>
              </div>
              <p className="text-xs text-[#3B2922] leading-relaxed">
                "What would it look like if you protected your best morning hours solely for deliberate, uninterrupted thought — before letting external urgency dictate your pace?"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars in Warm Cocoa Sunrise Surfaces */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
        <div className="p-6 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-3 shadow-xs hover:border-[#6B4938]/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#E8B84A]/20 text-[#6B4938] border border-[#E8B84A]/40 flex items-center justify-center">
            <Sparkles size={20} className="text-[#6B4938]" />
          </div>
          <h3 className="text-base font-bold text-[#3B2922] font-serif">Socratic AI Mirror</h3>
          <p className="text-xs text-[#6B4938] leading-relaxed">
            Not a sterile chatbot. Gemini serves as an empathetic, calm thinking companion that
            challenges unexamined assumptions and asks high-leverage reflective questions.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-3 shadow-xs hover:border-[#6B4938]/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#A8B29A]/20 text-[#3B2922] border border-[#A8B29A]/40 flex items-center justify-center">
            <BrainCircuit size={20} className="text-[#3B2922]" />
          </div>
          <h3 className="text-base font-bold text-[#3B2922] font-serif">Personal Insights</h3>
          <p className="text-xs text-[#6B4938] leading-relaxed">
            Synthesize patterns across your private thoughts over time. Uncover recurring themes,
            emotional rhythm, and personal breakthroughs.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-3 shadow-xs hover:border-[#6B4938]/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#E8D6C3]/60 text-[#3B2922] border border-[#6B4938]/20 flex items-center justify-center">
            <Headphones size={20} className="text-[#3B2922]" />
          </div>
          <h3 className="text-base font-bold text-[#3B2922] font-serif">Mood Atmospheres</h3>
          <p className="text-xs text-[#6B4938] leading-relaxed">
            Warm ambient audio environments (Sunlit Harmony, Oceanic Theta, Deep Solitude, Grounding Anchor)
            with real-time animated frequency visualizers.
          </p>
        </div>
      </section>

      {/* Security Architecture Banner in Cocoa & Sage */}
      <section className="p-8 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] text-[#3B2922] max-w-4xl mx-auto space-y-6 shadow-sm mx-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#A8B29A]/25 border border-[#A8B29A]/50 text-[#3B2922]">
              <ShieldCheck size={24} className="text-[#3B2922]" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-[#3B2922]">
                Zero-Trust Vault Privacy
              </h2>
              <p className="text-xs text-[#6B4938] font-mono">
                User-Isolated Firestore • Cloud Run • Secret Manager Guardrails
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSecurityModal}
            className="text-xs text-[#6B4938] hover:text-[#3B2922] font-semibold underline underline-offset-4 cursor-pointer self-start sm:self-center"
          >
            Review Security Threat Model →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] space-y-1.5">
            <div className="font-semibold text-[#3B2922] flex items-center gap-1.5">
              <Lock size={14} className="text-[#6B4938]" />
              <span>User-Isolated Rules</span>
            </div>
            <p className="text-[#6B4938] text-[11px] leading-relaxed">
              Enforced at the Firestore level via <code>request.auth.uid == uid</code>. Nobody else can query your vault.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] space-y-1.5">
            <div className="font-semibold text-[#3B2922] flex items-center gap-1.5">
              <Server size={14} className="text-[#6B4938]" />
              <span>Server-Side Gemini</span>
            </div>
            <p className="text-[#6B4938] text-[11px] leading-relaxed">
              Gemini API keys reside securely in the Node.js backend and are never sent to the browser.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] space-y-1.5">
            <div className="font-semibold text-[#3B2922] flex items-center gap-1.5">
              <EyeOff size={14} className="text-[#6B4938]" />
              <span>Client Speech Privacy</span>
            </div>
            <p className="text-[#6B4938] text-[11px] leading-relaxed">
              Voice journaling transcribes locally on your device via Web Speech; zero audio recordings are stored.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
