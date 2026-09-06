// /src/lib/gamification.ts
// Cognivault Reflection Gamification Engine:
// Explicitly measures journaling activity and reflection engagement only.
// Never implies or measures clinical mental health or psychological worth.

import { GamificationStats, JourneyStage, ReflectionBadge } from "../types";

export const LEVEL_TIERS = [
  { level: 1, title: "Beginning", minXp: 0, maxXp: 50 },
  { level: 2, title: "Explorer", minXp: 50, maxXp: 120 },
  { level: 3, title: "Reflector", minXp: 120, maxXp: 220 },
  { level: 4, title: "Observer", minXp: 220, maxXp: 350 },
  { level: 5, title: "Pattern Finder", minXp: 350, maxXp: 500 },
  { level: 6, title: "Insight Seeker", minXp: 500, maxXp: 700 },
  { level: 7, title: "Deep Thinker", minXp: 700, maxXp: 1000 },
];

export function calculateLevelData(xp: number) {
  let tier = LEVEL_TIERS[0];
  for (const t of LEVEL_TIERS) {
    if (xp >= t.minXp) {
      tier = t;
    }
  }

  const currentLevelBaseXp = tier.minXp;
  const nextLevelXp = tier.maxXp;
  const progressInLevel = Math.max(0, xp - currentLevelBaseXp);
  const totalTierSpan = Math.max(1, nextLevelXp - currentLevelBaseXp);
  const progressPercent = Math.min(100, Math.round((progressInLevel / totalTierSpan) * 100));

  return {
    level: tier.level,
    levelTitle: tier.title,
    currentLevelBaseXp,
    nextLevelXp,
    progressPercent,
  };
}

export const ALL_BADGES: Omit<ReflectionBadge, "isUnlocked">[] = [
  {
    id: "first_thought",
    title: "First Thought",
    description: "Penned your first personal reflection in the vault.",
    icon: "🌱",
  },
  {
    id: "voice_within",
    title: "Voice Within",
    description: "Spoke your inner dialogue aloud in a voice journal.",
    icon: "🎙️",
  },
  {
    id: "self_observer",
    title: "Self Observer",
    description: "Completed 5 thoughtful journal reflections.",
    icon: "🪞",
  },
  {
    id: "pattern_finder",
    title: "Pattern Finder",
    description: "Discovered your first recurring reflection theme.",
    icon: "💡",
  },
  {
    id: "thought_to_action",
    title: "Thought to Action",
    description: "Completed your first grounded next-step action.",
    icon: "🎯",
  },
  {
    id: "morning_ritualist",
    title: "Morning Ritualist",
    description: "Completed 5 mindful morning rituals.",
    icon: "🌅",
  },
  {
    id: "deep_thinker",
    title: "Deep Thinker",
    description: "Cultivated 10 meaningful reflection sessions.",
    icon: "✨",
  },
];

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: "begin",
    label: "BEGIN",
    emoji: "🌱",
    description: "Take the first step into your private reflection sanctuary.",
    unlocked: true,
    requirement: "Unlocked on first journal entry",
  },
  {
    id: "think",
    label: "THINK",
    emoji: "💭",
    description: "Engage with the Socratic reflection partner to unpack thoughts.",
    unlocked: false,
    requirement: "Unlocked after your first Gemini reflection",
  },
  {
    id: "reflect",
    label: "REFLECT",
    emoji: "🪞",
    description: "Establish rhythm with Morning Rituals and deeper follow-ups.",
    unlocked: false,
    requirement: "Unlocked after 3 reflections or 1 Morning Ritual",
  },
  {
    id: "discover",
    label: "DISCOVER",
    emoji: "💡",
    description: "Identify recurring thematic threads with the Reflection Mirror.",
    unlocked: false,
    requirement: "Unlocked after generating an insight or reviewing mirror",
  },
  {
    id: "act",
    label: "ACT",
    emoji: "🎯",
    description: "Bridge introspection and real-world clarity with Thought → Action.",
    unlocked: false,
    requirement: "Unlocked after accepting and completing an action step",
  },
  {
    id: "grow",
    label: "GROW",
    emoji: "✨",
    description: "Nurture your evolving reflection garden with continuity notes.",
    unlocked: false,
    requirement: "Unlocked after 5 reflections or saving a tiny win",
  },
];

export const DEFAULT_GAMIFICATION_STATS: GamificationStats = {
  xp: 15,
  level: 1,
  levelTitle: "Beginning",
  nextLevelXp: 50,
  currentLevelBaseXp: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().split("T")[0],
  reflectionsCount: 1,
  completedActionsCount: 0,
  tinyWinsCount: 0,
  morningRitualsCount: 0,
  eveningReflectionsCount: 0,
  badges: ["first_thought"],
  unlockedStages: ["begin"],
  completedActivities: {},
  updatedAt: new Date(),
};
