import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  FileEdit,
  ArrowRight,
  Sun,
  ShieldCheck,
  Feather,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAtmosphere } from "../../context/AtmosphereContext";
import { useGamification } from "../../context/GamificationContext";
import { voiceJournalService } from "../../lib/speechService";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { AudioVisualizer } from "../audio/AudioVisualizer";
import { Conversation } from "../../types";
import { fetchSummary } from "../../../client/services/apiService";

interface VoiceJournalViewProps {
  onStartChatWithTranscript?: (text: string) => void;
  onSaved?: () => void;
}

export const VoiceJournalView: React.FC<VoiceJournalViewProps> = ({
  onStartChatWithTranscript,
  onSaved,
}) => {
  const { user, openAuthModal } = useAuth();
  const { currentMood, moodConfig } = useAtmosphere();
  const { recordVoiceJournal } = useGamification();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [journalTitle, setJournalTitle] = useState("");
  const analysisRequestInFlightRef = useRef(false);

  const isSupported = voiceJournalService.isSupported();

  useEffect(() => () => {
    voiceJournalService.stopListening();
  }, []);

  const handleToggleRecording = () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (isRecording) {
      voiceJournalService.stopListening();
      setIsRecording(false);
    } else {
      const existingTranscript = transcript.trim();
      const started = voiceJournalService.startListening({
        onTranscriptChange: (finalText, interimText) => {
          const spokenText = [existingTranscript, finalText, interimText]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
          setTranscript(spokenText);
          setInterimTranscript(interimText);
        },
        onError: (err) => {
          setErrorMessage(err);
          setInterimTranscript("");
          setIsRecording(false);
        },
        onStateChange: (listening) => {
          setIsRecording(listening);
          if (!listening) setInterimTranscript("");
        },
      });

      if (!started) {
        setIsRecording(false);
      }
    }
  };

  const handleClear = () => {
    voiceJournalService.stopListening();
    voiceJournalService.resetTranscript();
    setTranscript("");
    setInterimTranscript("");
    setJournalTitle("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Analyze and synthesize voice journal with Gemini
  const handleAnalyzeWithGemini = async () => {
    if (analysisRequestInFlightRef.current || isAnalyzing) {
      return;
    }
    if (!transcript.trim()) {
      setErrorMessage("Please speak or write some thoughts first.");
      return;
    }

    analysisRequestInFlightRef.current = true;
    setIsAnalyzing(true);
    setErrorMessage("");

    try {
      const data = await fetchSummary({
        conversationText: transcript,
        currentMood,
      });

      if (data.title) {
        setJournalTitle(data.title);
      }
      setSuccessMessage("Gemini synthesized title and reflections.");
    } catch (err: any) {
      console.error("Gemini voice journal analysis error:", err);
      setErrorMessage(err.message || "Could not analyze transcript.");
    } finally {
      setIsAnalyzing(false);
      analysisRequestInFlightRef.current = false;
    }
  };

  // Save voice journal to Firestore
  const handleSaveToVault = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    if (!transcript.trim()) {
      setErrorMessage("Cannot save an empty reflection.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const convId = `voice_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const convRef = doc(db, "users", user.uid, "conversations", convId);

      const title = journalTitle || `Voice Reflection (${new Date().toLocaleDateString()})`;

      const convDoc: Conversation = {
        id: convId,
        title,
        summary: transcript.slice(0, 300) + (transcript.length > 300 ? "..." : ""),
        mood: currentMood,
        topics: ["Voice Journal", moodConfig.label],
        keyInsights: [],
        actionItems: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(convRef, convDoc);

      // Save initial voice message
      const msgRef = doc(db, "users", user.uid, "conversations", convId, "messages", `msg_${Date.now()}`);
      await setDoc(msgRef, {
        id: `msg_${Date.now()}`,
        role: "user",
        content: transcript,
        timestamp: Date.now(),
      });

      setSuccessMessage("Voice reflection saved securely in your private vault.");
      await recordVoiceJournal();
      setTimeout(() => setSuccessMessage(""), 4000);
      onSaved?.();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/conversations`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center max-w-lg mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D6C3]/40 border border-[#6B4938]/15 text-[#6B4938] text-xs font-semibold">
          <Sun size={13} className="text-[#E8B84A]" />
          <span>Hands-Free Spoken Scribing</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#3B2922] tracking-tight">
          Voice Journaling
        </h1>
        <p className="text-[#6B4938] text-sm leading-relaxed">
          Speak your thoughts naturally. Transcribe in real time, edit on paper-textured cards, and reflect with Gemini.
        </p>
      </div>

      {/* Main Microphone Stage Card in Warm Cocoa Sunrise */}
      <div className="relative p-8 sm:p-10 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] shadow-sm flex flex-col items-center text-center space-y-6 overflow-hidden">
        {/* Soft Organic Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#E8B84A]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Large Smooth Circular Record Button with Gentle Pulsing Glow */}
        <div className="relative">
          {isRecording && (
            <div className="absolute -inset-4 rounded-full bg-[#E8B84A]/30 animate-ping pointer-events-none"></div>
          )}
          <button
            id="voice-stage-record-btn"
            onClick={handleToggleRecording}
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-lg hover:scale-105 border-2 ${
              isRecording
                ? "bg-[#6B4938] text-[#E8B84A] border-[#E8B84A] ring-4 ring-[#E8B84A]/40"
                : "bg-[#6B4938] text-[#FFFCF7] hover:bg-[#3B2922] border-[#E8D6C3]"
            }`}
          >
            {isRecording ? <MicOff size={38} /> : <Mic size={38} className="text-[#E8B84A]" />}
            <span className="text-[11px] font-serif uppercase tracking-widest mt-2 font-bold">
              {isRecording ? "Finish" : "Speak"}
            </span>
          </button>
        </div>

        {/* State Label & Audio Visualizer */}
        <div className="space-y-2">
          <div className="text-sm font-serif font-bold text-[#3B2922]">
            {isRecording ? (
              <span className="text-[#6B4938] flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8B84A] animate-pulse"></span>
                Transcribing your thoughts...
              </span>
            ) : transcript ? (
              <span className="text-[#3B2922]">Recording paused. Review or refine your words below.</span>
            ) : (
              <span className="text-[#6B4938]">Tap the circle to begin speaking your stream of thought</span>
            )}
          </div>

          <p className="text-xs text-[#6B4938] flex items-center justify-center gap-1.5">
            <span>{moodConfig.emoji}</span>
            <span>Atmosphere: {moodConfig.soundName}</span>
          </p>

          <div className="flex justify-center pt-1">
            <AudioVisualizer className="w-36 h-7" barCount={18} />
          </div>
        </div>

        {/* Privacy Shield Note */}
        <div className="text-[11px] text-[#6B4938] max-w-sm flex items-center justify-center gap-1.5 pt-2">
          <ShieldCheck size={14} className="text-[#A8B29A]" />
          <span>Speech is converted on your local device via Web Speech API. Audio files are never stored.</span>
        </div>
      </div>

      {/* Status Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-[#A8B29A]/20 border border-[#A8B29A]/40 text-[#3B2922] text-xs flex items-center gap-2 animate-in fade-in font-medium">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-[#E8D6C3]/50 border border-[#6B4938]/30 text-[#6B4938] text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Transcription Review & Editor with Soft Paper Card Styling */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold font-serif text-[#3B2922] flex items-center gap-2">
            <FileEdit size={16} className="text-[#6B4938]" />
            <span>Spoken Thought Paper</span>
          </label>

          <button
            onClick={handleClear}
            disabled={!transcript}
            className="text-xs text-[#6B4938] hover:text-[#3B2922] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-30"
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>
        </div>

        {journalTitle && (
          <div>
            <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#6B4938] mb-1">
              Synthesized Title
            </label>
            <input
              type="text"
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] text-sm text-[#3B2922] font-semibold focus:outline-none focus:border-[#6B4938]"
            />
          </div>
        )}

        <textarea
          id="voice-transcript-textarea"
          rows={6}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={
            isSupported
              ? "Your spoken words will flow here as you speak. You can also edit and format them at any time..."
              : "Speech recognition is not active in this environment. You can comfortably write your journal entry directly here."
          }
          className="w-full p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] text-sm text-[#3B2922] placeholder-[#6B4938]/50 focus:outline-none focus:border-[#6B4938] leading-relaxed resize-none font-serif italic"
        />

        {/* Action Controls: Instant Reflection Button + Save */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleAnalyzeWithGemini}
            disabled={isAnalyzing || !transcript.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#FFF8EE] hover:bg-[#E8D6C3]/40 border border-[#E8D6C3] text-xs font-semibold text-[#3B2922] flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-40"
          >
            <Sparkles size={14} className="text-[#E8B84A]" />
            <span>{isAnalyzing ? "Synthesizing..." : "Analyze with Gemini"}</span>
          </button>

          <div className="flex items-center gap-2.5">
            {onStartChatWithTranscript && (
              <button
                onClick={() => onStartChatWithTranscript(transcript)}
                disabled={!transcript.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFFCF7] text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-40 border border-[#E8B84A]/30 group"
              >
                <span>Reflect on this with Gemini</span>
                <ArrowRight size={14} className="text-[#E8B84A] transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            <button
              id="voice-save-btn"
              onClick={handleSaveToVault}
              disabled={isSaving || !transcript.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#FFFCF7] hover:bg-[#E8D6C3]/50 border border-[#E8D6C3] text-[#3B2922] text-xs font-semibold flex items-center gap-2 shadow-2xs cursor-pointer disabled:opacity-40"
            >
              <Save size={14} className="text-[#6B4938]" />
              <span>{isSaving ? "Saving..." : "Save to Vault"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
