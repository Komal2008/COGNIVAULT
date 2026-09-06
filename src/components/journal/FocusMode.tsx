import React, { useState, useEffect } from "react";
import {
  Target,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Save,
  CheckCircle2,
  ChevronRight,
  Mic,
  MicOff,
  Sun,
  Coffee,
  ArrowLeft,
} from "lucide-react";
import { useAtmosphere } from "../../context/AtmosphereContext";
import { useAuth } from "../../context/AuthContext";
import { voiceJournalService } from "../../lib/speechService";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { AudioVisualizer } from "../audio/AudioVisualizer";

const REFLECTION_CUES = [
  "Take a breath. What made you feel most grounded and alive today?",
  "What is one unexamined assumption you made today that might not be true?",
  "What quiet thought keeps asking for your gentle attention?",
  "What are you currently resisting or carrying unnecessarily?",
  "If you spoke to yourself with unconditional kindness right now, what would you say?",
  "What is one small truth you are ready to acknowledge?",
];

interface FocusModeProps {
  onExit?: () => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ onExit }) => {
  const { user, openAuthModal } = useAuth();
  const { isPlaying, togglePlay, isMuted, toggleMute, currentMood, moodConfig } = useAtmosphere();

  const [selectedDuration, setSelectedDuration] = useState<number>(10); // minutes
  const [secondsLeft, setSecondsLeft] = useState<number>(10 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeCueIndex, setActiveCueIndex] = useState(0);
  const [journalContent, setJournalContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  // Handle timer duration change
  const handleSelectDuration = (minutes: number) => {
    setSelectedDuration(minutes);
    setSecondsLeft(minutes * 60);
    setIsTimerRunning(false);
  };

  const handleToggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setSecondsLeft(selectedDuration * 60);
    setIsTimerRunning(false);
  };

  // Next reflection cue
  const handleNextCue = () => {
    setActiveCueIndex((prev) => (prev + 1) % REFLECTION_CUES.length);
  };

  // Voice recording
  const handleToggleVoice = () => {
    if (isRecording) {
      voiceJournalService.stopListening();
      setIsRecording(false);
    } else {
      const existingContent = journalContent.trim();
      const ok = voiceJournalService.startListening({
        onTranscriptChange: (finalText, interimText) => {
          setJournalContent([existingContent, finalText, interimText].filter(Boolean).join(" ").replace(/\s+/g, " ").trim());
        },
        onError: () => setIsRecording(false),
        onStateChange: (listening) => setIsRecording(listening),
      });
      if (!ok) setIsRecording(false);
    }
  };

  // Format seconds mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Save session to vault
  const handleSaveSession = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!journalContent.trim()) return;

    try {
      const convId = `focus_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const convRef = doc(db, "users", user.uid, "conversations", convId);

      await setDoc(convRef, {
        id: convId,
        title: `Focus Sanctuary Reflection (${formatTime(secondsLeft)} elapsed)`,
        summary: journalContent.slice(0, 250),
        mood: "focused",
        topics: ["Focus Mode", "Deep Sanctuary"],
        keyInsights: [REFLECTION_CUES[activeCueIndex]],
        actionItems: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Save initial message
      const msgRef = doc(db, "users", user.uid, "conversations", convId, "messages", `msg_${Date.now()}`);
      await setDoc(msgRef, {
        id: `msg_${Date.now()}`,
        role: "user",
        content: journalContent,
        timestamp: Date.now(),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/conversations`);
    }
  };

  return (
    <div
      className={`relative w-full max-w-4xl mx-auto rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] text-[#3B2922] transition-all p-6 sm:p-10 shadow-sm ${
        isFullscreen ? "fixed inset-4 z-50 overflow-y-auto max-w-none" : ""
      }`}
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between border-b border-[#E8D6C3] pb-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#E8D6C3]/50 text-[#3B2922] border border-[#E8D6C3]">
            <Target size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold font-serif text-[#3B2922] uppercase tracking-wider">
              Focus Sanctuary
            </h2>
            <span className="text-xs text-[#6B4938]">Distraction-free quiet reflection</span>
          </div>
        </div>

        {/* Ambient Sound & Fullscreen controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isPlaying
                ? "bg-[#6B4938] text-[#FFFCF7] border-[#6B4938]"
                : "bg-[#FFF8EE] border-[#E8D6C3] text-[#6B4938] hover:text-[#3B2922]"
            }`}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} className="text-[#E8B84A]" />}
            <span>{isPlaying ? "Pause Ambience" : "Play Ambience"}</span>
          </button>

          <button
            onClick={toggleMute}
            className="p-2.5 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] text-[#6B4938] hover:text-[#3B2922] transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] text-[#6B4938] hover:text-[#3B2922] transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Focus"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {onExit && (
            <button
              onClick={onExit}
              className="px-3 py-2 rounded-xl bg-[#FFF8EE] hover:bg-[#E8D6C3]/50 border border-[#E8D6C3] text-[#6B4938] hover:text-[#3B2922] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Exit focus mode"
            >
              <ArrowLeft size={14} />
              <span>Exit Focus</span>
            </button>
          )}
        </div>
      </div>

      {/* Ambient Timer Section */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
        <div className="font-serif text-5xl sm:text-7xl font-bold tracking-wider text-[#3B2922]">
          {formatTime(secondsLeft)}
        </div>

        {/* Duration Selectors */}
        <div className="flex items-center gap-2">
          {[5, 10, 15, 25].map((mins) => (
            <button
              key={mins}
              onClick={() => handleSelectDuration(mins)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                selectedDuration === mins
                  ? "bg-[#6B4938] text-[#FFFCF7] shadow-xs"
                  : "bg-[#FFF8EE] text-[#6B4938] hover:text-[#3B2922] border border-[#E8D6C3]"
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Timer Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleTimer}
            className={`px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer border ${
              isTimerRunning
                ? "bg-[#FFF8EE] text-[#3B2922] border-[#E8D6C3] hover:bg-[#E8D6C3]/40"
                : "bg-[#6B4938] hover:bg-[#3B2922] text-[#FFFCF7] border-[#E8B84A]/30"
            }`}
          >
            {isTimerRunning ? <Pause size={14} /> : <Play size={14} className="text-[#E8B84A]" />}
            <span>{isTimerRunning ? "Pause Timer" : "Begin Focus"}</span>
          </button>

          <button
            onClick={handleResetTimer}
            className="p-2.5 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] text-[#6B4938] hover:text-[#3B2922] transition-colors cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Audio Visualizer */}
        {isPlaying && (
          <div className="pt-2">
            <AudioVisualizer className="w-28 h-6" barCount={14} />
          </div>
        )}
      </div>

      {/* Guided Reflective Cue in Warm Paper Card */}
      <div className="p-6 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] text-center space-y-3 mb-6 relative">
        <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#6B4938] block">
          Reflective Prompt
        </span>
        <blockquote className="text-base sm:text-lg font-serif italic text-[#3B2922] leading-relaxed max-w-xl mx-auto">
          "{REFLECTION_CUES[activeCueIndex]}"
        </blockquote>

        <button
          onClick={handleNextCue}
          className="inline-flex items-center gap-1 text-xs text-[#6B4938] hover:text-[#3B2922] font-semibold transition-colors pt-1 cursor-pointer"
        >
          <span>Next reflective cue</span>
          <ChevronRight size={14} className="text-[#E8B84A]" />
        </button>
      </div>

      {/* Distraction-Free Journal Canvas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6B4938] font-serif italic">Stream of consciousness...</span>
          <button
            onClick={handleToggleVoice}
            className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isRecording
                ? "bg-[#6B4938] text-[#E8B84A] border-[#E8B84A] animate-pulse"
                : "bg-[#FFF8EE] border-[#E8D6C3] text-[#6B4938] hover:text-[#3B2922]"
            }`}
          >
            {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
            <span>{isRecording ? "Listening..." : "Dictate"}</span>
          </button>
        </div>

        <textarea
          rows={8}
          value={journalContent}
          onChange={(e) => setJournalContent(e.target.value)}
          placeholder="Let your thoughts flow freely. No formatting, no judgment..."
          className="w-full p-5 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] text-[#3B2922] text-sm placeholder-[#6B4938]/50 leading-relaxed focus:outline-none focus:border-[#6B4938] resize-none font-serif"
        />

        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="text-xs text-[#3B2922] font-medium flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#3B2922]" />
              Session saved to your private vault.
            </span>
          ) : (
            <span className="text-xs text-[#6B4938] font-mono">
              {journalContent.length} characters written
            </span>
          )}

          <button
            onClick={handleSaveSession}
            disabled={!journalContent.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFFCF7] text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-30 border border-[#E8B84A]/30"
          >
            <Save size={14} className="text-[#E8B84A]" />
            <span>Save Reflection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
