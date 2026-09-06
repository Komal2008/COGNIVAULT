import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  Circle,
  TrendingUp,
  Tag,
  Lightbulb,
  FileCheck2,
  AlertCircle,
  RefreshCw,
  PieChart,
  Sun,
  Coffee,
  Flame,
  Calendar,
  BookOpen,
  Filter,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAtmosphere } from "../../context/AtmosphereContext";
import { useGamification } from "../../context/GamificationContext";
import { ActionItem, Conversation, InsightDocument, MoodType } from "../../types";
import { MOODS_CONFIG } from "../../lib/audioAtmosphere";
import { collection, query, orderBy, limit, doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { fetchInsights } from "../../../client/services/apiService";

type TimeFilter = "week" | "month" | "all";

export const CognivaultInsights: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { currentMood, moodConfig } = useAtmosphere();
  const { recordActionCompleted } = useGamification();

  const [insightDoc, setInsightDoc] = useState<InsightDocument | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // Load conversations and derived insights
  useEffect(() => {
    if (!user) {
      // Demo insights for unauthenticated preview
      setInsightDoc({
        id: "demo_insight",
        recurringThemes: [
          "Establishing quiet morning rhythms before digital communication",
          "Distinguishing between urgent external demands and authentic priorities",
          "Cultivating gratitude and creative momentum through small wins",
        ],
        aiObservation:
          "Your journal frequently mentions a desire for intentional pacing. When you reserve unstructured contemplation early in the day, your decision-making feels grounded and deliberate. Across your reflections, there is noticeable progress in setting healthy boundaries around work.",
        actionItems: [
          { id: "act_1", text: "Reserve 15 minutes of silent contemplation before checking morning communications", completed: true },
          { id: "act_2", text: "Define the singular focus lever for this week's creative work", completed: false },
          { id: "act_3", text: "Practice a conscious breath pause before accepting new commitments", completed: false },
        ],
        moodDistribution: {
          happy: 3,
          calm: 5,
          reflective: 7,
          stressed: 2,
          curious: 4,
          focused: 6,
        },
        generatedAt: new Date().toISOString(),
      });
      setActionItems([
        { id: "act_1", text: "Reserve 15 minutes of silent contemplation before checking morning communications", completed: true },
        { id: "act_2", text: "Define the singular focus lever for this week's creative work", completed: false },
        { id: "act_3", text: "Practice a conscious breath pause before accepting new commitments", completed: false },
      ]);
      return;
    }

    setIsLoading(true);

    // Subscribe to latest insight
    const insightsRef = collection(db, "users", user.uid, "insights");
    const qInsights = query(insightsRef, orderBy("generatedAt", "desc"), limit(1));

    const unsubInsights = onSnapshot(
      qInsights,
      (snap) => {
        if (!snap.empty) {
          const data = snap.docs[0].data() as InsightDocument;
          setInsightDoc(data);
          if (data.actionItems) {
            setActionItems(data.actionItems);
          }
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Error loading insights:", err);
        setIsLoading(false);
      }
    );

    // Fetch recent conversations for topic and mood aggregation
    const convsRef = collection(db, "users", user.uid, "conversations");
    const qConvs = query(convsRef, orderBy("createdAt", "desc"), limit(50));

    const unsubConvs = onSnapshot(qConvs, (snap) => {
      const list: Conversation[] = [];
      snap.forEach((d) => list.push(d.data() as Conversation));
      setConversations(list);
    });

    return () => {
      unsubInsights();
      unsubConvs();
    };
  }, [user]);

  // Filter conversations based on time filter
  const filteredConversations = conversations.filter((c) => {
    if (timeFilter === "all") return true;

    let convDate: Date | null = null;
    if (c.createdAt?.toDate) {
      convDate = c.createdAt.toDate();
    } else if (c.createdAt instanceof Date) {
      convDate = c.createdAt;
    }

    if (!convDate) return true;

    const now = new Date();
    const diffDays = (now.getTime() - convDate.getTime()) / (1000 * 3600 * 24);

    if (timeFilter === "week") return diffDays <= 7;
    if (timeFilter === "month") return diffDays <= 30;
    return true;
  });

  // Calculate streak from unique entry days
  const calculateStreak = () => {
    if (conversations.length === 0) return 0;
    const entryDates = new Set(
      conversations.map((c) => {
        const d = c.createdAt?.toDate ? c.createdAt.toDate() : new Date();
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      })
    );
    return Math.min(entryDates.size, 7); // Active streak count
  };

  const streakDays = calculateStreak();

  // Generate fresh insights across recent journal conversations
  const handleGenerateFreshInsights = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    if (conversations.length === 0) {
      setErrorMsg("Please write at least one journal entry before synthesizing vault insights.");
      return;
    }

    setIsSynthesizing(true);
    setErrorMsg("");
    setStatusMsg("");

    try {
      const data = await fetchInsights({
        journals: filteredConversations.slice(0, 15).map((c) => ({
          title: c.title,
          summary: c.summary,
          mood: c.mood,
          topics: c.topics,
          keyInsights: c.keyInsights,
        })),
      });

      // Compute mood distribution
      const moodCounts: Record<MoodType, number> = {
        happy: 0,
        calm: 0,
        reflective: 0,
        stressed: 0,
        curious: 0,
        focused: 0,
      };

      filteredConversations.forEach((c) => {
        if (c.mood && moodCounts[c.mood] !== undefined) {
          moodCounts[c.mood]++;
        }
      });

      const newActionItems: ActionItem[] = (data.suggestedActionItems || []).map(
        (item: any, i: number) => ({
          id: `act_${Date.now()}_${i}`,
          text: item.text || String(item),
          completed: false,
        })
      );

      const insightId = `insight_${Date.now()}`;
      const insightPayload: InsightDocument = {
        id: insightId,
        recurringThemes: data.recurringThemes || [],
        aiObservation: data.aiObservation || "",
        actionItems: newActionItems,
        moodDistribution: moodCounts,
        generatedAt: serverTimestamp(),
      };

      // Save to Firestore under user collection
      const docRef = doc(db, "users", user.uid, "insights", insightId);
      await setDoc(docRef, insightPayload);

      setInsightDoc(insightPayload);
      setActionItems(newActionItems);
      setStatusMsg("Fresh reflection insights synthesized and preserved in your vault.");
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (err: any) {
      console.error("Insights error:", err);
      setErrorMsg(err.message || "Unable to synthesize insights.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Toggle action item completion
  const handleToggleAction = async (itemId: string) => {
    const targetItem = actionItems.find((item) => item.id === itemId);
    const updatedStatus = targetItem ? !targetItem.completed : false;

    const updated = actionItems.map((item) =>
      item.id === itemId ? { ...item, completed: updatedStatus } : item
    );
    setActionItems(updated);

    if (updatedStatus) {
      await recordActionCompleted();
    }

    if (user && insightDoc?.id && insightDoc.id !== "demo_insight") {
      try {
        const docRef = doc(db, "users", user.uid, "insights", insightDoc.id);
        await setDoc(docRef, { actionItems: updated }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/insights/${insightDoc.id}`);
      }
    }
  };

  // Aggregate topics across filtered entries
  const allTopics: Record<string, number> = {};
  filteredConversations.forEach((c) => {
    (c.topics || []).forEach((t) => {
      allTopics[t] = (allTopics[t] || 0) + 1;
    });
  });

  const sortedTopics = Object.entries(allTopics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const moodCounts = insightDoc?.moodDistribution || {
    happy: 0,
    calm: 0,
    reflective: 0,
    stressed: 0,
    curious: 0,
    focused: 0,
  };
  const totalMoodEvents = Object.values(moodCounts).reduce((a, b) => a + b, 0) || 1;

  // Determine primary mood
  let primaryMoodKey: MoodType = "reflective";
  let maxMoodCount = -1;
  (Object.keys(moodCounts) as MoodType[]).forEach((m) => {
    if (moodCounts[m] > maxMoodCount) {
      maxMoodCount = moodCounts[m];
      primaryMoodKey = m;
    }
  });
  const primaryMoodMeta = MOODS_CONFIG[primaryMoodKey] || MOODS_CONFIG.reflective;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* 11. TOP BANNER: YOUR REFLECTION JOURNEY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] shadow-xs relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D6C3]/40 border border-[#6B4938]/15 text-[#6B4938] text-xs font-semibold">
            <BrainCircuit size={13} className="text-[#E8B84A]" />
            <span>PATTERNS & OBSERVATIONS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3B2922] tracking-tight">
            Your Reflection Journey
          </h1>
          <p className="text-xs sm:text-sm text-[#6B4938] max-w-xl font-normal leading-relaxed">
            Synthesized reflection patterns, recurring themes, and personal observations extracted
            strictly from your private vault.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 relative z-10">
          {/* Time Filter Tabs: This Week, This Month, All Time */}
          <div className="inline-flex p-1 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3]">
            <button
              onClick={() => setTimeFilter("week")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                timeFilter === "week"
                  ? "bg-[#6B4938] text-[#FFFCF7] shadow-2xs"
                  : "text-[#6B4938] hover:text-[#3B2922]"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeFilter("month")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                timeFilter === "month"
                  ? "bg-[#6B4938] text-[#FFFCF7] shadow-2xs"
                  : "text-[#6B4938] hover:text-[#3B2922]"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                timeFilter === "all"
                  ? "bg-[#6B4938] text-[#FFFCF7] shadow-2xs"
                  : "text-[#6B4938] hover:text-[#3B2922]"
              }`}
            >
              All Time
            </button>
          </div>

          <button
            id="generate-fresh-insights-btn"
            onClick={handleGenerateFreshInsights}
            disabled={isSynthesizing}
            className="px-4 py-2 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFFCF7] text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 border border-[#E8B84A]/30"
          >
            <RefreshCw size={14} className={`text-[#E8B84A] ${isSynthesizing ? "animate-spin" : ""}`} />
            <span>{isSynthesizing ? "Synthesizing..." : "Synthesize Insights"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {statusMsg && (
        <div className="p-4 rounded-2xl bg-[#A8B29A]/20 border border-[#A8B29A]/40 text-[#3B2922] text-xs flex items-center gap-2 font-medium animate-in fade-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#E8D6C3]/50 border border-[#6B4938]/30 text-[#6B4938] text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Top 3 Stat Badges: Streak, Total Entries, Primary Headspace */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Reflection Streak */}
        <div className="p-5 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-1 relative shadow-2xs">
          <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#6B4938] block flex items-center gap-1.5">
            <Flame size={13} className="text-[#E8B84A]" />
            Reflection Streak
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#3B2922]">
              {streakDays}
            </span>
            <span className="text-xs text-[#6B4938]">days active</span>
          </div>
          <p className="text-[10px] text-[#6B4938]/70 pt-0.5">
            Consistent contemplative presence
          </p>
        </div>

        {/* Total Journal Entries */}
        <div className="p-5 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-1 relative shadow-2xs">
          <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#6B4938] block flex items-center gap-1.5">
            <BookOpen size={13} className="text-[#6B4938]" />
            Total Journal Entries
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#3B2922]">
              {filteredConversations.length}
            </span>
            <span className="text-xs text-[#6B4938]">reflections in view</span>
          </div>
          <p className="text-[10px] text-[#6B4938]/70 pt-0.5">
            Preserved under user-isolated rules
          </p>
        </div>

        {/* Primary Headspace */}
        <div className="p-5 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-1 relative shadow-2xs">
          <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#6B4938] block flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#E8B84A]" />
            Primary Headspace
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-[#3B2922] flex items-center gap-1.5">
              <span>{primaryMoodMeta.emoji}</span>
              <span>{primaryMoodMeta.label}</span>
            </span>
          </div>
          <p className="text-[10px] text-[#6B4938]/70 pt-0.5">
            {primaryMoodMeta.shortDescription}
          </p>
        </div>
      </div>

      {/* Primary AI Growth Observation Card */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-serif font-bold text-[#3B2922] flex items-center gap-2">
            <Sparkles size={16} className="text-[#E8B84A]" />
            <span>Growth Observations</span>
          </h2>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B4938]">
            {insightDoc ? "Synthesized via Gemini Gateway" : "Awaiting Entries"}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] text-[#3B2922] text-sm leading-relaxed space-y-3 font-serif italic">
          {insightDoc?.aiObservation ? (
            <p className="whitespace-pre-line leading-relaxed text-[#3B2922]">
              "{insightDoc.aiObservation}"
            </p>
          ) : (
            <p className="text-[#6B4938] italic font-sans text-xs">
              Write a few reflections to uncover patterns in your thoughts.
            </p>
          )}
        </div>
      </section>

      {/* Two Column Grid: Headspace Distribution & Recurring Themes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-serif font-bold text-[#3B2922] flex items-center gap-2">
              <PieChart size={16} className="text-[#E8B84A]" />
              <span>Headspace Distribution</span>
            </h2>
            <span className="text-xs text-[#6B4938] font-medium">
              Active: {moodConfig.emoji} {moodConfig.label}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {(Object.keys(MOODS_CONFIG) as MoodType[]).map((mKey) => {
              const count = moodCounts[mKey] || 0;
              const percentage = Math.round((count / totalMoodEvents) * 100);
              const mMeta = MOODS_CONFIG[mKey];

              return (
                <div key={mKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[#3B2922]">
                      <span>{mMeta.emoji}</span>
                      <span className="font-medium">{mMeta.label}</span>
                    </span>
                    <span className="text-[#6B4938] text-[11px] font-medium">
                      {count} entries ({percentage}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-[#E8D6C3]/40 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-[#6B4938]"
                      style={{ width: `${Math.max(3, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recurring Themes */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-serif font-bold text-[#3B2922] flex items-center gap-2">
              <TrendingUp size={16} className="text-[#E8B84A]" />
              <span>Recurring Reflection Themes</span>
            </h2>
          </div>

          <div className="space-y-2.5 pt-2">
            {insightDoc?.recurringThemes && insightDoc.recurringThemes.length > 0 ? (
              insightDoc.recurringThemes.map((theme, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] flex items-start gap-3 shadow-2xs"
                >
                  <span className="w-6 h-6 rounded-full bg-[#E8D6C3] text-[#3B2922] text-xs font-serif font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs text-[#3B2922] leading-relaxed font-medium">
                    {theme}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#6B4938] italic py-4 text-center">
                Write a few reflections to uncover patterns in your thoughts.
              </p>
            )}
          </div>

          {/* Topics Tag Cloud */}
          {sortedTopics.length > 0 && (
            <div className="pt-3 border-t border-[#E8D6C3]">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#6B4938] block mb-2">
                Frequently Explored Topics
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sortedTopics.map(([tName, tCount]) => (
                  <span
                    key={tName}
                    className="px-3 py-1 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] text-[11px] text-[#6B4938] font-medium"
                  >
                    #{tName} ({tCount})
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Actionable Clarity Items Checklist */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-serif font-bold text-[#3B2922] flex items-center gap-2">
            <FileCheck2 size={16} className="text-[#6B4938]" />
            <span>Actionable Clarity Items</span>
          </h2>
          <span className="text-xs text-[#6B4938] font-medium">
            {actionItems.filter((a) => a.completed).length}/{actionItems.length} Completed
          </span>
        </div>

        <p className="text-xs text-[#6B4938] leading-relaxed">
          Tangible, non-clinical steps derived from your recent journal reflections to translate
          clarity into mindful momentum.
        </p>

        <div className="space-y-2.5 pt-2">
          {actionItems.length > 0 ? (
            actionItems.map((act) => (
              <button
                key={act.id}
                onClick={() => handleToggleAction(act.id)}
                className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer shadow-2xs ${
                  act.completed
                    ? "bg-[#E8D6C3]/20 border-[#E8D6C3]/60 text-[#6B4938]/50 line-through"
                    : "bg-[#FFF8EE] border-[#E8D6C3] hover:border-[#6B4938] text-[#3B2922]"
                }`}
              >
                {act.completed ? (
                  <CheckCircle2 size={18} className="text-[#A8B29A] shrink-0 mt-0.5" />
                ) : (
                  <Circle size={18} className="text-[#6B4938]/40 shrink-0 mt-0.5" />
                )}
                <span className="text-xs sm:text-sm leading-relaxed">{act.text}</span>
              </button>
            ))
          ) : (
            <p className="text-xs text-[#6B4938] italic py-3 text-center">
              Write a few reflections to uncover patterns in your thoughts.
            </p>
          )}
        </div>
      </section>

      {/* Non-medical Disclaimer */}
      <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] text-[11px] text-[#6B4938] leading-relaxed">
        <strong className="text-[#3B2922]">Non-Medical Disclaimer:</strong> Cognivault Insights are
        algorithmic pattern observations synthesized exclusively for creative ideation, personal
        reflection, and self-organization. They do not constitute diagnostic medical, clinical, or
        mental health assessments.
      </div>
    </div>
  );
};
