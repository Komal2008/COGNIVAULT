// /src/components/gamification/XpFloatingReward.tsx
// Subtle, calm floating XP rewards and badge unlock toasts (no excessive celebration effects)

import React from "react";
import { Sparkles, Award, Check } from "lucide-react";
import { useGamification } from "../../context/GamificationContext";
import { ALL_BADGES } from "../../lib/gamification";

export const XpFloatingReward: React.FC = () => {
  const { floatingNotices, newUnlockedBadge, dismissBadgeCelebration } = useGamification();

  const unlockedBadgeMeta = newUnlockedBadge
    ? ALL_BADGES.find((b) => b.title.toLowerCase() === newUnlockedBadge.toLowerCase())
    : null;

  return (
    <>
      {/* Floating XP Pills (Top Right) */}
      <div className="fixed top-20 right-6 z-50 pointer-events-none flex flex-col items-end gap-2">
        {floatingNotices.map((notice) => (
          <div
            key={notice.id}
            className="animate-bounce-subtle pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#3B2922] text-[#FFF8EE] shadow-lg border border-[#E8B84A]/40 backdrop-blur-md transition-all"
          >
            <span className="w-5 h-5 rounded-full bg-[#E8B84A] text-[#3B2922] flex items-center justify-center text-xs font-bold font-mono">
              +
            </span>
            <span className="font-serif font-bold text-sm text-[#E8B84A]">
              +{notice.amount} XP
            </span>
            <span className="text-xs text-[#E8D6C3] font-sans border-l border-[#6B4938] pl-2">
              {notice.activityLabel}
            </span>
          </div>
        ))}
      </div>

      {/* Gentle Badge Unlock Modal / Notification */}
      {newUnlockedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="max-w-sm w-full bg-[#FFF8EE] border-2 border-[#E8B84A] rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E8B84A]/20 border border-[#E8B84A]/50 flex items-center justify-center text-3xl shadow-xs">
              {unlockedBadgeMeta?.icon || "✨"}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest font-serif font-bold text-[#E8B84A] block">
                ✨ New Badge Unlocked
              </span>
              <h3 className="text-xl font-serif font-bold text-[#3B2922]">
                {newUnlockedBadge}
              </h3>
              <p className="text-xs text-[#6B4938] font-serif italic max-w-xs mx-auto">
                {unlockedBadgeMeta?.description || "A milestone in your private reflection journey."}
              </p>
            </div>

            <div className="pt-2">
              <button
                id="dismiss-badge-btn"
                onClick={dismissBadgeCelebration}
                className="w-full py-2.5 px-4 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFF8EE] font-serif font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Check size={14} className="text-[#E8B84A]" />
                <span>Continue Journey</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
