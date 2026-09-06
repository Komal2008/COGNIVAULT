export type MoodType = "happy" | "calm" | "reflective" | "stressed" | "curious" | "focused";

export interface MoodMeta {
  id: MoodType;
  label: string;
  emoji: string;
  shortDescription: string;
  visualAtmosphere: string;
  audioAtmosphere: string;
  color: string;
  accentBg: string;
  borderColor: string;
  soundName: string;
  soundDescription: string;
  prompt: string;
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  sourceThought?: string;
  createdAt?: any;
  completedAt?: any;
}

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string | number;
}

export interface Conversation {
  id: string;
  title: string;
  summary?: string;
  mood: MoodType;
  topics: string[];
  keyInsights: string[];
  actionItems: ActionItem[];
  createdAt: any;
  updatedAt: any;
  messages?: Message[];
  autoReflectText?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  currentMood?: MoodType;
  updatedAt?: any;
}

export interface InsightDocument {
  id: string;
  recurringThemes: string[];
  aiObservation: string;
  actionItems: ActionItem[];
  moodDistribution?: Record<MoodType, number>;
  generatedAt: any;
}

export interface TomorrowNote {
  id: string;
  note: string;
  sourceConversationId?: string;
  sourceJournalId?: string;
  createdAt: any;
  createdDateString?: string;
  targetDate?: string;
  read?: boolean;
  status?: 'active' | 'archived';
}

export interface EveningReflection {
  id: string;
  prideItem: string;
  keyThought: string;
  mood: MoodType;
  insight: string;
  tomorrowIntention: string;
  createdAt: any;
}

export interface EveningReflectionData {
  keyThought: string;
  mood: MoodType;
  insight: string;
  tomorrowIntention: string;
}

export interface ThoughtToActionItem {
  id: string;
  observation?: string;
  actionStep: string;
  completed: boolean;
  completedAt?: any;
  createdAt?: any;
  sourceJournalId?: string;
}

export interface TinyWin {
  id: string;
  title: string;
  context?: string;
  createdAt: any;
}

export interface MorningRitualData {
  groundingThought: string;
  reflectionQuestion: string;
  theme: string;
  mood: MoodType;
}

export interface TodayQuest {
  id: string;
  title: string;
  prompt: string;
  xpReward: number;
  dateString: string;
  completed: boolean;
}

export interface ReflectionMirrorData {
  theme: string;
  question: string;
  aiObservation?: string;
  userResponse?: 'explored' | 'corrected' | 'dismissed';
}

export type JourneyStageId = 'begin' | 'think' | 'reflect' | 'discover' | 'act' | 'grow';

export interface JourneyStage {
  id: JourneyStageId;
  label: string;
  emoji: string;
  description: string;
  unlocked: boolean;
  requirement: string;
}

export interface ReflectionBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: any;
  isUnlocked: boolean;
}

export interface GamificationStats {
  xp: number;
  level: number;
  levelTitle: string;
  nextLevelXp: number;
  currentLevelBaseXp: number;
  streak: number;
  streakPaused?: boolean;
  lastActiveDate: string; // YYYY-MM-DD
  reflectionsCount: number;
  completedActionsCount: number;
  tinyWinsCount: number;
  morningRitualsCount: number;
  eveningReflectionsCount: number;
  badges: string[]; // Badge IDs
  unlockedStages: JourneyStageId[];
  completedActivities: Record<string, boolean>; // Idempotent keys: e.g. "morning_ritual_2026-09-05"
  todayQuest?: TodayQuest;
  updatedAt: any;
}

export interface XpFloatingNotice {
  id: string;
  amount: number;
  activityLabel: string;
}

export type ViewTab = 
  | "dashboard" 
  | "new-journal" 
  | "history" 
  | "insights" 
  | "journey"
  | "atmosphere" 
  | "voice-journal" 
  | "focus-mode" 
  | "security";

