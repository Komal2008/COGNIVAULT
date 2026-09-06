import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Save,
  FileText,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ListTodo,
  Feather,
  Sun,
  Coffee,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Clock,
  Calendar,
  Smile,
  ShieldCheck,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../../context/AuthContext";
import { useAtmosphere } from "../../context/AtmosphereContext";
import { useGamification } from "../../context/GamificationContext";
import { Conversation, Message, MoodType } from "../../types";
import { MOODS_CONFIG } from "../../lib/audioAtmosphere";
import { voiceJournalService, geminiVoiceResponse } from "../../lib/speechService";
import { doc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { fetchReflection, fetchSummary } from "../../../client/services/apiService";

interface JournalChatProps {
  initialConversation?: Conversation | null;
  draftKey?: number;
  onSaved?: () => void;
}

type ConversationLoadState = "new" | "loading" | "ready" | "error";

function formatMessageTime(timestamp: Message["timestamp"]) {
  const date = typeof timestamp === "number" ? new Date(timestamp) : new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export const JournalChat: React.FC<JournalChatProps> = ({ initialConversation, draftKey, onSaved }) => {
  const { user, openAuthModal } = useAuth();
  const { currentMood, setMood, moodConfig } = useAtmosphere();
  const { recordReflection, recordGeminiReflection } = useGamification();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [conversationCreatedAt, setConversationCreatedAt] = useState<any>(undefined);
  const [conversationTitle, setConversationTitle] = useState("");
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [conversationLoadState, setConversationLoadState] =
    useState<ConversationLoadState>(initialConversation ? "loading" : "new");
  const [conversationLoadError, setConversationLoadError] = useState("");
  const [loadedConversationId, setLoadedConversationId] = useState<string | null>(
    initialConversation ? null : conversationId,
  );
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isFocusExpanded, setIsFocusExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Summary & Insights state
  const [summaryData, setSummaryData] = useState<{
    title: string;
    summary: string;
    mood: MoodType;
    topics: string[];
    keyInsights: string[];
    actionItems: { id: string; text: string; completed: boolean }[];
  } | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const reflectionRequestInFlightRef = useRef(false);
  const summaryRequestInFlightRef = useRef(false);
  const autoReflectionStartedRef = useRef<string | null>(null);

  // Socratic suggestion chips for gentle prompting
  const socraticSuggestions = [
    "What thought has felt heaviest today?",
    "What assumption might I be making?",
    "What would gentle progress look like here?",
    "What can wait until tomorrow?",
  ];

  // Initialize a draft or hydrate the selected saved conversation without
  // clearing the current chat while the Firestore read is in flight.
  useEffect(() => {
    let cancelled = false;
    setInputText("");
    setErrorMessage("");
    setSaveSuccessMsg("");
    setHasSavedSession(Boolean(initialConversation));
    setConversationTitle(initialConversation?.title || "");
    setConversationLoadError("");

    if (!initialConversation) {
      setConversationLoadState("new");
      setLoadedConversationId(null);
      setConversationCreatedAt(undefined);
      const newId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setConversationId(newId);
      setSummaryData(null);
      const introMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        role: "model",
        content: `Welcome to your private reflection notebook. Take a slow breath, let your shoulders drop, and write whatever is present for you right now. You are safe here.`,
        timestamp: Date.now(),
      };
      setMessages([introMessage]);
      return () => {
        cancelled = true;
      };
    }

    setConversationId(initialConversation.id);
    setLoadedConversationId(null);
    setConversationCreatedAt(initialConversation.createdAt);
    setConversationLoadState("loading");
    if (initialConversation.mood) setMood(initialConversation.mood);
    if (initialConversation.summary) {
      setSummaryData({
        title: initialConversation.title,
        summary: initialConversation.summary,
        mood: initialConversation.mood,
        topics: initialConversation.topics || [],
        keyInsights: initialConversation.keyInsights || [],
        actionItems: initialConversation.actionItems || [],
      });
    } else {
      setSummaryData(null);
    }

    const hydrateMessages = async () => {
      if (!user) throw new Error("Authentication is required to load this conversation.");

      let loadedMessages = initialConversation.messages || [];
      if (!loadedMessages.length) {
        const messagesRef = collection(
          db,
          "users",
          user.uid,
          "conversations",
          initialConversation.id,
          "messages",
        );
        loadedMessages = (await getDocs(messagesRef)).docs.map(
          (messageDoc) => messageDoc.data() as Message,
        );
      }

      loadedMessages.sort((left, right) => {
        const leftTime = typeof left.timestamp === "number" ? left.timestamp : 0;
        const rightTime = typeof right.timestamp === "number" ? right.timestamp : 0;
        return leftTime - rightTime;
      });
      if (!cancelled) {
        setMessages(loadedMessages);
        setLoadedConversationId(initialConversation.id);
        setConversationLoadState("ready");
      }
    };

    hydrateMessages().catch((error) => {
      if (!cancelled) {
        console.error("Conversation load error:", error);
        setConversationLoadError("Unable to load this saved conversation. Please try again.");
        setConversationLoadState("error");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [initialConversation?.id, draftKey, user?.uid, setMood]);

  const isLoadingSelectedConversation =
    Boolean(initialConversation) &&
    (conversationLoadState === "loading" || loadedConversationId !== initialConversation?.id);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Word count & Character count calculation
  const totalWords = messages
    .filter((m) => m.role === "user")
    .reduce((sum, m) => sum + (m.content.trim() ? m.content.trim().split(/\s+/).length : 0), 0) +
    (inputText.trim() ? inputText.trim().split(/\s+/).length : 0);

  const totalChars = messages
    .filter((m) => m.role === "user")
    .reduce((sum, m) => sum + m.content.length, 0) + inputText.length;

  // Formatted date stamp
  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const conversationDate = conversationCreatedAt?.toDate
    ? conversationCreatedAt.toDate()
    : conversationCreatedAt
      ? new Date(conversationCreatedAt)
      : new Date();
  const displayedDate = conversationDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Handle Speech Recognition toggle
  const toggleRecording = () => {
    if (isRecording) {
      voiceJournalService.stopListening();
      setIsRecording(false);
    } else {
      setErrorMessage("");
      const existingInput = inputText.trim();
      const success = voiceJournalService.startListening({
        onTranscriptChange: (finalText, interimText) => {
          setInputText([existingInput, finalText, interimText].filter(Boolean).join(" ").replace(/\s+/g, " ").trim());
        },
        onError: (err) => {
          setErrorMessage(err);
          setIsRecording(false);
        },
        onStateChange: (listening) => {
          setIsRecording(listening);
        },
      });
      if (!success) {
        setIsRecording(false);
      }
    }
  };

  // Copy message to clipboard
  const handleCopyMessage = async (msgId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(msgId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.warn("Clipboard copy error:", err);
    }
  };

  const persistConversation = async (nextMessages: Message[]) => {
    if (!user || !conversationId || !nextMessages.length) return;

    const convRef = doc(db, "users", user.uid, "conversations", conversationId);
    const title =
      conversationTitle ||
      summaryData?.title ||
      nextMessages.find((message) => message.role === "user")?.content.slice(0, 50) ||
      "Morning Reflection Notebook";
    const conversationData: Record<string, unknown> = {
      id: conversationId,
      title,
      summary: summaryData?.summary || "",
      mood: summaryData?.mood || currentMood,
      topics: summaryData?.topics || [moodConfig.label, "Reflection"],
      keyInsights: summaryData?.keyInsights || [],
      actionItems: summaryData?.actionItems || [],
      updatedAt: serverTimestamp(),
    };

    if (conversationCreatedAt) {
      conversationData.createdAt = conversationCreatedAt;
    } else if (!hasSavedSession) {
      conversationData.createdAt = serverTimestamp();
    }

    const batchWrites = [
      setDoc(convRef, conversationData, { merge: true }),
      ...nextMessages.map((message) =>
        setDoc(
          doc(db, "users", user.uid, "conversations", conversationId, "messages", message.id),
          {
            id: message.id,
            role: message.role,
            content: message.content,
            timestamp: message.timestamp,
          },
          { merge: true },
        ),
      ),
    ];
    await Promise.all(batchWrites);
    setHasSavedSession(true);
  };

  // Send message to Gemini server-side endpoint via apiService
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (
      !textToSend ||
      reflectionRequestInFlightRef.current ||
      isLoading ||
      isLoadingSelectedConversation ||
      conversationLoadState === "error"
    ) return;

    if (isRecording) {
      voiceJournalService.stopListening();
      setIsRecording(false);
    }

    setInputText("");
    setErrorMessage("");
    reflectionRequestInFlightRef.current = true;

    const userMessage: Message = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build server-side history payload
      const historyPayload = messages
        .filter((m) => m.role === "user" || m.role === "model")
        .slice(-14)
        .map((m) => ({ role: m.role, content: m.content }));

      const data = await fetchReflection({
        message: textToSend,
        mood: currentMood,
        history: historyPayload,
      });

      const modelMessage: Message = {
        id: `msg_model_${Date.now()}`,
        role: "model",
        content: data.reply,
        timestamp: Date.now(),
      };

      const completedMessages = [...newMessages, modelMessage];
      setMessages(completedMessages);
      try {
        await persistConversation(completedMessages);
      } catch (persistError) {
        console.error("Conversation auto-save error:", persistError);
        setErrorMessage("Your response was generated, but could not be saved yet.");
      }
      await recordGeminiReflection();
    } catch (err: any) {
      console.error("Reflection error:", err);
      setErrorMessage(err.message || "Unable to reach reflection companion. Please try again.");
    } finally {
      setIsLoading(false);
      reflectionRequestInFlightRef.current = false;
    }
  };

  useEffect(() => {
    const autoReflectText = initialConversation?.autoReflectText?.trim();
    if (
      !autoReflectText ||
      !initialConversation?.id ||
      autoReflectionStartedRef.current === initialConversation.id ||
      isLoadingSelectedConversation ||
      conversationLoadState !== "ready"
    ) {
      return;
    }

    autoReflectionStartedRef.current = initialConversation.id;
    void handleSendMessage(autoReflectText);
  }, [
    conversationLoadState,
    initialConversation?.autoReflectText,
    initialConversation?.id,
    isLoadingSelectedConversation,
  ]);

  // Text-to-Speech playback for Gemini response
  const handleToggleSpeak = (messageId: string, content: string) => {
    if (speakingMessageId === messageId) {
      if (isSpeechPaused) {
        geminiVoiceResponse.resume();
        setIsSpeechPaused(false);
      } else {
        geminiVoiceResponse.pause();
        setIsSpeechPaused(true);
      }
    } else {
      geminiVoiceResponse.stop();
      setSpeakingMessageId(messageId);
      setIsSpeechPaused(false);

      geminiVoiceResponse.speak(
        content,
        () => {
          setSpeakingMessageId(messageId);
          setIsSpeechPaused(false);
        },
        () => {
          setSpeakingMessageId(null);
          setIsSpeechPaused(false);
        },
        (err) => {
          console.error("Speech playback error:", err);
          setSpeakingMessageId(null);
        }
      );
    }
  };

  const handleStopSpeech = () => {
    geminiVoiceResponse.stop();
    setSpeakingMessageId(null);
    setIsSpeechPaused(false);
  };

  // Trigger AI summary extraction
  const handleGenerateSummary = async () => {
    if (summaryRequestInFlightRef.current || isSummarizing || messages.length < 2) {
      if (messages.length < 2) {
        setErrorMessage("Please share at least one reflection before generating a summary.");
      }
      return;
    }

    summaryRequestInFlightRef.current = true;
    setIsSummarizing(true);
    setErrorMessage("");

    try {
      const fullText = messages
        .map((m) => `${m.role === "user" ? "Me" : "Companion"}: ${m.content}`)
        .join("\n\n");

      const data = await fetchSummary({
        conversationText: fullText,
        currentMood,
      });

      const formattedActions = (data.actionItems || []).map((item: any, idx: number) => ({
        id: `act_${Date.now()}_${idx}`,
        text: item.text || String(item),
        completed: false,
      }));

      setSummaryData({
        title: data.title || "Reflective Journal Entry",
        summary: data.summary || "",
        mood: data.mood || currentMood,
        topics: data.topics || [],
        keyInsights: data.keyInsights || [],
        actionItems: formattedActions,
      });

      if (data.mood && data.mood !== currentMood) {
        setMood(data.mood);
      }
    } catch (err: any) {
      console.error("Summary error:", err);
      setErrorMessage(err.message || "Could not synthesize reflection summary.");
    } finally {
      setIsSummarizing(false);
      summaryRequestInFlightRef.current = false;
    }
  };

  // Save session to Firestore
  const handleSaveToVault = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    if (
      messages.length === 0 ||
      isLoadingSelectedConversation ||
      conversationLoadState === "error"
    ) return;

    setIsSaving(true);
    try {
      setSaveSuccessMsg("");
      await persistConversation(messages);

      setSaveSuccessMsg("Reflection preserved securely in your private vault ✓");
      await recordReflection();
      setTimeout(() => setSaveSuccessMsg(""), 4000);
      onSaved?.();
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `users/${user.uid}/conversations/${conversationId}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`flex flex-col transition-all duration-300 mx-auto bg-[#FFFCF7] border border-[#E8D6C3] rounded-3xl overflow-hidden shadow-sm relative ${
        isFocusExpanded
          ? "fixed inset-2 sm:inset-6 z-40 h-[calc(100vh-3rem)] max-w-none shadow-2xl"
          : "h-[calc(100vh-9.5rem)] max-w-4xl"
      }`}
    >
      {/* 8. DIGITAL NOTEBOOK TOP BAR */}
      <div className="px-6 py-3.5 bg-[#FFF8EE] border-b border-[#E8D6C3] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#E8B84A]/20 border border-[#E8B84A]/50 flex items-center justify-center text-lg shrink-0">
            {moodConfig.emoji}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold font-serif text-[#3B2922] truncate">
                {conversationTitle || summaryData?.title || "Digital Reflection Notebook"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#E8D6C3]/40 text-[10px] font-medium text-[#6B4938] shrink-0">
                {moodConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#6B4938] font-mono">
              <span className="flex items-center gap-1">
                <Calendar size={11} className="text-[#6B4938]" />
                {displayedDate || todayFormatted}
              </span>
              <span>•</span>
              <span>{totalWords} words</span>
              <span className="hidden sm:inline">• {totalChars} chars</span>
            </div>
          </div>
        </div>

        {/* Notebook Controls */}
        <div className="flex items-center gap-2">
          <button
            id="expand-focus-btn"
            onClick={() => setIsFocusExpanded(!isFocusExpanded)}
            className="p-2 rounded-xl bg-[#FFFCF7] hover:bg-[#E8D6C3]/50 border border-[#E8D6C3] text-[#6B4938] hover:text-[#3B2922] transition-colors cursor-pointer"
            title={isFocusExpanded ? "Exit Fullscreen Focus" : "Expand Focus Notebook"}
          >
            {isFocusExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          <button
            id="generate-summary-btn"
            onClick={handleGenerateSummary}
            disabled={isSummarizing || messages.length < 2}
            className="px-3.5 py-2 rounded-xl bg-[#FFFCF7] hover:bg-[#E8D6C3]/50 border border-[#E8D6C3] text-xs font-semibold text-[#3B2922] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shadow-2xs"
            title="Synthesize AI structured summary and action items"
          >
            <Sparkles size={13} className="text-[#E8B84A]" />
            <span>{isSummarizing ? "Synthesizing..." : "Summarize"}</span>
          </button>

          <button
            id="save-vault-btn"
            onClick={handleSaveToVault}
            disabled={
              isSaving ||
              isLoadingSelectedConversation ||
              conversationLoadState === "error"
            }
            className="px-4 py-2 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFFCF7] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer border border-[#E8B84A]/30 disabled:opacity-50"
            title="Save reflection into private Firestore vault"
          >
            <Save size={13} className="text-[#E8B84A]" />
            <span>{isSaving ? "Saving..." : "Save to Vault"}</span>
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {saveSuccessMsg && (
        <div className="px-5 py-2.5 bg-[#A8B29A]/25 border-b border-[#A8B29A]/40 text-[#3B2922] text-xs flex items-center gap-2 animate-in fade-in font-medium">
          <CheckCircle2 size={15} className="text-[#3B2922] shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {errorMessage && (
        <div className="px-5 py-2.5 bg-[#E8D6C3]/40 border-b border-[#6B4938]/30 text-[#6B4938] text-xs flex items-center gap-2">
          <AlertCircle size={15} className="text-[#6B4938] shrink-0" />
          <span className="line-clamp-1">{errorMessage}</span>
        </div>
      )}

      {/* Structured Summary Drawer if synthesized */}
      {summaryData && (
        <div className="p-5 bg-[#FFF8EE] border-b border-[#E8D6C3] text-[#3B2922] text-xs space-y-3 max-h-56 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="font-bold font-serif text-[#3B2922] flex items-center gap-1.5 text-sm">
              <FileText size={15} className="text-[#6B4938]" />
              Structured Reflection Summary
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E8B84A]/20 border border-[#E8B84A]/40 text-[10px] font-semibold text-[#6B4938] uppercase tracking-wide">
              Mood: {summaryData.mood}
            </span>
          </div>

          <p className="text-[#6B4938] leading-relaxed font-serif italic text-sm">
            "{summaryData.summary}"
          </p>

          {summaryData.keyInsights && summaryData.keyInsights.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B2922] flex items-center gap-1.5">
                <Lightbulb size={13} className="text-[#E8B84A]" />
                Key Realizations
              </span>
              <ul className="list-disc list-inside space-y-1 text-[#6B4938]">
                {summaryData.keyInsights.map((insight, idx) => (
                  <li key={idx} className="line-clamp-2">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summaryData.actionItems && summaryData.actionItems.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B2922] flex items-center gap-1.5">
                <ListTodo size={13} className="text-[#6B4938]" />
                Action Steps for Clarity
              </span>
              <div className="flex flex-wrap gap-2">
                {summaryData.actionItems.map((act) => (
                  <span
                    key={act.id}
                    className="px-2.5 py-1 rounded-lg bg-[#FFFCF7] border border-[#E8D6C3] text-[11px] text-[#3B2922] font-medium shadow-2xs"
                  >
                    ✓ {act.text}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. NOTEBOOK CANVAS WITH SUBTLE PAPER TEXTURE & MARGIN */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#FFFCF7] relative">
        {/* Delicate Left Red Margin Rule of a classic notebook */}
        <div className="absolute top-0 bottom-0 left-6 sm:left-10 w-px bg-[#E8D6C3]/60 pointer-events-none" />

        <div className="pl-4 sm:pl-8 space-y-6">
          {isLoadingSelectedConversation && (
            <div className="min-h-48 flex items-center justify-center">
              <div className="px-5 py-3 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] text-xs text-[#6B4938] flex items-center gap-2 shadow-2xs">
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8B84A] animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8B84A] animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8B84A] animate-pulse [animation-delay:300ms]" />
                </span>
                <span className="italic font-serif">Loading reflection...</span>
              </div>
            </div>
          )}

          {conversationLoadState === "error" && (
            <div className="min-h-48 flex items-center justify-center">
              <div className="max-w-sm px-5 py-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] text-xs text-[#6B4938] text-center shadow-2xs">
                <AlertCircle size={18} className="mx-auto mb-2 text-[#6B4938]" />
                <p>{conversationLoadError}</p>
              </div>
            </div>
          )}

          {!isLoadingSelectedConversation && conversationLoadState === "ready" && messages.length === 0 && (
            <div className="min-h-48 flex items-center justify-center text-xs text-[#6B4938] italic font-serif">
              This saved reflection has no messages yet.
            </div>
          )}

          {!isLoadingSelectedConversation &&
            conversationLoadState !== "error" &&
            messages.map((msg) => {
            const isUser = msg.role === "user";
            const isSpeakingThis = speakingMessageId === msg.id;
            const isCopied = copiedMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"} group/msg`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#6B4938]">
                    {isUser ? "You" : "Cognivault Companion"}
                  </span>

                  {/* Actions for messages */}
                  <div className="flex items-center gap-1 opacity-80 group-hover/msg:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="p-1 rounded-md text-[#6B4938]/60 hover:text-[#3B2922] hover:bg-[#E8D6C3]/40 transition-colors"
                      title="Copy text"
                    >
                      {isCopied ? <Check size={11} className="text-[#A8B29A]" /> : <Copy size={11} />}
                    </button>

                    {!isUser && (
                      <>
                        <button
                          onClick={() => handleToggleSpeak(msg.id, msg.content)}
                          className={`p-1 rounded-md transition-colors ${
                            isSpeakingThis
                              ? "bg-[#6B4938] text-[#FFFCF7]"
                              : "text-[#6B4938]/60 hover:text-[#3B2922] hover:bg-[#E8D6C3]/40"
                          }`}
                          title={
                            isSpeakingThis
                              ? isSpeechPaused
                                ? "Resume Voice"
                                : "Pause Voice"
                              : "Listen to Response"
                          }
                        >
                          {isSpeakingThis ? (
                            isSpeechPaused ? (
                              <Play size={11} />
                            ) : (
                              <Pause size={11} />
                            )
                          ) : (
                            <Volume2 size={11} />
                          )}
                        </button>

                        {isSpeakingThis && (
                          <button
                            onClick={handleStopSpeech}
                            className="p-1 rounded-md text-[#6B4938]/60 hover:text-[#3B2922] hover:bg-[#E8D6C3]/40"
                            title="Stop Voice"
                          >
                            <Square size={11} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div
                  className={`max-w-[92%] sm:max-w-[82%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? "bg-[#6B4938] text-[#FFFCF7] rounded-tr-xs shadow-2xs whitespace-pre-wrap font-normal"
                      : "bg-[#FFF8EE] text-[#3B2922] border border-[#E8D6C3] rounded-tl-xs shadow-2xs"
                  }`}
                >
                  {isUser ? (
                    msg.content
                  ) : (
                    <div>
                      <div className="inline-flex items-center gap-1.5 mb-2.5">
                        <span className="bg-[#E8B84A]/30 text-[#6B4938] text-[9px] font-bold px-2 py-0.5 rounded-md border border-[#E8B84A]/50">
                          SOCRATIC COMPANION
                        </span>
                      </div>
                      <div className="prose prose-stone text-xs sm:text-sm max-w-none space-y-2 text-[#3B2922] leading-relaxed">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
                <span className="mt-1 px-1 text-[9px] text-[#6B4938]/60 font-mono">
                  {formatMessageTime(msg.timestamp)}
                </span>
              </div>
            );
          })}

          {/* 10. TYPING INDICATOR WITH PULSING DOTS */}
          {isLoading && (
            <div className="flex flex-col items-start pl-1">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#6B4938] mb-1">
                Cognivault Companion
              </span>
              <div className="px-5 py-3 rounded-2xl rounded-tl-xs bg-[#FFF8EE] border border-[#E8D6C3] text-xs text-[#6B4938] flex items-center gap-2 shadow-2xs">
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8B84A] animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8B84A] animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8B84A] animate-bounce"></span>
                </span>
                <span className="italic font-serif">Pondering with care...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* 8. SOCRATIC PROMPTS SUGGESTION CHIPS */}
      <div className="px-4 sm:px-6 py-2 bg-[#FFFCF7] border-t border-[#E8D6C3]/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-serif font-bold uppercase text-[#6B4938] shrink-0 flex items-center gap-1">
          <Feather size={12} />
          Suggestions:
        </span>
        {socraticSuggestions.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={
              isLoading ||
              isLoadingSelectedConversation ||
              (conversationLoadState !== "ready" && conversationLoadState !== "new")
            }
            className="px-3 py-1 rounded-full bg-[#FFF8EE] hover:bg-[#E8D6C3]/40 border border-[#E8D6C3] text-[11px] text-[#6B4938] hover:text-[#3B2922] whitespace-nowrap cursor-pointer transition-colors shadow-2xs disabled:opacity-40"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form Bar in Warm Cocoa Sunrise */}
      <div className="p-4 bg-[#FFF8EE] border-t border-[#E8D6C3]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2.5"
        >
          {/* Voice Input Button */}
          <button
            id="chat-mic-btn"
            type="button"
            onClick={toggleRecording}
            disabled={isLoadingSelectedConversation || conversationLoadState === "error"}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              isRecording
                ? "bg-[#6B4938] border-[#E8B84A] text-[#E8B84A] animate-pulse ring-2 ring-[#E8B84A]/60"
                : "bg-[#FFFCF7] border-[#E8D6C3] text-[#6B4938] hover:text-[#3B2922] hover:bg-[#E8D6C3]/40"
            }`}
            title={isRecording ? "Stop voice dictation" : "Dictate via microphone"}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Text Area with Notebook Ruled Styling */}
          <div className="flex-1 relative">
            <textarea
              id="chat-input-textarea"
              rows={2}
              value={inputText}
              disabled={isLoadingSelectedConversation || conversationLoadState === "error"}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isRecording
                  ? "Listening to your voice... Speak freely..."
                  : `Reflect freely... (${moodConfig.prompt})`
              }
              className="w-full px-4 py-2.5 rounded-xl bg-[#FFFCF7] border border-[#E8D6C3] text-[#3B2922] placeholder-[#6B4938]/50 text-sm focus:outline-none focus:border-[#6B4938] focus:ring-1 focus:ring-[#6B4938] resize-none transition-colors shadow-2xs font-sans"
            />
          </div>

          {/* Send Button */}
          <button
            id="chat-send-btn"
            type="submit"
            disabled={
              !inputText.trim() ||
              isLoading ||
              isLoadingSelectedConversation ||
              conversationLoadState === "error"
            }
            className="p-3 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFFCF7] transition-all shadow-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border border-[#E8B84A]/30 hover:border-[#E8B84A]"
            title="Send Reflection"
          >
            <Send size={18} className="text-[#E8B84A]" />
          </button>
        </form>
      </div>
    </div>
  );
};
