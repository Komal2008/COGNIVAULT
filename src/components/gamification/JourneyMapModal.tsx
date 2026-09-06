// /src/components/gamification/JourneyMapModal.tsx
// Reflection Journey Map, Badges Gallery, and Garden explorer in an elegant Cocoa Sunrise modal

import React, { useState } from "react";
import { X, Lock, CheckCircle2, Award, Compass, Sprout, Sparkles } from "lucide-react";
import { useGamification } from "../../context/GamificationContext";
import { ALL_BADGES, JOURNEY_STAGES } from "../../lib/gamification";
import { GrowthGardenView } from "./GrowthGardenView";

interface JourneyMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JourneyMapModal: React.FC<JourneyMapModalProps> = ({ isOpen, onClose }) => {
  const { stats } = useGamification();
  const [activeTab, setActiveTab] = useState<"journey" | "badges" | "garden">("journey");

  if (!isOpen) return null;

  const unlockedStageIds = new Set(stats.unlockedStages || ["begin"]);
  const unlockedBadgeIds = new Set(stats.badges || ["first_thought"]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#FFF8EE] border border-[#E8D6C3] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8D6C3] pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E8B84A] font-bold">
              Cognivault Sanctuary
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3B2922]">
              Your Reflection Journey
            </h2>
          </div>
          <button
            id="close-journey-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-[#6B4938] hover:text-[#3B2922] hover:bg-[#F5EBE1] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-[#F5EBE1] rounded-2xl border border-[#E8D6C3]">
          <button
            onClick={() => setActiveTab("journey")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "journey"
                ? "bg-[#FFF8EE] text-[#3B2922] shadow-xs"
                : "text-[#6B4938] hover:text-[#3B2922]"
            }`}
          >
            <Compass size={14} />
            <span>Journey Map</span>
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "badges"
                ? "bg-[#FFF8EE] text-[#3B2922] shadow-xs"
                : "text-[#6B4938] hover:text-[#3B2922]"
            }`}
          >
            <Award size={14} />
            <span>Badges ({stats.badges.length}/{ALL_BADGES.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("garden")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "garden"
                ? "bg-[#FFF8EE] text-[#3B2922] shadow-xs"
                : "text-[#6B4938] hover:text-[#3B2922]"
            }`}
          >
            <Sprout size={14} />
            <span>Reflection Garden</span>
          </button>
        </div>

        {/* Tab 1: Journey Map */}
        {activeTab === "journey" && (
          <div className="space-y-6">
            <p className="text-xs text-[#6B4938] font-serif italic">
              Each stage marks an intentional depth in your inner relationship, from initial curiosity to rooted habit.
            </p>

            {/* Stages Stepper */}
            <div className="space-y-3">
              {JOURNEY_STAGES.map((stage, idx) => {
                const isUnlocked = unlockedStageIds.has(stage.id);
                return (
                  <div
                    key={stage.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                      isUnlocked
                        ? "bg-[#FFFCF7] border-[#E8B84A]/60 shadow-2xs"
                        : "bg-[#F5EBE1]/40 border-[#E8D6C3] opacity-60"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 border ${
                        isUnlocked
                          ? "bg-[#FFF8EE] border-[#E8B84A] text-xl"
                          : "bg-[#E8D6C3] border-[#C8B8A6] text-gray-400"
                      }`}
                    >
                      {isUnlocked ? stage.emoji : <Lock size={16} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[#6B4938] font-bold">
                            STEP {idx + 1}
                          </span>
                          <h4 className="text-sm font-serif font-bold text-[#3B2922]">
                            {stage.label}
                          </h4>
                        </div>
                        {isUnlocked ? (
                          <span className="text-[10px] font-mono text-[#A8B29A] font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#8C7A6B]">Locked</span>
                        )}
                      </div>

                      <p className="text-xs text-[#6B4938] mt-1 font-serif">
                        {stage.description}
                      </p>

                      <span className="text-[10px] font-mono text-[#8C7A6B] block mt-1.5">
                        Requirement: {stage.requirement}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Badges Gallery */}
        {activeTab === "badges" && (
          <div className="space-y-4">
            <p className="text-xs text-[#6B4938] font-serif italic">
              Quiet milestones earned through consistent presence and introspection.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_BADGES.map((badge) => {
                const isUnlocked = unlockedBadgeIds.has(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      isUnlocked
                        ? "bg-[#FFFCF7] border-[#E8B84A]/60 shadow-2xs"
                        : "bg-[#F5EBE1]/40 border-[#E8D6C3] opacity-60"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                        isUnlocked
                          ? "bg-[#FFF8EE] border-[#E8B84A]"
                          : "bg-[#E8D6C3] border-[#C8B8A6] text-gray-400"
                      }`}
                    >
                      {isUnlocked ? badge.icon : <Lock size={16} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-serif font-bold text-[#3B2922]">
                          {badge.title}
                        </h4>
                        {isUnlocked && (
                          <span className="text-[9px] font-mono text-[#E8B84A] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B4938] font-serif mt-0.5 leading-snug">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Reflection Garden */}
        {activeTab === "garden" && (
          <div>
            <GrowthGardenView />
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-[#E8D6C3] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFF8EE] font-serif font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
