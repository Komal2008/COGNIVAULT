// /src/components/gamification/JourneySummaryBar.tsx
// Compact Dashboard Gamification widget ("YOUR JOURNEY"): Level, XP progress, Gentle Streak, stats & Explore link

import React from "react";
import { Sparkles, Flame, Sprout, ChevronRight, Award, Compass } from "lucide-react";
import { useGamification } from "../../context/GamificationContext";
import { calculateLevelData } from "../../lib/gamification";

interface JourneySummaryBarProps {
  onOpenJourneyModal?: () => void;
  onNavigateJourney?: () => void;
}

export const JourneySummaryBar: React.FC<JourneySummaryBarProps> = ({
  onOpenJourneyModal,
  onNavigateJourney,
}) => {
  const { stats } = useGamification();
  const levelInfo = calculateLevelData(stats.xp);

  const handleExplore = () => {
    if (onNavigateJourney) {
      onNavigateJourney();
    } else if (onOpenJourneyModal) {
      onOpenJourneyModal();
    }
  };

  return (
    <div className="bg-[#FFFCF7] border border-[#E8D6C3] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5 relative overflow-hidden">
      {/* Header Label */}
      <div className="flex items-center justify-between border-b border-[#E8D6C3]/60 pb-2.5">
        <div className="flex items-center gap-2">
          <Compass size={15} className="text-[#E8B84A]" />
          <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#6B4938]">
            Your Journey
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#6B4938]/70">
          Reflective Progress
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Level Title & XP Progress */}
        <div className="space-y-2 flex-1 max-w-md">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-serif font-bold text-[#3B2922]">
              Level {levelInfo.level} — {levelInfo.levelTitle}
            </h3>
            <span className="text-xs font-mono font-semibold text-[#6B4938] bg-[#FFF8EE] px-2.5 py-0.5 rounded-full border border-[#E8D6C3]">
              {stats.xp} XP / {levelInfo.nextLevelXp} XP
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="h-2.5 flex-1 bg-[#E8D6C3]/70 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#6B4938] via-[#E8B84A] to-[#E8B84A] rounded-full transition-all duration-500 ease-out shadow-2xs"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-[#6B4938] font-bold shrink-0">
              {levelInfo.progressPercent}%
            </span>
          </div>
        </div>

        {/* Stats, Gentle Streak & Action Trigger */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#E8D6C3]/60">
          {/* Gentle Streak Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] shadow-2xs">
            {stats.streakPaused ? (
              <>
                <span className="text-xs">🌱</span>
                <span className="text-xs font-serif text-[#6B4938]">Pacing journey</span>
              </>
            ) : stats.streak > 1 ? (
              <>
                <span className="text-xs">🔥</span>
                <span className="text-xs font-serif font-bold text-[#3B2922]">
                  {stats.streak}-day streak
                </span>
              </>
            ) : (
              <>
                <span className="text-xs">🌱</span>
                <span className="text-xs font-serif font-medium text-[#6B4938]">
                  Welcome back
                </span>
              </>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-xs font-serif text-[#6B4938]">
            <span className="flex items-center gap-1 bg-[#FFF8EE] px-2.5 py-1 rounded-xl border border-[#E8D6C3]">
              <span>🌱</span>
              <span className="font-bold text-[#3B2922]">{stats.reflectionsCount}</span>
            </span>
            <span className="flex items-center gap-1 bg-[#FFF8EE] px-2.5 py-1 rounded-xl border border-[#E8D6C3]">
              <span>🏆</span>
              <span className="font-bold text-[#3B2922]">{stats.badges.length}</span>
            </span>
          </div>

          {/* Explore Button */}
          <button
            id="explore-journey-btn"
            onClick={handleExplore}
            className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#FFFCF7] bg-[#6B4938] hover:bg-[#3B2922] px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs border border-[#E8B84A]/30 group"
          >
            <span>Explore Journey</span>
            <ChevronRight size={14} className="text-[#E8B84A] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

