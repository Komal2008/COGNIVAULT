import React, { useState } from "react";
import {
  ShieldCheck,
  Volume2,
  VolumeX,
  Play,
  Pause,
  LogIn,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Sun,
  Coffee,
  Sparkles,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAtmosphere } from "../../context/AtmosphereContext";
import { AudioVisualizer } from "../audio/AudioVisualizer";
import { MOODS_CONFIG } from "../../lib/audioAtmosphere";
import { CognivaultLogo } from "./CognivaultLogo";
import { MyVaultModal } from "../auth/MyVaultModal";

interface HeaderProps {
  onOpenSecurityModal: () => void;
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSecurityModal,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const { user, openAuthModal, signOut } = useAuth();
  const { currentMood, isPlaying, isMuted, togglePlay, toggleMute, volume, setVolume } =
    useAtmosphere();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isMyVaultModalOpen, setIsMyVaultModalOpen] = useState(false);

  const moodConfig = MOODS_CONFIG[currentMood] || MOODS_CONFIG.reflective;
  const volumePercentage = isMuted ? 0 : Math.round(volume * 100);

  return (
    <>
      <header className="cv-header sticky top-0 z-50 w-full backdrop-blur-md bg-[#FFFCF7]/95 border-b border-[#E8D6C3] text-[#3B2922] transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Left: Mobile menu toggle + Brand Name */}
          <div className="flex items-center gap-3">
            <button
              id="mobile-sidebar-toggle-btn"
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 rounded-xl text-[#6B4938] hover:text-[#3B2922] hover:bg-[#E8D6C3]/40 focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <CognivaultLogo size="md" showTagline />
          </div>

          {/* Center: Subtle Security Indicator */}
          <div className="hidden md:flex items-center">
            <button
              id="security-indicator-btn"
              onClick={onOpenSecurityModal}
              className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8EE] hover:bg-[#E8D6C3]/40 border border-[#E8D6C3] text-xs text-[#6B4938] transition-all cursor-pointer shadow-2xs"
              title="Click to view Cognivault security & zero-trust architecture"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A8B29A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A8B29A]"></span>
              </span>
              <span className="font-serif font-bold text-[#3B2922] flex items-center gap-1 text-[11px]">
                <ShieldCheck size={13} className="text-[#6B4938]" />
                Private Vault
              </span>
              <span className="text-[#6B4938]/60 text-[10px] uppercase tracking-wider font-semibold">
                User-Isolated
              </span>
            </button>
          </div>

          {/* Right: Audio Atmosphere Mini-Controller & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Atmosphere Player in Cocoa Sunrise (Requirement 4) */}
            <div className="relative flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3]">
              <button
                id="audio-play-pause-btn"
                onClick={togglePlay}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  isPlaying
                    ? "bg-[#6B4938] text-[#FFFCF7] shadow-2xs ring-2 ring-[#E8B84A]/60"
                    : "text-[#6B4938] hover:text-[#3B2922] hover:bg-[#E8D6C3]/50"
                }`}
                title={isPlaying ? "Pause Ambience" : `Play ${moodConfig.soundName}`}
              >
                {isPlaying ? (
                  <Pause size={14} className="animate-pulse" />
                ) : (
                  <Play size={14} className="text-[#E8B84A]" />
                )}
              </button>

              <div className="hidden lg:flex flex-col">
                <span className="text-[11px] font-serif font-bold text-[#3B2922] leading-tight flex items-center gap-1">
                  <span>{moodConfig.emoji}</span>
                  <span className="truncate max-w-[110px]">{moodConfig.soundName}</span>
                </span>
                <span className="text-[9px] text-[#6B4938] font-medium">
                  {isPlaying ? (
                    <span className="text-[#A8B29A] font-semibold">Ambient Soundscape</span>
                  ) : (
                    <span className="italic text-[#6B4938]/70">Atmosphere Paused</span>
                  )}
                </span>
              </div>

              <div className="hidden sm:block">
                <AudioVisualizer className="w-16 h-5" barCount={8} />
              </div>

              {/* Mute & Volume */}
              <div className="relative flex items-center">
                <button
                  id="audio-mute-btn"
                  onClick={toggleMute}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  className="p-1 text-[#6B4938] hover:text-[#3B2922] transition-colors cursor-pointer flex items-center gap-1"
                  title={isMuted ? "Unmute" : `Volume: ${volumePercentage}%`}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span className="hidden xl:inline text-[9px] text-[#6B4938] font-mono">
                    {volumePercentage}%
                  </span>
                </button>

                {showVolumeSlider && (
                  <div
                    onMouseLeave={() => setShowVolumeSlider(false)}
                    className="absolute right-0 top-9 p-2.5 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] shadow-lg flex flex-col gap-1.5 z-50 w-32 animate-in fade-in"
                  >
                    <div className="flex justify-between text-[10px] text-[#6B4938] font-mono">
                      <span>Volume</span>
                      <span>{volumePercentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full accent-[#6B4938] cursor-pointer h-1.5 bg-[#E8D6C3] rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 16. MY VAULT / AUTHENTICATED PROFILE ACTION */}
            {user ? (
              <button
                id="my-vault-btn"
                onClick={() => setIsMyVaultModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#FFF8EE] hover:bg-[#E8D6C3]/40 border border-[#E8D6C3] text-xs font-serif font-bold text-[#3B2922] transition-all cursor-pointer shadow-2xs group"
                title="Open My Vault profile & account details"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full border border-[#E8D6C3] object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#6B4938] text-[#FFFCF7] flex items-center justify-center text-[10px] font-serif font-bold">
                    {user.displayName ? user.displayName[0].toUpperCase() : <UserIcon size={12} />}
                  </div>
                )}
                <span className="hidden sm:inline">My Vault</span>
              </button>
            ) : (
              <button
                id="open-sign-in-btn"
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFFCF7] text-xs font-semibold shadow-xs transition-all cursor-pointer border border-[#E8B84A]/30"
              >
                <LogIn size={14} className="text-[#E8B84A]" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Dedicated My Vault Modal */}
      <MyVaultModal
        isOpen={isMyVaultModalOpen}
        onClose={() => setIsMyVaultModalOpen(false)}
        onOpenSecurityArchitecture={onOpenSecurityModal}
      />
    </>
  );
};
