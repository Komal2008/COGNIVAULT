// /src/components/rituals/MorningRitualCard.tsx
// Signature Morning Ritual:
// Header: GOOD MORNING ☀️ "How are you arriving today?"
// Mood selection → Gemini personalized grounding thought → Reflection question → Audio → Journal on this prompt

import React, { useState } from "react";
import { Sun, Volume2, VolumeX, PenTool, Sparkles, Check, ArrowRight, Loader2 } from "lucide-react";
import { MoodType, MorningRitualData } from "../../types";
import { fetchMorningRitual } from "../../../client/services/apiService";
import { useGamification } from "../../context/GamificationContext";

interface MorningRitualCardProps {
  onStartJournalWithPrompt?: (prompt: string, mood: MoodType) => void;
  userHistorySummary?: string;
}

const MOODS: { type: MoodType; label: string; emoji: string }[] = [
  { type: "calm", label: "Calm", emoji: "🌿" },
  { type: "reflective", label: "Reflective", emoji: "🪞" },
  { type: "happy", label: "Grateful", emoji: "☀️" },
  { type: "stressed", label: "Heavy / Overwhelmed", emoji: "🌧️" },
  { type: "curious", label: "Curious", emoji: "🔭" },
  { type: "focused", label: "Focused", emoji: "🎯" },
];

export const MorningRitualCard: React.FC<MorningRitualCardProps> = ({
  onStartJournalWithPrompt,
  userHistorySummary = "",
}) => {
  const { recordMorningRitual } = useGamification();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ritualData, setRitualData] = useState<MorningRitualData | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelectMood = async (mood: MoodType) => {
    setSelectedMood(mood);
    setIsLoading(true);
    try {
      const data = await fetchMorningRitual({ mood, userHistorySummary });
      setRitualData(data);
    } catch (err) {
      console.warn("Morning ritual generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = () => {
    if (!ritualData?.groundingThought) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `${ritualData.groundingThought} ... ${ritualData.reflectionQuestion}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.88;
      utterance.pitch = 0.95;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCompleteRitual = async () => {
    setIsCompleted(true);
    await recordMorningRitual();
  };

  const handleJournal = () => {
    if (!ritualData) return;
    handleCompleteRitual();
    if (onStartJournalWithPrompt) {
      onStartJournalWithPrompt(ritualData.reflectionQuestion, selectedMood || "reflective");
    }
  };

  return (
    <div className="bg-[#FFF8EE] border-2 border-[#E8B84A]/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
      {/* Decorative Warm Morning Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#E8B84A]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-1 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">☀️</span>
          <span className="text-xs uppercase font-mono tracking-widest font-bold text-[#E8B84A]">
            GOOD MORNING
          </span>
          <span className="text-[10px] font-mono bg-[#E8B84A]/20 text-[#6B4938] px-2 py-0.5 rounded-full font-bold">
            +10 XP
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3B2922]">
          How are you arriving today?
        </h2>
        <p className="text-xs text-[#6B4938] font-serif italic">
          Select your arrival mood to receive a personalized grounding thought and daily reflection question.
        </p>
      </div>

      {/* Mood Selector Pills */}
      <div className="flex flex-wrap gap-2.5 relative z-10">
        {MOODS.map((m) => {
          const isSelected = selectedMood === m.type;
          return (
            <button
              key={m.type}
              onClick={() => handleSelectMood(m.type)}
              disabled={isLoading}
              className={`px-3.5 py-2 rounded-2xl text-xs font-serif font-medium flex items-center gap-2 border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#3B2922] text-[#FFF8EE] border-[#3B2922] shadow-sm scale-102"
                  : "bg-[#FFFCF7] text-[#6B4938] border-[#E8D6C3] hover:border-[#E8B84A] hover:bg-[#F5EBE1]"
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-8 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] flex items-center justify-center gap-3 text-[#6B4938] animate-pulse">
          <Loader2 size={20} className="animate-spin text-[#E8B84A]" />
          <span className="text-xs font-serif italic">
            Listening to your arrival and preparing your morning thought...
          </span>
        </div>
      )}

      {/* Ritual Content (Grounding Thought & Reflection Question) */}
      {ritualData && !isLoading && (
        <div className="space-y-6 pt-2 animate-in fade-in duration-300 relative z-10">
          {/* Grounding Thought */}
          <div className="space-y-2 p-5 rounded-2xl bg-[#FFFCF7] border border-[#E8B84A]/50 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#E8B84A]" />
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#6B4938] font-bold">
                  Today's Grounding Thought
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#8C7A6B] bg-[#F5EBE1] px-2 py-0.5 rounded-full">
                {ritualData.theme || "Gentle Morning"}
              </span>
            </div>

            <p className="text-base sm:text-lg font-serif italic text-[#3B2922] leading-relaxed">
              "{ritualData.groundingThought}"
            </p>
          </div>

          {/* Reflection Question */}
          <div className="space-y-2 p-5 rounded-2xl bg-[#F5EBE1] border border-[#E8D6C3]">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🪞</span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#6B4938] font-bold">
                Reflection Question
              </span>
            </div>

            <p className="text-base sm:text-lg font-serif font-bold text-[#3B2922]">
              {ritualData.reflectionQuestion}
            </p>
          </div>

          {/* Actions: Audio Listen + Journal On This + Complete */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handlePlayAudio}
              className="px-4 py-2.5 rounded-xl bg-[#FFFCF7] border border-[#E8D6C3] hover:border-[#E8B84A] text-[#3B2922] font-serif text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX size={15} className="text-[#E8B84A]" />
                  <span>Pause Audio</span>
                </>
              ) : (
                <>
                  <Volume2 size={15} className="text-[#E8B84A]" />
                  <span>Listen 🎧</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleJournal}
                className="px-4 py-2.5 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFF8EE] font-serif text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <PenTool size={14} className="text-[#E8B84A]" />
                <span>Journal on this prompt</span>
                <ArrowRight size={13} />
              </button>

              {!isCompleted && (
                <button
                  onClick={handleCompleteRitual}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FFFCF7] border border-[#E8D6C3] hover:bg-[#F5EBE1] text-[#6B4938] font-serif text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check size={14} className="text-[#A8B29A]" />
                  <span>Complete</span>
                </button>
              )}

              {isCompleted && (
                <span className="text-xs font-mono text-[#A8B29A] font-bold flex items-center gap-1 px-3 py-2 bg-[#FFFCF7] rounded-xl border border-[#A8B29A]/30">
                  <Check size={14} /> Completed (+10 XP)
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
