// /src/context/GamificationContext.tsx
// Context for private reflection XP, calm levels, gentle streaks, badges, and journey unlocks

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import { GamificationStats, JourneyStageId, XpFloatingNotice } from "../types";
import {
  ALL_BADGES,
  calculateLevelData,
  DEFAULT_GAMIFICATION_STATS,
  JOURNEY_STAGES,
} from "../lib/gamification";

interface GamificationContextType {
  stats: GamificationStats;
  awardXp: (amount: number, activityKey: string, activityLabel: string) => Promise<boolean>;
  recordReflection: () => Promise<void>;
  recordGeminiReflection: () => Promise<void>;
  recordVoiceJournal: () => Promise<void>;
  recordMorningRitual: () => Promise<void>;
  recordEveningReflection: () => Promise<void>;
  recordActionCompleted: () => Promise<void>;
  recordTinyWin: () => Promise<void>;
  recordQuestionDeeper: () => Promise<void>;
  recordQuestCompleted: () => Promise<void>;
  togglePauseStreak: () => Promise<void>;
  floatingNotices: XpFloatingNotice[];
  newUnlockedBadge: string | null;
  dismissBadgeCelebration: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<GamificationStats>(DEFAULT_GAMIFICATION_STATS);
  const [floatingNotices, setFloatingNotices] = useState<XpFloatingNotice[]>([]);
  const [newUnlockedBadge, setNewUnlockedBadge] = useState<string | null>(null);

  // Sync with Firestore for authenticated users
  useEffect(() => {
    if (!user) {
      setStats(DEFAULT_GAMIFICATION_STATS);
      return;
    }

    const statsRef = doc(db, "users", user.uid, "gamification", "stats");

    const unsubscribe = onSnapshot(
      statsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const levelInfo = calculateLevelData(data.xp || 0);
          setStats({
            xp: data.xp || 0,
            level: levelInfo.level,
            levelTitle: levelInfo.levelTitle,
            nextLevelXp: levelInfo.nextLevelXp,
            currentLevelBaseXp: levelInfo.currentLevelBaseXp,
            streak: data.streak || 1,
            streakPaused: !!data.streakPaused,
            lastActiveDate: data.lastActiveDate || new Date().toISOString().split("T")[0],
            reflectionsCount: data.reflectionsCount || 0,
            completedActionsCount: data.completedActionsCount || 0,
            tinyWinsCount: data.tinyWinsCount || 0,
            morningRitualsCount: data.morningRitualsCount || 0,
            eveningReflectionsCount: data.eveningReflectionsCount || 0,
            badges: data.badges || ["first_thought"],
            unlockedStages: data.unlockedStages || ["begin"],
            completedActivities: data.completedActivities || {},
            todayQuest: data.todayQuest || undefined,
            updatedAt: data.updatedAt || new Date(),
          });
        } else {
          // Initialize stats doc in Firestore
          setDoc(statsRef, {
            ...DEFAULT_GAMIFICATION_STATS,
            updatedAt: serverTimestamp(),
          }).catch((err) => console.warn("Init gamification doc error:", err));
        }
      },
      (err) => {
        console.warn("Gamification listener error:", err.message);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Gentle Streak check once per session (respecting streakPaused toggle)
  useEffect(() => {
    if (stats.streakPaused) return;

    const today = new Date().toISOString().split("T")[0];
    if (stats.lastActiveDate === today) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    let newStreak = stats.streak;

    if (stats.lastActiveDate === yesterday) {
      newStreak += 1;
    } else if (stats.lastActiveDate && stats.lastActiveDate < yesterday) {
      newStreak = 1; // Gentle restart without guilt
    }

    if (newStreak !== stats.streak || stats.lastActiveDate !== today) {
      const updated = {
        ...stats,
        streak: newStreak,
        lastActiveDate: today,
      };
      setStats(updated);

      if (user) {
        const statsRef = doc(db, "users", user.uid, "gamification", "stats");
        setDoc(statsRef, { streak: newStreak, lastActiveDate: today, updatedAt: serverTimestamp() }, { merge: true })
          .catch(() => {});
      }
    }
  }, [stats.lastActiveDate, stats.streak, stats.streakPaused, user]);

  // Core Award XP Engine with Idempotency Guard & Floating Toast
  const awardXp = useCallback(
    async (amount: number, activityKey: string, activityLabel: string): Promise<boolean> => {
      // Prevent duplicate awards for identical activity keys
      if (stats.completedActivities && stats.completedActivities[activityKey]) {
        return false;
      }

      const newXp = stats.xp + amount;
      const levelInfo = calculateLevelData(newXp);
      const newActivities = { ...(stats.completedActivities || {}), [activityKey]: true };

      // Trigger floating notice
      const noticeId = `xp_${Date.now()}_${Math.random()}`;
      setFloatingNotices((prev) => [...prev, { id: noticeId, amount, activityLabel }]);
      setTimeout(() => {
        setFloatingNotices((prev) => prev.filter((n) => n.id !== noticeId));
      }, 2600);

      const updatedStats: GamificationStats = {
        ...stats,
        xp: newXp,
        level: levelInfo.level,
        levelTitle: levelInfo.levelTitle,
        nextLevelXp: levelInfo.nextLevelXp,
        currentLevelBaseXp: levelInfo.currentLevelBaseXp,
        completedActivities: newActivities,
        updatedAt: new Date(),
      };

      setStats(updatedStats);

      if (user) {
        try {
          const statsRef = doc(db, "users", user.uid, "gamification", "stats");
          await setDoc(
            statsRef,
            {
              xp: newXp,
              completedActivities: newActivities,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn("Failed to persist XP:", err);
        }
      }

      return true;
    },
    [stats, user]
  );

  // Check and unlock badges/journey stages whenever milestone metrics change
  const checkMilestones = useCallback(
    async (currentStats: GamificationStats) => {
      const newBadges = new Set(currentStats.badges);
      const newStages = new Set(currentStats.unlockedStages);
      let newlyUnlockedBadgeTitle: string | null = null;

      // Badges
      if (currentStats.reflectionsCount >= 1 && !newBadges.has("first_thought")) {
        newBadges.add("first_thought");
        newlyUnlockedBadgeTitle = "First Thought";
      }
      if (currentStats.reflectionsCount >= 5 && !newBadges.has("self_observer")) {
        newBadges.add("self_observer");
        newlyUnlockedBadgeTitle = "Self Observer";
      }
      if (currentStats.reflectionsCount >= 10 && !newBadges.has("deep_thinker")) {
        newBadges.add("deep_thinker");
        newlyUnlockedBadgeTitle = "Deep Thinker";
      }
      if (currentStats.morningRitualsCount >= 5 && !newBadges.has("morning_ritualist")) {
        newBadges.add("morning_ritualist");
        newlyUnlockedBadgeTitle = "Morning Ritualist";
      }
      if (currentStats.completedActionsCount >= 1 && !newBadges.has("thought_to_action")) {
        newBadges.add("thought_to_action");
        newlyUnlockedBadgeTitle = "Thought to Action";
      }

      // Journey Stages
      newStages.add("begin");
      if (currentStats.reflectionsCount >= 1) newStages.add("think");
      if (currentStats.morningRitualsCount >= 1 || currentStats.reflectionsCount >= 3) newStages.add("reflect");
      if (currentStats.reflectionsCount >= 4 || newBadges.has("pattern_finder")) newStages.add("discover");
      if (currentStats.completedActionsCount >= 1) newStages.add("act");
      if (currentStats.reflectionsCount >= 5 || currentStats.tinyWinsCount >= 1) newStages.add("grow");

      const badgesArray = Array.from(newBadges);
      const stagesArray = Array.from(newStages) as JourneyStageId[];

      if (
        badgesArray.length !== currentStats.badges.length ||
        stagesArray.length !== currentStats.unlockedStages.length
      ) {
        if (newlyUnlockedBadgeTitle) {
          setNewUnlockedBadge(newlyUnlockedBadgeTitle);
        }

        const updated: GamificationStats = {
          ...currentStats,
          badges: badgesArray,
          unlockedStages: stagesArray,
        };
        setStats(updated);

        if (user) {
          const statsRef = doc(db, "users", user.uid, "gamification", "stats");
          await setDoc(
            statsRef,
            {
              badges: badgesArray,
              unlockedStages: stagesArray,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          ).catch(() => {});
        }
      }
    },
    [user]
  );

  const recordReflection = useCallback(async () => {
    const newCount = stats.reflectionsCount + 1;
    const updated = { ...stats, reflectionsCount: newCount };
    setStats(updated);

    if (user) {
      const statsRef = doc(db, "users", user.uid, "gamification", "stats");
      setDoc(statsRef, { reflectionsCount: newCount, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
    }

    await awardXp(10, `reflection_${Date.now()}`, "Complete a journal");
    await checkMilestones(updated);
  }, [awardXp, checkMilestones, stats, user]);

  const recordGeminiReflection = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const key = `gemini_reflection_${Date.now()}`;
    const newCount = stats.reflectionsCount + 1;
    const updated = { ...stats, reflectionsCount: newCount };
    setStats(updated);

    if (user) {
      const statsRef = doc(db, "users", user.uid, "gamification", "stats");
      setDoc(statsRef, { reflectionsCount: newCount, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
    }

    await awardXp(15, key, "Meaningful Gemini reflection");
    await checkMilestones(updated);
  }, [awardXp, checkMilestones, stats, user]);

  const recordVoiceJournal = useCallback(async () => {
    await awardXp(15, `voice_${Date.now()}`, "Voice Journal");
    const newBadges = new Set(stats.badges);
    if (!newBadges.has("voice_within")) {
      newBadges.add("voice_within");
      setNewUnlockedBadge("Voice Within");
      const badgesArray = Array.from(newBadges);
      setStats((prev) => ({ ...prev, badges: badgesArray }));
      if (user) {
        const statsRef = doc(db, "users", user.uid, "gamification", "stats");
        setDoc(statsRef, { badges: badgesArray, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
      }
    }
  }, [awardXp, stats.badges, user]);

  const recordMorningRitual = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const key = `morning_ritual_${today}`;
    const newCount = stats.morningRitualsCount + 1;
    const updated = { ...stats, morningRitualsCount: newCount };
    setStats(updated);

    if (user) {
      const statsRef = doc(db, "users", user.uid, "gamification", "stats");
      setDoc(statsRef, { morningRitualsCount: newCount, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
    }

    await awardXp(10, key, "Morning Ritual");
    await checkMilestones(updated);
  }, [awardXp, checkMilestones, stats, user]);

  const recordEveningReflection = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const key = `evening_reflection_${today}`;
    const newCount = stats.eveningReflectionsCount + 1;
    const updated = { ...stats, eveningReflectionsCount: newCount };
    setStats(updated);

    if (user) {
      const statsRef = doc(db, "users", user.uid, "gamification", "stats");
      setDoc(statsRef, { eveningReflectionsCount: newCount, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
    }

    await awardXp(15, key, "Evening Reflection");
    await checkMilestones(updated);
  }, [awardXp, checkMilestones, stats, user]);

  const recordActionCompleted = useCallback(async () => {
    const newCount = stats.completedActionsCount + 1;
    const updated = { ...stats, completedActionsCount: newCount };
    setStats(updated);

    if (user) {
      const statsRef = doc(db, "users", user.uid, "gamification", "stats");
      setDoc(statsRef, { completedActionsCount: newCount, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
    }

    await awardXp(20, `action_completed_${Date.now()}`, "Thought → Action completed");
    await checkMilestones(updated);
  }, [awardXp, checkMilestones, stats, user]);

  const recordTinyWin = useCallback(async () => {
    const newCount = stats.tinyWinsCount + 1;
    const updated = { ...stats, tinyWinsCount: newCount };
    setStats(updated);

    if (user) {
      const statsRef = doc(db, "users", user.uid, "gamification", "stats");
      setDoc(statsRef, { tinyWinsCount: newCount, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
    }

    await awardXp(10, `tiny_win_${Date.now()}`, "Saved a Tiny Win");
    await checkMilestones(updated);
  }, [awardXp, checkMilestones, stats, user]);

  const recordQuestionDeeper = useCallback(async () => {
    await awardXp(10, `deeper_question_${Date.now()}`, "One Question Deeper");
  }, [awardXp]);

  const recordQuestCompleted = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    await awardXp(15, `quest_${today}`, "Daily Reflection Quest");
  }, [awardXp]);

  const togglePauseStreak = useCallback(async () => {
    const newPausedState = !stats.streakPaused;
    setStats((prev) => ({ ...prev, streakPaused: newPausedState }));

    if (user) {
      const statsRef = doc(db, "users", user.uid, "gamification", "stats");
      await setDoc(statsRef, { streakPaused: newPausedState, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
    }
  }, [stats.streakPaused, user]);

  const dismissBadgeCelebration = useCallback(() => {
    setNewUnlockedBadge(null);
  }, []);

  return (
    <GamificationContext.Provider
      value={{
        stats,
        awardXp,
        recordReflection,
        recordGeminiReflection,
        recordVoiceJournal,
        recordMorningRitual,
        recordEveningReflection,
        recordActionCompleted,
        recordTinyWin,
        recordQuestionDeeper,
        recordQuestCompleted,
        togglePauseStreak,
        floatingNotices,
        newUnlockedBadge,
        dismissBadgeCelebration,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = (): GamificationContextType => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return context;
};

