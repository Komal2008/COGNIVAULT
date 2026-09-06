// /src/components/gamification/ReflectionJourneyView.tsx
// Dedicated full-page view for the Reflection Journey tab:
// Features Journey Map, Badges Gallery, and Growth Garden in Cocoa Sunrise style

import React, { useState } from "react";
import { Compass, Award, Sprout, Lock, CheckCircle2, Info, Sparkles, Flame, Eye, EyeOff } from "lucide-react";
import { useGamification } from "../../context/GamificationContext";
import { ALL_BADGES, JOURNEY_STAGES, calculateLevelData } from "../../lib/gamification";
import { GrowthGardenView } from "./GrowthGardenView";

interface ReflectionJourneyViewProps {
  onStartReflectionWithPrompt?: (prompt: string) => void;
}

export const ReflectionJourneyView: React.FC<ReflectionJourneyViewProps> = ({ onStartReflectionWithPrompt }) => {
  const { stats, togglePauseStreak } = useGamification();
  const [activeTab, setActiveTab] = useState<"journey" | "badges" | "garden">("journey");

  const levelInfo = calculateLevelData(stats.xp);
  const unlockedStageIds = new Set(stats.unlockedStages || ["begin"]);
  const unlockedBadgeIds = new Set(stats.badges || ["first_thought"]);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] p-6 sm:p-9 shadow-xs">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-[#E8B84A]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D6C3]/40 border border-[#6B4938]/15 text-[#6B4938] text-xs font-semibold">
            <Compass size={14} className="text-[#E8B84A]" />
            <span>Private Personal Sanctuary</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#3B2922] tracking-tight">
                Your Reflection Journey
              </h1>
              <p className="text-sm sm:text-base text-[#6B4938] mt-1 font-normal">
                "Your reflection journey is something you can explore and grow."
              </p>
            </div>

            {/* Non-Clinical Notice */}
            <div className="flex items-start gap-2 px-3.5 py-2 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] text-xs text-[#6B4938] max-w-xs shadow-2xs">
              <Info size={14} className="shrink-0 text-[#A8B29A] mt-0.5" />
              <span>Measures journaling frequency & engagement only. Not a clinical score.</span>
            </div>
          </div>

          {/* Level Progress Bar & Gentle Streak Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
            {/* Level Card */}
            <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] flex items-center gap-3.5 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#3B2922] text-[#FFF8EE] flex flex-col items-center justify-center shrink-0 shadow-xs border border-[#6B4938]">
                <span className="text-[9px] uppercase tracking-wider font-mono text-[#E8B84A] font-bold">LVL</span>
                <span className="text-lg font-serif font-bold leading-none">{levelInfo.level}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[#3B2922] truncate">
                    Level {levelInfo.level} — {levelInfo.levelTitle}
                  </span>
                  <span className="text-xs font-mono text-[#6B4938] shrink-0">{stats.xp} XP</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-2 flex-1 bg-[#E8D6C3] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6B4938] to-[#E8B84A] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${levelInfo.progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#6B4938]">{levelInfo.progressPercent}%</span>
                </div>
              </div>
            </div>

            {/* Gentle Streak Card */}
            <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stats.streakPaused ? "🌱" : stats.streak > 1 ? "🔥" : "🌱"}</span>
                <div>
                  <span className="text-xs font-serif font-bold text-[#3B2922] block">
                    {stats.streakPaused
                      ? "Streak Tracking Paused"
                      : stats.streak > 1
                      ? `${stats.streak}-day reflection streak`
                      : "Welcome back 🌱"}
                  </span>
                  <span className="text-[11px] text-[#6B4938] font-serif italic">
                    {stats.streakPaused ? "Reflect at your own calm pace" : "Showing up for your inner self"}
                  </span>
                </div>
              </div>

              <button
                onClick={togglePauseStreak}
                className="p-1.5 rounded-lg text-[#6B4938] hover:text-[#3B2922] hover:bg-[#F5EBE1] transition-colors cursor-pointer"
                title={stats.streakPaused ? "Resume streak tracking" : "Pause streak tracking"}
              >
                {stats.streakPaused ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            </div>

            {/* Summary Stat Pill */}
            <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] flex items-center justify-around shadow-2xs">
              <div className="text-center">
                <span className="text-lg font-serif font-bold text-[#3B2922] block">{stats.reflectionsCount}</span>
                <span className="text-[10px] text-[#6B4938] uppercase font-mono">Reflections</span>
              </div>
              <div className="h-8 w-px bg-[#E8D6C3]" />
              <div className="text-center">
                <span className="text-lg font-serif font-bold text-[#3B2922] block">{stats.badges.length}</span>
                <span className="text-[10px] text-[#6B4938] uppercase font-mono">Badges</span>
              </div>
              <div className="h-8 w-px bg-[#E8D6C3]" />
              <div className="text-center">
                <span className="text-lg font-serif font-bold text-[#3B2922] block">{stats.completedActionsCount}</span>
                <span className="text-[10px] text-[#6B4938] uppercase font-mono">Actions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#FFFCF7] rounded-2xl border border-[#E8D6C3] shadow-2xs">
        <button
          onClick={() => setActiveTab("journey")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "journey"
              ? "bg-[#6B4938] text-[#FFFCF7] shadow-xs border border-[#E8B84A]/30"
              : "text-[#6B4938] hover:text-[#3B2922] hover:bg-[#FFF8EE]"
          }`}
        >
          <Compass size={16} />
          <span>Journey Map</span>
        </button>
        <button
          onClick={() => setActiveTab("badges")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "badges"
              ? "bg-[#6B4938] text-[#FFFCF7] shadow-xs border border-[#E8B84A]/30"
              : "text-[#6B4938] hover:text-[#3B2922] hover:bg-[#FFF8EE]"
          }`}
        >
          <Award size={16} />
          <span>Badges ({stats.badges.length}/{ALL_BADGES.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("garden")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "garden"
              ? "bg-[#6B4938] text-[#FFFCF7] shadow-xs border border-[#E8B84A]/30"
              : "text-[#6B4938] hover:text-[#3B2922] hover:bg-[#FFF8EE]"
          }`}
        >
          <Sprout size={16} />
          <span>My Reflection Garden</span>
        </button>
      </div>

      {/* Tab 1: Visual Journey Map */}
      {activeTab === "journey" && (
        <section className="space-y-6">
          <div className="bg-[#FFFCF7] border border-[#E8D6C3] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-[#E8D6C3] pb-4">
              <h2 className="text-xl font-serif font-bold text-[#3B2922]">
                Visual Journey Map
              </h2>
              <p className="text-xs text-[#6B4938] font-serif italic mt-0.5">
                🌱 BEGIN → 💭 THINK → 🪞 REFLECT → 💡 DISCOVER → 🎯 ACT → ✨ GROW
              </p>
            </div>

            {/* Stepper Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {JOURNEY_STAGES.map((stage, idx) => {
                const isUnlocked = unlockedStageIds.has(stage.id);
                return (
                  <div
                    key={stage.id}
                    className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between space-y-3 ${
                      isUnlocked
                        ? "bg-[#FFF8EE] border-[#E8B84A]/70 shadow-xs ring-1 ring-[#E8B84A]/30"
                        : "bg-[#F5EBE1]/40 border-[#E8D6C3] opacity-60"
                    }`}
                  >
                    {/* Top Strip Accent for Unlocked */}
                    {isUnlocked && <div className="absolute top-0 left-0 right-0 h-1 bg-[#E8B84A]" />}

                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                          isUnlocked
                            ? "bg-[#FFFCF7] border-[#E8B84A] shadow-2xs"
                            : "bg-[#E8D6C3] border-[#C8B8A6] text-gray-400"
                        }`}
                      >
                        {isUnlocked ? stage.emoji : <Lock size={18} />}
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isUnlocked
                            ? "bg-[#A8B29A]/30 text-[#3B2922] border border-[#A8B29A]/40"
                            : "bg-[#E8D6C3]/60 text-[#6B4938]"
                        }`}
                      >
                        {isUnlocked ? "✓ Unlocked" : "Locked"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#6B4938]">
                          STAGE {idx + 1}
                        </span>
                        <h4 className="text-base font-serif font-bold text-[#3B2922]">
                          {stage.label}
                        </h4>
                      </div>

                      <p className="text-xs text-[#6B4938] font-serif leading-relaxed">
                        {stage.description}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-[#8C7A6B] block pt-2 border-t border-[#E8D6C3]/60">
                      Requirement: {stage.requirement}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: Badges Gallery */}
      {activeTab === "badges" && (
        <section className="space-y-6">
          <div className="bg-[#FFFCF7] border border-[#E8D6C3] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-[#E8D6C3] pb-4">
              <h2 className="text-xl font-serif font-bold text-[#3B2922]">
                Reflection Badges Gallery
              </h2>
              <p className="text-xs text-[#6B4938] font-serif italic mt-0.5">
                Earned quietly as you deepen your presence and daily journaling practice.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_BADGES.map((badge) => {
                const isUnlocked = unlockedBadgeIds.has(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                      isUnlocked
                        ? "bg-[#FFF8EE] border-[#E8B84A]/70 shadow-xs"
                        : "bg-[#F5EBE1]/40 border-[#E8D6C3] opacity-60"
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border ${
                        isUnlocked
                          ? "bg-[#FFFCF7] border-[#E8B84A] shadow-2xs"
                          : "bg-[#E8D6C3] border-[#C8B8A6] text-gray-400"
                      }`}
                    >
                      {isUnlocked ? badge.icon : <Lock size={18} />}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-serif font-bold text-[#3B2922]">
                          {badge.title}
                        </h4>
                        {isUnlocked && <span className="text-xs text-[#E8B84A]">✓</span>}
                      </div>

                      <p className="text-xs text-[#6B4938] font-serif leading-relaxed">
                        {badge.description}
                      </p>

                      <span className="text-[10px] font-mono text-[#8C7A6B] block pt-1">
                        {isUnlocked ? "Status: Unlocked" : "Status: In Progress"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Growth Garden */}
      {activeTab === "garden" && (
        <section>
          <GrowthGardenView />
        </section>
      )}
    </div>
  );
};
