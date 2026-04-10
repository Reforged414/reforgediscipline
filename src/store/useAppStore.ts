import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UrgeLog {
  strength: string;
  triggers: string[];
  actions: string[];
  timestamp: string;
}

interface RelapseLog {
  triggers: string[];
  mood: string;
  location: string;
  reflection: string;
  timestamp: string;
}

interface OnboardingData {
  goals: string[];
  identity: string[];
  lastRelapse: string;
  triggers: string[];
  severity: string;
}

interface DailyDiscipline {
  date: string; // YYYY-MM-DD
  checkedIn: boolean;
  resistedUrge: boolean;
  wroteReflection: boolean;
}

interface JournalLog {
  text: string;
  tag: string | null;
  timestamp: string;
}

interface AppState {
  onboardingComplete: boolean;
  onboardingData: OnboardingData | null;
  streak: number;
  xp: number;
  level: number;
  levelName: string;
  xpForNextLevel: number;
  urgeLogs: UrgeLog[];
  relapseLogs: RelapseLog[];
  resistedTimestamps: string[];
  journalLogs: JournalLog[];
  dailyDiscipline: DailyDiscipline;
  shownMilestones: number[];
  pendingMilestone: number | null;
  completeOnboarding: (lastRelapse: string, data?: Partial<OnboardingData>) => void;
  resistUrge: () => void;
  logUrge: (log: Omit<UrgeLog, 'timestamp'>) => void;
  logRelapse: (log: Omit<RelapseLog, 'timestamp'>) => void;
  resetStreak: () => void;
  checkNewDay: () => void;
  completeDailyCheckIn: () => void;
  saveJournalEntry: (entry: Omit<JournalLog, 'timestamp'>) => void;
  dismissMilestone: () => void;
}

const LEVELS = [
  { name: 'Initiate', xpRequired: 0 },
  { name: 'Apprentice', xpRequired: 100 },
  { name: 'Warrior', xpRequired: 250 },
  { name: 'Guardian', xpRequired: 500 },
  { name: 'Sentinel', xpRequired: 800 },
  { name: 'Champion', xpRequired: 1200 },
  { name: 'Master', xpRequired: 1800 },
  { name: 'Vanguard', xpRequired: 2500 },
  { name: 'Legend', xpRequired: 3500 },
  { name: 'Reforged', xpRequired: 5000 },
];

function getLevelInfo(xp: number) {
  let level = 1;
  let levelName = LEVELS[0].name;
  let xpForNextLevel = LEVELS[1]?.xpRequired ?? 100;

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      level = i + 1;
      levelName = LEVELS[i].name;
      xpForNextLevel = LEVELS[i + 1]?.xpRequired ?? LEVELS[i].xpRequired + 1000;
      break;
    }
  }

  return { level, levelName, xpForNextLevel };
}

function getInitialStreak(lastRelapse: string): number {
  switch (lastRelapse) {
    case 'today': return 0;
    case 'yesterday': return 1;
    case '3-4-days': return 2;
    case 'week+': return 7;
    case 'not-sure':
    default: return 0;
  }
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function freshDailyDiscipline(): DailyDiscipline {
  return {
    date: getTodayString(),
    checkedIn: false,
    resistedUrge: false,
    wroteReflection: false,
  };
}

const MILESTONES = [3, 7, 14, 30, 45, 60, 90, 120, 180, 365];

function checkMilestone(newStreak: number, shownMilestones: number[]): { pending: number | null; toMark: number[] } {
  // Find all milestones the user has reached but not yet been shown
  const unshown = MILESTONES.filter(m => newStreak >= m && !shownMilestones.includes(m));
  if (unshown.length === 0) return { pending: null, toMark: [] };
  // Show the highest one, mark all as shown
  return { pending: unshown[unshown.length - 1], toMark: unshown };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboardingComplete: false,
      onboardingData: null,
      streak: 0,
      xp: 0,
      level: 1,
      levelName: 'Initiate',
      xpForNextLevel: 100,
      urgeLogs: [],
      resistedTimestamps: [],
      relapseLogs: [],
      journalLogs: [],
      dailyDiscipline: freshDailyDiscipline(),
      shownMilestones: [],
      pendingMilestone: null,

      completeOnboarding: (lastRelapse, data) => {
        const initialStreak = getInitialStreak(lastRelapse);
        const { pending, toMark } = checkMilestone(initialStreak, []);
        set(() => ({
          onboardingComplete: true,
          onboardingData: data ? { ...data, lastRelapse } as OnboardingData : { goals: [], identity: [], lastRelapse, triggers: [], severity: '' },
          streak: initialStreak,
          xp: 0,
          level: 1,
          levelName: 'Initiate',
          xpForNextLevel: 100,
          dailyDiscipline: freshDailyDiscipline(),
          shownMilestones: toMark,
          pendingMilestone: pending,
        }));
      },

      resistUrge: () =>
        set((state) => {
          const newXp = state.xp + 10;
          const { level, levelName, xpForNextLevel } = getLevelInfo(newXp);
          const now = new Date().toISOString();
          return {
            xp: newXp, level, levelName, xpForNextLevel,
            resistedTimestamps: [...state.resistedTimestamps, now],
            dailyDiscipline: { ...state.dailyDiscipline, resistedUrge: true },
          };
        }),

      logUrge: (log) =>
        set((state) => {
          const newXp = state.xp + 2;
          const { level, levelName, xpForNextLevel } = getLevelInfo(newXp);
          return {
            xp: newXp, level, levelName, xpForNextLevel,
            urgeLogs: [...state.urgeLogs, { ...log, timestamp: new Date().toISOString() }],
          };
        }),

      logRelapse: (log) =>
        set((state) => {
          const newXp = state.xp + 2;
          const { level, levelName, xpForNextLevel } = getLevelInfo(newXp);
          return {
            streak: 0,
            xp: newXp, level, levelName, xpForNextLevel,
            relapseLogs: [...state.relapseLogs, { ...log, timestamp: new Date().toISOString() }],
          };
        }),

      resetStreak: () =>
        set(() => ({ streak: 0 })),

      checkNewDay: () => {
        const state = get();
        const today = getTodayString();
        if (state.dailyDiscipline.date !== today) {
          const lastRelapseToday = state.relapseLogs.some(
            (r) => r.timestamp.split('T')[0] === state.dailyDiscipline.date
          );
          const newStreak = lastRelapseToday ? 0 : state.streak + 1;
          const { pending, toMark } = checkMilestone(newStreak, state.shownMilestones);
          set({
            streak: newStreak,
            dailyDiscipline: freshDailyDiscipline(),
            pendingMilestone: pending,
            shownMilestones: toMark.length > 0 ? [...state.shownMilestones, ...toMark] : state.shownMilestones,
          });
        }
      },

      dismissMilestone: () => set({ pendingMilestone: null }),

      completeDailyCheckIn: () =>
        set((state) => {
          if (state.dailyDiscipline.checkedIn) return {};
          const newXp = state.xp + 15;
          const { level, levelName, xpForNextLevel } = getLevelInfo(newXp);
          return {
            xp: newXp, level, levelName, xpForNextLevel,
            dailyDiscipline: { ...state.dailyDiscipline, checkedIn: true },
          };
        }),

      saveJournalEntry: (entry) =>
        set((state) => {
          const newXp = state.xp + 10;
          const { level, levelName, xpForNextLevel } = getLevelInfo(newXp);
          return {
            xp: newXp, level, levelName, xpForNextLevel,
            journalLogs: [...state.journalLogs, { ...entry, timestamp: new Date().toISOString() }],
            dailyDiscipline: state.dailyDiscipline.wroteReflection
              ? state.dailyDiscipline
              : { ...state.dailyDiscipline, wroteReflection: true },
          };
        }),
    }),
    {
      name: 'reforged-app-storage',
    }
  )
);
