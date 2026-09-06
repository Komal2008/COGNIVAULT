import React from "react";
import {
  Home,
  Sparkles,
  BookOpen,
  BrainCircuit,
  Headphones,
  Mic,
  Target,
  ShieldAlert,
  ChevronRight,
  Sun,
  Coffee,
  Compass,
} from "lucide-react";
import { ViewTab } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useAtmosphere } from "../../context/AtmosphereContext";
import { MOODS_CONFIG } from "../../lib/audioAtmosphere";
import { CognivaultLogo } from "./CognivaultLogo";

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const { currentMood } = useAtmosphere();
  const moodConfig = MOODS_CONFIG[currentMood] || MOODS_CONFIG.reflective;

  const navGroups: Array<{ label: string; items: Array<{ id: ViewTab; label: string; icon: React.ReactNode; badge?: string }> }> = [
    {
      label: "Your Space",
      items: [
        { id: "dashboard", label: "Home", icon: <Home size={17} /> },
        { id: "new-journal", label: "New Reflection", icon: <Sparkles size={17} /> },
        { id: "history", label: "Journal History", icon: <BookOpen size={17} /> },
      ],
    },
    {
      label: "Discover",
      items: [
        { id: "journey", label: "Reflection Journey", icon: <Compass size={17} /> },
        { id: "insights", label: "Insights", icon: <BrainCircuit size={17} /> },
      ],
    },
    {
      label: "Atmosphere",
      items: [
        { id: "atmosphere", label: "Atmosphere", icon: <Headphones size={17} /> },
        { id: "voice-journal", label: "Voice Journal", icon: <Mic size={17} /> },
        { id: "focus-mode", label: "Focus Sanctuary", icon: <Target size={17} /> },
      ],
    },
    {
      label: "Privacy",
      items: [{ id: "security", label: "Settings & Security", icon: <ShieldAlert size={17} /> }],
    },
  ];

  const handleNavClick = (tab: ViewTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`cv-sidebar-scroll left-0 z-40 h-dvh w-64 shrink-0 bg-[#FCFCF8] border-r border-[#E6F0E9] transition-transform duration-300 ease-in-out flex flex-col justify-between p-4 shadow-sm ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-5">
          <div className="relative px-2 pt-2 pb-1 select-none">
            <div className="absolute right-1 top-0 cv-sidebar-mark" aria-hidden="true">
              <CognivaultLogo size="sm" showWordmark={false} />
            </div>
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#786B63]">Welcome back,</p>
            <p className="mt-1 font-serif text-lg font-semibold text-[#3B2923]">
              {user?.displayName?.trim().split(" ")[0] || "Thinker"} <span className="text-[#D9AA4A]">✦</span>
            </p>
          </div>

          {/* Active Mood Pill */}
          <div
            onClick={() => handleNavClick("atmosphere")}
            className="p-4 rounded-2xl border border-[#E6F0E9] bg-[#F7F6F1] hover:bg-[#E6F0E9]/60 cursor-pointer transition-all shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-serif font-bold tracking-wider text-[#6B4938] uppercase">
                Active Soundscape
              </span>
              <span className="text-base">{moodConfig.emoji}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-serif font-bold text-[#3B2922]">{moodConfig.label}</span>
              <ChevronRight size={14} className="text-[#6B4938] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-[#6B4938] font-serif italic line-clamp-1 mt-0.5">
              {moodConfig.soundName}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-4" aria-label="Primary navigation">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-1.5">
                <p className="px-3 text-[9px] font-sans font-semibold uppercase tracking-[0.2em] text-[#786B63]">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-${item.id}-btn`}
                      onClick={() => handleNavClick(item.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`cv-nav-item relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-serif font-semibold transition-all duration-200 ease-out cursor-pointer select-none ${
                        isActive
                          ? "text-[#FFFDF8] bg-[#0F4D3F] shadow-sm border border-[#D9AA4A]/40"
                          : "text-[#6B4634] hover:text-[#3B2923] hover:bg-[#F7F1E7] border border-transparent"
                      }`}
                    >
                      {isActive && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#D9AA4A]" aria-hidden="true" />}
                      <div className="flex items-center gap-3">
                        <span className={`cv-nav-icon transition-transform duration-200 ${isActive ? "text-[#D9AA4A]" : "text-[#786B63]"} ${isActive && item.id === "atmosphere" ? "cv-atmosphere-active" : ""}`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="cv-nav-badge text-[9px] font-sans px-2 py-0.5 rounded-full font-semibold bg-[#DCE8DD] text-[#3B2923]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Security & Vault Status Footnote */}
        <div className="pt-4 border-t border-[#E5D7C8] text-[11px] text-[#786B63] space-y-1">
          <div className="flex items-center gap-1.5 font-serif font-bold text-[#3B2922]">
            <span className="w-2 h-2 rounded-full bg-[#D9AA4A]"></span>
            <span>Private Vault Online</span>
          </div>
          <p className="text-[10px] text-[#786B63]">User-isolated • Securely held</p>
        </div>
      </aside>
    </>
  );
};
