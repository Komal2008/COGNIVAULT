// /src/components/rituals/EveningReflectionModal.tsx
// Signature Evening Reflection:
// End of day reflection: "What is one thing you're proud of today?"
// Synthesizes: key thought, mood, insight, tomorrow's intention. Awards +15 XP.

import React, { useState } from "react";
import { Moon, Sparkles, Check, X, Loader2, ArrowRight } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useGamification } from "../../context/GamificationContext";
import { fetchEveningReflection } from "../../../client/services/apiService";
import { EveningReflectionData, MoodType } from "../../types";

interface EveningReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EveningReflectionModal: React.FC<EveningReflectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { recordEveningReflection } = useGamification();
  const [prideInput, setPrideInput] = useState("");
  const [mood, setMood] = useState<MoodType>("calm");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EveningReflectionData | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prideInput.trim()) return;

    setIsLoading(true);
    try {
      const data = await fetchEveningReflection({ prideItem: prideInput, mood });
      setResult(data);

      if (user) {
        const colRef = collection(db, "users", user.uid, "evening_reflections");
        await addDoc(colRef, {
          prideItem: prideInput,
          keyThought: data.keyThought,
          mood: data.mood,
          insight: data.insight,
          tomorrowIntention: data.tomorrowIntention,
          date: new Date().toISOString().split("T")[0],
          createdAt: serverTimestamp(),
        });
      }

      await recordEveningReflection();
      setIsSaved(true);
    } catch (err) {
      console.warn("Evening reflection error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#FFF8EE] border border-[#E8D6C3] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8D6C3] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌙</span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E8B84A] font-bold block">
                EVENING RITUAL • +15 XP
              </span>
              <h3 className="text-xl font-serif font-bold text-[#3B2922]">
                Close Your Day Gently
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6B4938] hover:text-[#3B2922] hover:bg-[#F5EBE1] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {!result ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-serif font-bold text-[#3B2922] block">
                What is one thing you are proud of today?
              </label>
              <p className="text-xs text-[#6B4938] font-serif italic">
                It can be as small as resting when tired, answering a message, or simply taking a deep breath.
              </p>
              <textarea
                value={prideInput}
                onChange={(e) => setPrideInput(e.target.value)}
                placeholder="Today I am proud of..."
                rows={3}
                className="w-full p-4 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] text-sm text-[#3B2922] focus:outline-hidden focus:border-[#E8B84A] transition-colors resize-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-serif font-medium text-[#6B4938]">
                How does this evening feel?
              </label>
              <div className="flex flex-wrap gap-2">
                {(["calm", "reflective", "happy", "stressed"] as MoodType[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-serif capitalize border cursor-pointer transition-colors ${
                      mood === m
                        ? "bg-[#3B2922] text-[#FFF8EE] border-[#3B2922]"
                        : "bg-[#FFFCF7] text-[#6B4938] border-[#E8D6C3] hover:bg-[#F5EBE1]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !prideInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFF8EE] font-serif font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-[#E8B84A]" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-[#E8B84A]" />
                    <span>Synthesize Evening Reflection</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in">
            {/* Key Thought */}
            <div className="p-4 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#E8B84A] font-bold">
                Evening Grounding
              </span>
              <p className="text-sm font-serif italic text-[#3B2922]">
                "{result.keyThought}"
              </p>
            </div>

            {/* Insight */}
            <div className="p-4 rounded-2xl bg-[#F5EBE1] border border-[#E8D6C3] space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#6B4938] font-bold">
                Tonight's Insight
              </span>
              <p className="text-xs font-serif text-[#3B2922]">
                {result.insight}
              </p>
            </div>

            {/* Tomorrow's Intention */}
            <div className="p-4 rounded-2xl bg-[#FFFCF7] border border-[#E8B84A]/60 space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#E8B84A] font-bold">
                A Seed for Tomorrow
              </span>
              <p className="text-xs font-serif font-medium text-[#3B2922]">
                {result.tomorrowIntention}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-mono text-[#A8B29A] font-bold flex items-center gap-1">
                <Check size={14} /> Evening ritual complete (+15 XP)
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFF8EE] font-serif font-bold text-xs cursor-pointer"
              >
                Rest Well
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
