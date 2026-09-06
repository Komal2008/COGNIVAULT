import React, { useEffect, useState } from "react";
import {
  Sparkles,
  BookOpen,
  BrainCircuit,
  Mic,
  Target,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Calendar,
  Lock,
  Sun,
  Coffee,
  Check,
  TrendingUp,
  Flame,
  Feather,
  RefreshCw,
  ListTodo,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAtmosphere } from "../../context/AtmosphereContext";
import { Conversation, MoodType, ViewTab } from "../../types";
import { MOODS_CONFIG } from "../../lib/audioAtmosphere";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { fetchDailyPrompt } from "../../../client/services/apiService";
import { JourneySummaryBar } from "../gamification/JourneySummaryBar";
import { TodayQuestCard } from "../gamification/TodayQuestCard";
import { JourneyMapModal } from "../gamification/JourneyMapModal";

interface VaultDashboardProps {
  onNavigate: (tab: ViewTab) => void;
  onOpenConversation: (conv: Conversation) => void;
  onStartReflectionWithPrompt?: (prompt: string) => void;
}

export const VaultDashboard: React.FC<VaultDashboardProps> = ({
  onNavigate,
  onOpenConversation,
  onStartReflectionWithPrompt,
}) => {
  const { user, openAuthModal } = useAuth();
  const { currentMood, setMood, moodConfig } = useAtmosphere();
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);

  // Today's Reflection Prompt State
  const [dailyPrompt, setDailyPrompt] = useState<string>(
    "What thought has been taking up most of your quiet attention lately?"
  );
  const [dailyPromptTheme, setDailyPromptTheme] = useState<string>("Inner Clarity");
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  // Time of day greeting
  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  const timeOfDay = getGreetingTime();
  const firstName = user?.displayName ? user.displayName.trim().split(" ")[0] : null;

  // Real-time Firestore subscription for user's recent conversations
  useEffect(() => {
    if (!user) {
      setRecentConversations([]);
      setLoadingEntries(false);
      return;
    }

    setLoadingEntries(true);
    const convsRef = collection(db, "users", user.uid, "conversations");
    const q = query(convsRef, orderBy("createdAt", "desc"), limit(10));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const convs: Conversation[] = [];
        snapshot.forEach((doc) => {
          convs.push(doc.data() as Conversation);
        });
        setRecentConversations(convs);
        setLoadingEntries(false);
      },
      (error) => {
        console.error("Error loading conversations:", error);
        setLoadingEntries(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Load Today's Reflection prompt from Gemini
  useEffect(() => {
    let isMounted = true;

    async function loadPrompt() {
      setLoadingPrompt(true);
      try {
        const historySnippet = recentConversations
          .slice(0, 3)
          .map((c) => c.title + ": " + (c.summary || ""))
          .join(" | ");

        const res = await fetchDailyPrompt({
          mood: currentMood,
          userHistorySummary: historySnippet,
        });

        if (isMounted && res && res.prompt) {
          setDailyPrompt(res.prompt);
          if (res.theme) setDailyPromptTheme(res.theme);
        }
      } catch (err) {
        console.warn("Could not load fresh Gemini prompt:", err);
      } finally {
        if (isMounted) setLoadingPrompt(false);
      }
    }

    loadPrompt();

    return () => {
      isMounted = false;
    };
  }, [currentMood, user]);

  const handleRefreshPrompt = async () => {
    setLoadingPrompt(true);
    try {
      const historySnippet = recentConversations
        .slice(0, 3)
        .map((c) => c.title)
        .join(" | ");

      const res = await fetchDailyPrompt({
        mood: currentMood,
        userHistorySummary: historySnippet,
      });

      if (res && res.prompt) {
        setDailyPrompt(res.prompt);
        if (res.theme) setDailyPromptTheme(res.theme);
      }
    } catch (err) {
      console.warn("Refresh prompt error:", err);
    } finally {
      setLoadingPrompt(false);
    }
  };

  // Animated stat number counting upward on load
  useEffect(() => {
    const target = recentConversations.length;
    let start = 0;
    const duration = 600;
    const stepTime = 30;
    const increment = Math.max(1, Math.ceil(target / (duration / stepTime)));

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setAnimatedCount(target);
        clearInterval(timer);
      } else {
        setAnimatedCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [recentConversations.length]);

  const moodsList: MoodType[] = ["happy", "calm", "reflective", "stressed", "curious", "focused"];

  // Aggregate pending action items and total insights
  const pendingActionItems = recentConversations.flatMap((c) =>
    (c.actionItems || []).filter((item) => !item.completed)
  );

  const totalInsightsCount = recentConversations.reduce(
    (acc, c) => acc + (c.keyInsights?.length || 0),
    0
  );

  // Timeline entries from user's conversations
  const timelineEntries = recentConversations.slice(0, 6).map((c) => {
    let dateStr = "Recent";
    if (c.createdAt?.toDate) {
      dateStr = c.createdAt.toDate().toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
      });
    } else if (c.createdAt instanceof Date) {
      dateStr = c.createdAt.toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
      });
    }
    const moodMeta = MOODS_CONFIG[c.mood] || MOODS_CONFIG.reflective;
    return {
      id: c.id,
      title: c.title,
      date: dateStr,
      emoji: moodMeta.emoji,
      moodLabel: moodMeta.label,
      mood: c.mood,
    };
  });

  const [orbOffset, setOrbOffset] = useState({ x: 0, y: 0 });

  const handleHeroPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setOrbOffset({
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 10,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 8,
    });
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      {/* 1. PERSONALIZED DASHBOARD GREETING */}
      <section
        className="cv-hero relative overflow-hidden rounded-3xl bg-[#0F3D34] border border-[#134E43] p-6 sm:p-10 shadow-lg"
        onPointerMove={handleHeroPointerMove}
        onPointerLeave={() => setOrbOffset({ x: 0, y: 0 })}
      >
        {/* Soft Organic Morning Sunbeam Glow */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-[#C8A96A]/15 rounded-full blur-3xl pointer-events-none animate-sun-glow" />
        <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-[#134E43]/80 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E6F0E9]/10 border border-[#C8A96A]/35 text-[#E6F0E9] text-xs font-medium tracking-wide">
            <Sun size={14} className="text-[#C8A96A]" />
            <span>Private reflection sanctuary</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-medium text-[#E6F0E9] tracking-tight">
            {firstName ? (
              <>
                Good {timeOfDay},{" "}
                <span className="italic font-serif text-[#C8A96A]">{firstName}</span>
              </>
            ) : (
              <>Good {timeOfDay}, Thinker.</>
            )}
          </h1>

          <p className="text-base sm:text-lg text-[#E6F0E9]/80 leading-relaxed font-normal">
            What deserves a little space in your mind today?
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              id="start-reflection-cta-btn"
              onClick={() => {
                if (onStartReflectionWithPrompt) {
                  onStartReflectionWithPrompt(dailyPrompt);
                } else {
                  onNavigate("new-journal");
                }
              }}
              className="px-6 py-3 rounded-xl bg-[#C8A96A] hover:bg-[#D5BA83] text-[#0F3D34] text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border border-[#C8A96A]/30 group"
            >
              <span className="text-[#C8A96A] font-bold">+</span>
              <span>Start a Reflection</span>
              <ArrowRight size={16} className="text-[#0F3D34] transition-transform group-hover:translate-x-1" />
            </button>

            <button
              id="voice-journal-cta-btn"
              onClick={() => onNavigate("voice-journal")}
              className="px-5 py-3 rounded-xl bg-transparent hover:bg-[#E6F0E9]/10 border border-[#E6F0E9]/30 text-[#E6F0E9] text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <Mic size={16} className="text-[#C8A96A]" />
              <span>Voice Journal</span>
            </button>
          </div>
        </div>

        <div
        className="cv-reflection-orb absolute right-6 top-1/2 hidden h-64 w-64 -translate-y-1/2 lg:block"
        style={{ transform: `translate(${orbOffset.x}px, calc(-50% + ${orbOffset.y}px))` }}
        aria-hidden="true"
        >
        <div className="cv-orb-ring cv-orb-ring-one" />
        <div className="cv-orb-ring cv-orb-ring-two" />
        <div className="cv-orb-ring cv-orb-ring-three" />
        <div className="cv-orb-core">
          <div className="cv-orb-inner" />
        </div>
        <span className="cv-orb-spark cv-orb-spark-one">✦</span>
        <span className="cv-orb-spark cv-orb-spark-two">✧</span>
        <span className="cv-orb-spark cv-orb-spark-three">·</span>
        <span className="cv-orb-particle cv-orb-particle-one" />
        <span className="cv-orb-particle cv-orb-particle-two" />
        <span className="cv-orb-particle cv-orb-particle-three" />
        </div>
      </section>

      {/* DASHBOARD GAMIFICATION — YOUR JOURNEY */}
      <section>
        <JourneySummaryBar
          onNavigateJourney={() => onNavigate("journey")}
          onOpenJourneyModal={() => setIsJourneyModalOpen(true)}
        />
      </section>

      {/* 2. MOOD AS THE CORE EXPERIENCE */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-serif font-bold uppercase tracking-wider text-[#6B4938]">
              How does your mind feel right now?
            </h2>
            <p className="text-[11px] text-[#6B4938]/80 mt-0.5">
              Select your current headspace to tune the visual and audio atmosphere
            </p>
          </div>
          <span className="text-xs text-[#6B4938] hidden sm:flex items-center gap-1.5 font-medium">
            <span>{moodConfig.emoji}</span>
            <span className="font-semibold text-[#3B2922]">{moodConfig.label}</span>
            <span className="text-[11px] text-[#6B4938]/70">({moodConfig.visualAtmosphere})</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {moodsList.map((moodKey) => {
            const config = MOODS_CONFIG[moodKey];
            const isSelected = currentMood === moodKey;
            return (
              <button
                key={moodKey}
                id={`mood-btn-${moodKey}`}
                onClick={() => setMood(moodKey)}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                  isSelected
                    ? "bg-[#F7F1E7] border-[#E8B84A] shadow-md ring-2 ring-[#E8B84A]/45 scale-[1.02]"
                    : "bg-[#FFFCF7]/90 border-[#E8D6C3] hover:border-[#E8B84A]/70 hover:bg-[#FFFCF7] hover:-translate-y-0.5"
                }`}
              >
                {/* Active Indicator Top Strip */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#E8B84A]" />
                )}

                <div className="text-2xl mb-2 transition-transform group-hover:scale-110 duration-200">
                  {config.emoji}
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold font-serif text-[#3B2922] flex items-center justify-between">
                    <span>{config.label}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#E8B84A]" />}
                  </div>
                  <div className="text-[11px] text-[#6B4938] font-medium leading-tight">
                    {config.shortDescription}
                  </div>
                  <div className="text-[9px] text-[#6B4938]/70 line-clamp-1 italic pt-0.5">
                    {config.visualAtmosphere}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. TODAY'S REFLECTION CARD */}
      <section className="rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8B84A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E8B84A]/20 border border-[#E8B84A]/40 text-[10px] font-bold font-serif uppercase tracking-wider text-[#6B4938] flex items-center gap-1">
                <Sparkles size={12} className="text-[#E8B84A]" />
                Today's Reflection
              </span>
              <span className="text-[11px] text-[#6B4938]/70 font-medium">
                • {dailyPromptTheme}
              </span>
            </div>

            <blockquote className="text-lg sm:text-xl font-serif italic text-[#3B2922] leading-relaxed">
              "{dailyPrompt}"
            </blockquote>

            <p className="text-xs text-[#6B4938] font-normal">
              A contemplative anchor generated to expand your perspective.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRefreshPrompt}
              disabled={loadingPrompt}
              className="p-3 rounded-xl bg-[#FFF8EE] hover:bg-[#E8D6C3]/40 border border-[#E8D6C3] text-[#6B4938] hover:text-[#3B2922] transition-colors cursor-pointer disabled:opacity-40"
              title="Generate alternate reflection prompt"
            >
              <RefreshCw size={15} className={loadingPrompt ? "animate-spin" : ""} />
            </button>

            <button
              id="begin-reflection-btn"
              onClick={() => {
                if (onStartReflectionWithPrompt) {
                  onStartReflectionWithPrompt(dailyPrompt);
                } else {
                  onNavigate("new-journal");
                }
              }}
              className="px-5 py-3 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFFCF7] text-xs font-semibold flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer border border-[#E8B84A]/30 group"
            >
              <span>Begin Reflection</span>
              <ArrowRight size={14} className="text-[#E8B84A] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* TODAY'S REFLECTION QUEST */}
      <section>
        <TodayQuestCard
          onStartQuestPrompt={(promptText) => {
            if (onStartReflectionWithPrompt) {
              onStartReflectionWithPrompt(promptText);
            } else {
              onNavigate("new-journal");
            }
          }}
        />
      </section>

      {/* 7. REFLECTION JOURNEY & STATS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-serif font-bold uppercase tracking-wider text-[#6B4938]">
            Your Reflection Journey
          </h2>
          <span className="text-xs text-[#6B4938] font-medium">
            {user ? "Private Vault Sync Active" : "Guest Mode • Sign in to persist"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stat 1: Total Journals */}
          <div className="p-5 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-1 relative shadow-2xs hover:-translate-y-0.5 transition-transform duration-200">
            <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#6B4938] block">
              Total Journals
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-[#3B2922]">
                {animatedCount}
              </span>
              <span className="text-xs text-[#6B4938]">entries preserved</span>
            </div>
            <p className="text-[11px] text-[#6B4938]/70 pt-1">
              Encrypted under user-isolated Firestore rules
            </p>
          </div>

          {/* Stat 2: Total Key Insights */}
          <div className="p-5 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-1 relative shadow-2xs hover:-translate-y-0.5 transition-transform duration-200">
            <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#6B4938] block">
              Total Insights
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-[#3B2922]">
                {totalInsightsCount}
              </span>
              <span className="text-xs text-[#6B4938]">realizations unlocked</span>
            </div>
            <p className="text-[11px] text-[#6B4938]/70 pt-1">
              Synthesized by server-side Gemini gateway
            </p>
          </div>

          {/* Stat 3: Pending Action Items */}
          <div className="p-5 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-1 relative shadow-2xs hover:-translate-y-0.5 transition-transform duration-200">
            <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#6B4938] block">
              Pending Action Items
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-[#3B2922]">
                {pendingActionItems.length}
              </span>
              <span className="text-xs text-[#6B4938]">clarity habits</span>
            </div>
            <p className="text-[11px] text-[#6B4938]/70 pt-1">
              Practical non-clinical steps for mindful pacing
            </p>
          </div>
        </div>

        {/* Elegant Timeline Component */}
        <div className="p-6 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#E8D6C3]/60 pb-3">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#3B2922] flex items-center gap-2">
              <Calendar size={14} className="text-[#6B4938]" />
              Mindful Reflection Timeline
            </span>
            <span className="text-[11px] text-[#6B4938] italic">
              Recent Headspace Flow
            </span>
          </div>

          {timelineEntries.length > 0 ? (
            <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto pb-2 pt-1 scrollbar-thin">
              {timelineEntries.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => {
                    const found = recentConversations.find((c) => c.id === item.id);
                    if (found) onOpenConversation(found);
                  }}
                  className="flex flex-col items-center min-w-[76px] p-3 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] hover:border-[#6B4938] transition-all cursor-pointer group hover:-translate-y-1 shadow-2xs"
                >
                  <span className="text-[10px] text-[#6B4938] font-mono font-medium">
                    {item.date}
                  </span>
                  <span className="text-2xl my-1.5 transition-transform group-hover:scale-125">
                    {item.emoji}
                  </span>
                  <span className="text-[10px] font-serif font-bold text-[#3B2922] truncate max-w-[70px]">
                    {item.moodLabel}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-[#6B4938] italic font-serif">
              Write your first reflections to establish your mindful timeline.
            </div>
          )}
        </div>
      </section>

      {/* Ways to Reflect (Modality Cards) */}
      <section className="space-y-3">
        <h2 className="text-xs font-serif font-bold uppercase tracking-wider text-[#6B4938]">
          Ways to Reflect
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate("new-journal")}
            className="p-6 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] hover:border-[#6B4938] transition-all duration-200 text-left group cursor-pointer shadow-2xs hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-[#E8B84A]/15 text-[#6B4938]">
                <Sparkles size={18} />
              </span>
              <ArrowRight
                size={16}
                className="text-[#6B4938]/40 group-hover:text-[#3B2922] group-hover:translate-x-1 transition-all"
              />
            </div>
            <h3 className="text-sm font-bold font-serif text-[#3B2922]">Socratic Chat Reflection</h3>
            <p className="text-xs text-[#6B4938] mt-1 leading-relaxed">
              Engage in a multi-turn dialogue with Gemini to examine decisions, untangle worries, and find clarity.
            </p>
          </button>

          <button
            onClick={() => onNavigate("voice-journal")}
            className="p-6 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] hover:border-[#6B4938] transition-all duration-200 text-left group cursor-pointer shadow-2xs hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-[#A8B29A]/20 text-[#3B2922]">
                <Mic size={18} />
              </span>
              <ArrowRight
                size={16}
                className="text-[#6B4938]/40 group-hover:text-[#3B2922] group-hover:translate-x-1 transition-all"
              />
            </div>
            <h3 className="text-sm font-bold font-serif text-[#3B2922]">Voice Journaling</h3>
            <p className="text-xs text-[#6B4938] mt-1 leading-relaxed">
              Stream-of-consciousness speaking transcribed on your device. Free your mind without typing.
            </p>
          </button>

          <button
            onClick={() => onNavigate("focus-mode")}
            className="p-6 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] hover:border-[#6B4938] transition-all duration-200 text-left group cursor-pointer shadow-2xs hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-[#E8D6C3]/60 text-[#3B2922]">
                <Target size={18} />
              </span>
              <ArrowRight
                size={16}
                className="text-[#6B4938]/40 group-hover:text-[#3B2922] group-hover:translate-x-1 transition-all"
              />
            </div>
            <h3 className="text-sm font-bold font-serif text-[#3B2922]">Focus Sanctuary</h3>
            <p className="text-xs text-[#6B4938] mt-1 leading-relaxed">
              A distraction-free, full-screen writing space with ambient procedural audio and gentle timers.
            </p>
          </button>
        </div>
      </section>

      {/* 18. RECENT REFLECTIONS WITH SKELETON LOADERS & EMPTY STATES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-serif font-bold uppercase tracking-wider text-[#6B4938]">
            Recent Vault Reflections
          </h2>
          {recentConversations.length > 0 && (
            <button
              onClick={() => onNavigate("history")}
              className="text-xs text-[#6B4938] hover:text-[#3B2922] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All History</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        {loadingEntries ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="p-5 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-3 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-[#E8D6C3]/50 rounded-md" />
                  <div className="h-3 w-16 bg-[#E8D6C3]/40 rounded-md" />
                </div>
                <div className="h-5 w-3/4 bg-[#E8D6C3]/60 rounded-md" />
                <div className="h-4 w-full bg-[#E8D6C3]/30 rounded-md" />
              </div>
            ))}
          </div>
        ) : recentConversations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentConversations.map((conv) => {
              const moodItem = MOODS_CONFIG[conv.mood] || MOODS_CONFIG.reflective;
              return (
                <div
                  key={conv.id}
                  onClick={() => onOpenConversation(conv)}
                  className="p-5 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] hover:border-[#6B4938] hover:shadow-md transition-all duration-200 cursor-pointer space-y-2.5 group hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between text-xs text-[#6B4938]">
                    <span className="flex items-center gap-1.5 font-medium text-[#3B2922]">
                      <span>{moodItem.emoji}</span>
                      <span>{moodItem.label}</span>
                    </span>
                    <span className="text-[11px] text-[#6B4938]/70">
                      {conv.createdAt?.toDate
                        ? conv.createdAt.toDate().toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                        : "Today"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold font-serif text-[#3B2922] group-hover:text-[#6B4938] transition-colors line-clamp-1">
                    {conv.title || "Untitled Reflection"}
                  </h3>

                  {conv.summary && (
                    <p className="text-xs text-[#6B4938] line-clamp-2 leading-relaxed italic font-serif">
                      "{conv.summary}"
                    </p>
                  )}

                  {conv.topics && conv.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {conv.topics.slice(0, 3).map((topic, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full bg-[#FFF8EE] border border-[#E8D6C3] text-[10px] text-[#6B4938] font-medium"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Thoughtful Empty State (Requirement 18) */
          <div className="p-8 sm:p-12 rounded-3xl bg-[#FFFCF7] border border-dashed border-[#E8D6C3] text-center space-y-4 shadow-2xs">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#E8B84A]/15 border border-[#E8B84A]/30 flex items-center justify-center text-[#6B4938]">
              <Feather size={24} />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-lg font-serif font-bold text-[#3B2922]">
                Your vault is quiet.
              </h3>
              <p className="text-xs sm:text-sm text-[#6B4938] leading-relaxed">
                Begin your first reflection today.
              </p>
            </div>
            <div>
              <button
                onClick={() => (user ? onNavigate("new-journal") : openAuthModal())}
                className="px-6 py-2.5 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFFCF7] text-xs font-semibold shadow-xs cursor-pointer transition-all border border-[#E8B84A]/30 inline-flex items-center gap-2 group"
              >
                <span>Start Reflection</span>
                <ArrowRight size={14} className="text-[#E8B84A] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Global Journey Map Modal */}
      <JourneyMapModal
        isOpen={isJourneyModalOpen}
        onClose={() => setIsJourneyModalOpen(false)}
      />
    </div>
  );
};
