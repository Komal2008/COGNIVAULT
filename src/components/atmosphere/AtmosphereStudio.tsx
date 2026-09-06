import React from "react";
import {
  Headphones,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sun,
  Coffee,
} from "lucide-react";
import { useAtmosphere } from "../../context/AtmosphereContext";
import { MOODS_CONFIG } from "../../lib/audioAtmosphere";
import { MoodType } from "../../types";
import { AudioVisualizer } from "../audio/AudioVisualizer";

export const AtmosphereStudio: React.FC = () => {
  const {
    currentMood,
    setMood,
    isPlaying,
    isMuted,
    volume,
    setVolume,
    togglePlay,
    playMood,
    stopAudio,
    toggleMute,
    moodConfig,
  } = useAtmosphere();

  const moodList: MoodType[] = ["happy", "calm", "reflective", "stressed", "curious", "focused"];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D6C3]/40 border border-[#6B4938]/15 text-[#6B4938] text-xs font-semibold mb-2">
            <Headphones size={13} className="text-[#E8B84A]" />
            <span>PROCEDURAL SOUND SANCTUARY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3B2922] tracking-tight">
            Atmosphere Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#6B4938] mt-1 max-w-lg font-normal leading-relaxed">
            Procedural audio environments synthesized organically in your browser via the Web
            Audio API. Zero external streams, 100% private to your device.
          </p>
        </div>

        {/* Master Mini Visualizer */}
        <div className="flex items-center gap-3 self-start sm:self-center bg-[#FFF8EE] px-4 py-3 rounded-2xl border border-[#E8D6C3]">
          <AudioVisualizer className="w-24 h-8" barCount={12} />
          <div className="text-left">
            <span className="text-xs font-serif font-bold text-[#3B2922] block">
              {isPlaying ? "Generating Ambience" : "Ambience Silent"}
            </span>
            <span className="text-[10px] text-[#6B4938] uppercase tracking-wider font-semibold">
              {moodConfig.soundName}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Audio Control Console in Cocoa Sunrise */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className={`px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shadow-xs border ${
                isPlaying
                  ? "bg-[#6B4938] text-[#FFFCF7] border-[#E8B84A]/30 hover:bg-[#3B2922]"
                  : "bg-[#FFF8EE] text-[#3B2922] hover:bg-[#E8D6C3]/40 border-[#E8D6C3]"
              }`}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="text-[#E8B84A]" />}
              <span className="text-xs font-semibold tracking-wide">
                {isPlaying ? "Pause Ambience" : `Play ${moodConfig.soundName}`}
              </span>
            </button>

            <button
              onClick={stopAudio}
              disabled={!isPlaying}
              className="p-3 rounded-xl bg-[#FFF8EE] hover:bg-[#E8D6C3]/40 text-[#6B4938] hover:text-[#3B2922] border border-[#E8D6C3] transition-colors disabled:opacity-30 cursor-pointer"
              title="Stop audio generator"
            >
              <Square size={16} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 bg-[#FFF8EE] px-4 py-2.5 rounded-xl border border-[#E8D6C3]">
            <button
              onClick={toggleMute}
              className="text-[#6B4938] hover:text-[#3B2922] transition-colors cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-28 sm:w-36 accent-[#6B4938] cursor-pointer h-1.5 bg-[#E8D6C3] rounded-lg"
            />
            <span className="text-xs font-mono text-[#6B4938] w-8 text-right font-medium">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>

        {/* Current Mood Highlight Banner */}
        <div className="p-5 rounded-2xl border border-[#E8B84A]/40 bg-[#FFF8EE] flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl">{moodConfig.emoji}</span>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#3B2922]">
                {moodConfig.label} • {moodConfig.soundName}
              </h3>
              <p className="text-xs text-[#6B4938] mt-0.5">{moodConfig.soundDescription}</p>
            </div>
          </div>
          <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#6B4938] px-3 py-1 rounded-full bg-[#E8B84A]/20 border border-[#E8B84A]/40 hidden sm:block">
            Active Atmosphere
          </span>
        </div>
      </div>

      {/* The 6 Ambient Mood Environments Grid */}
      <div className="space-y-4">
        <h2 className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#6B4938]">
          Select Ambient Tone & Atmosphere
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {moodList.map((mKey) => {
            const config = MOODS_CONFIG[mKey];
            const isSelected = currentMood === mKey;

            return (
              <div
                key={mKey}
                onClick={() => {
                  setMood(mKey);
                  playMood(mKey);
                }}
                className={`p-6 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-sm ${
                  isSelected
                    ? "bg-[#FFF8EE] border-[#6B4938] ring-2 ring-[#E8B84A]/40 scale-[1.01]"
                    : "bg-[#FFFCF7] border-[#E8D6C3] hover:border-[#6B4938] hover:bg-[#FFF8EE]/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{config.emoji}</span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] font-serif uppercase tracking-wider text-[#3B2922] font-bold bg-[#E8B84A]/20 px-2 py-0.5 rounded-full border border-[#E8B84A]/40">
                      <CheckCircle2 size={12} className="text-[#3B2922]" />
                      Active
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-serif font-bold text-[#3B2922]">{config.label}</h3>
                  <p className="text-xs text-[#6B4938] font-medium mt-0.5">{config.soundName}</p>
                  <p className="text-xs text-[#6B4938] mt-2 leading-relaxed line-clamp-2">
                    {config.soundDescription}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E8D6C3] flex items-center justify-between text-[11px] text-[#6B4938]">
                  <span className="italic font-serif line-clamp-1">"{config.prompt}"</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
