// /src/components/gamification/GrowthGardenView.tsx
// Visual representation of journaling activity only. Never claims to measure mental or psychological wellness.

import React, { useState } from "react";
import { Info, Sparkles, Flower2, Milestone, Sun } from "lucide-react";
import { useGamification } from "../../context/GamificationContext";

export const GrowthGardenView: React.FC = () => {
  const { stats } = useGamification();
  const [activeElementInfo, setActiveElementInfo] = useState<string | null>(null);

  const reflectionCount = stats.reflectionsCount || 0;
  const insightsCount = stats.badges.includes("pattern_finder") ? 4 : 2; // Derived from reflections & badges
  const actionsCount = stats.completedActionsCount || 0;
  const tinyWinsCount = stats.tinyWinsCount || 0;

  // Garden Growth Stage calculation
  let stageName = "Dormant Seed";
  let stageDescription = "A quiet beginning in rich soil.";

  if (reflectionCount >= 20) {
    stageName = "Growing Canopy Tree";
    stageDescription = "A deep canopy of thoughtful reflections and anchored habits.";
  } else if (reflectionCount >= 10) {
    stageName = "Lush Small Plant";
    stageDescription = "Strong stems and spreading leaves from regular reflection.";
  } else if (reflectionCount >= 5) {
    stageName = "Unfurling Sprout";
    stageDescription = "First tender green leaves reaching upward.";
  } else if (reflectionCount >= 1) {
    stageName = "Planted Seedling";
    stageDescription = "Rooted quietly in the warmth of your private sanctuary.";
  }

  return (
    <div className="bg-[#FFFCF7] border border-[#E8D6C3] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
      {/* Header & Activity-Only Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8D6C3] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🪴</span>
            <h2 className="text-xl font-serif font-bold text-[#3B2922]">
              My Reflection Garden
            </h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#E8B84A]/20 text-[#6B4938] font-bold border border-[#E8B84A]/30">
              {stageName}
            </span>
          </div>
          <p className="text-xs text-[#6B4938] font-serif italic mt-0.5">
            {stageDescription}
          </p>
        </div>

        {/* Clear Non-Clinical Notice */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] text-[10px] text-[#6B4938] max-w-xs">
          <Info size={13} className="shrink-0 text-[#A8B29A]" />
          <span>Reflects journaling frequency only — not a clinical measure.</span>
        </div>
      </div>

      {/* Visual Garden Canvas / Stage */}
      <div className="relative w-full h-72 sm:h-80 bg-gradient-to-b from-[#FFF8EE] via-[#F5EBE1] to-[#E6D5C3] rounded-2xl border border-[#E8D6C3] overflow-hidden flex flex-col justify-end items-center p-6 shadow-inner">
        {/* Sky Ambient Light / Sun */}
        <div className="absolute top-4 right-8 w-16 h-16 rounded-full bg-[#E8B84A]/20 blur-xl pointer-events-none" />
        <div className="absolute top-6 right-10 text-[#E8B84A] opacity-70 animate-pulse">
          <Sun size={28} />
        </div>

        {/* Floating Tiny Win Fireflies */}
        {Array.from({ length: Math.min(6, Math.max(1, tinyWinsCount)) }).map((_, i) => (
          <div
            key={`firefly-${i}`}
            onMouseEnter={() => setActiveElementInfo(`Tiny Win: A celebrated small breakthrough.`)}
            onMouseLeave={() => setActiveElementInfo(null)}
            className="absolute cursor-pointer transition-transform hover:scale-125"
            style={{
              top: `${18 + (i * 12) % 45}%`,
              left: `${15 + (i * 22) % 70}%`,
            }}
          >
            <div className="w-3 h-3 rounded-full bg-[#E8B84A] shadow-[0_0_12px_#E8B84A] animate-ping opacity-60 absolute" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFF8EE] border border-[#E8B84A] shadow-[0_0_8px_#E8B84A] relative z-10" />
          </div>
        ))}

        {/* Central Garden Flora depending on reflection count */}
        <div className="relative z-10 flex flex-col items-center">
          {reflectionCount < 5 && (
            <div
              onMouseEnter={() => setActiveElementInfo("Seedling: Cultivated by your first reflections.")}
              onMouseLeave={() => setActiveElementInfo(null)}
              className="text-center cursor-pointer group"
            >
              <div className="text-6xl sm:text-7xl drop-shadow-sm group-hover:scale-105 transition-transform">
                🌱
              </div>
              <span className="text-[11px] font-serif font-bold text-[#6B4938] bg-[#FFFCF7]/90 px-2 py-0.5 rounded-full border border-[#E8D6C3] shadow-2xs mt-2 inline-block">
                Tender Seedling
              </span>
            </div>
          )}

          {reflectionCount >= 5 && reflectionCount < 10 && (
            <div
              onMouseEnter={() => setActiveElementInfo("Sprout: 5+ reflections expanding root and stem.")}
              onMouseLeave={() => setActiveElementInfo(null)}
              className="text-center cursor-pointer group"
            >
              <div className="text-7xl sm:text-8xl drop-shadow-md group-hover:scale-105 transition-transform">
                🌿
              </div>
              <span className="text-[11px] font-serif font-bold text-[#6B4938] bg-[#FFFCF7]/90 px-2 py-0.5 rounded-full border border-[#E8D6C3] shadow-2xs mt-2 inline-block">
                Rising Sprout
              </span>
            </div>
          )}

          {reflectionCount >= 10 && reflectionCount < 20 && (
            <div
              onMouseEnter={() => setActiveElementInfo("Small Plant: 10+ entries of grounded reflection.")}
              onMouseLeave={() => setActiveElementInfo(null)}
              className="text-center cursor-pointer group"
            >
              <div className="text-8xl sm:text-9xl drop-shadow-md group-hover:scale-105 transition-transform">
                🪴
              </div>
              <span className="text-[11px] font-serif font-bold text-[#6B4938] bg-[#FFFCF7]/90 px-2 py-0.5 rounded-full border border-[#E8D6C3] shadow-2xs mt-2 inline-block">
                Flourishing Foliage
              </span>
            </div>
          )}

          {reflectionCount >= 20 && (
            <div
              onMouseEnter={() => setActiveElementInfo("Mature Canopy: 20+ reflections creating a peaceful grove.")}
              onMouseLeave={() => setActiveElementInfo(null)}
              className="text-center cursor-pointer group"
            >
              <div className="text-9xl sm:text-[10rem] drop-shadow-lg group-hover:scale-105 transition-transform">
                🌳
              </div>
              <span className="text-[11px] font-serif font-bold text-[#6B4938] bg-[#FFFCF7]/90 px-2.5 py-0.5 rounded-full border border-[#E8D6C3] shadow-2xs mt-1 inline-block">
                Sanctuary Tree
              </span>
            </div>
          )}
        </div>

        {/* Stepping Stones (Completed Actions) along the soil */}
        <div className="absolute bottom-6 w-full px-8 flex justify-between items-center pointer-events-none">
          {Array.from({ length: Math.min(5, Math.max(1, actionsCount + 1)) }).map((_, i) => (
            <div
              key={`stone-${i}`}
              className="pointer-events-auto cursor-pointer w-8 h-4 rounded-full bg-[#B8A695] border border-[#8C7A6B] shadow-inner flex items-center justify-center hover:bg-[#A8B29A] transition-colors"
              onMouseEnter={() => setActiveElementInfo(`Path Marker ${i + 1}: Action step anchored in reality.`)}
              onMouseLeave={() => setActiveElementInfo(null)}
              title="Stepping Stone"
            >
              <div className="w-3 h-1 bg-[#FFF8EE]/60 rounded-full" />
            </div>
          ))}
        </div>

        {/* Blooming Insight Flowers nestled along soil */}
        <div className="absolute bottom-7 left-12 flex items-center gap-4">
          {Array.from({ length: Math.min(4, Math.max(1, insightsCount)) }).map((_, i) => (
            <div
              key={`flower-${i}`}
              onMouseEnter={() => setActiveElementInfo(`Insight Blossom ${i + 1}: Realization synthesized from your reflections.`)}
              onMouseLeave={() => setActiveElementInfo(null)}
              className="cursor-pointer text-xl hover:scale-125 transition-transform"
            >
              🌸
            </div>
          ))}
        </div>

        {/* Deep Soil Base Layer */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#4A3528] border-t border-[#3B2922]" />
      </div>

      {/* Interactive Inspector Pill */}
      <div className="min-h-[28px] text-center">
        {activeElementInfo ? (
          <span className="text-xs font-serif font-medium text-[#3B2922] bg-[#FFF8EE] border border-[#E8B84A] px-3 py-1 rounded-full animate-in fade-in">
            {activeElementInfo}
          </span>
        ) : (
          <span className="text-[11px] text-[#6B4938] font-serif italic">
            Hover over flowers, fireflies, or stones to explore your reflection elements.
          </span>
        )}
      </div>

      {/* Garden Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] text-center space-y-1">
          <div className="text-lg">🌱</div>
          <div className="text-xs font-serif font-bold text-[#3B2922]">
            {reflectionCount} Reflections
          </div>
          <div className="text-[10px] text-[#6B4938]">Nurtures the flora</div>
        </div>

        <div className="p-3 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] text-center space-y-1">
          <div className="text-lg">🌸</div>
          <div className="text-xs font-serif font-bold text-[#3B2922]">
            {insightsCount} Insights
          </div>
          <div className="text-[10px] text-[#6B4938]">Bloom as flowers</div>
        </div>

        <div className="p-3 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] text-center space-y-1">
          <div className="text-lg">🪨</div>
          <div className="text-xs font-serif font-bold text-[#3B2922]">
            {actionsCount} Actions
          </div>
          <div className="text-[10px] text-[#6B4938]">Path stepping stones</div>
        </div>

        <div className="p-3 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] text-center space-y-1">
          <div className="text-lg">✨</div>
          <div className="text-xs font-serif font-bold text-[#3B2922]">
            {tinyWinsCount} Tiny Wins
          </div>
          <div className="text-[10px] text-[#6B4938]">Glowing fireflies</div>
        </div>
      </div>
    </div>
  );
};
