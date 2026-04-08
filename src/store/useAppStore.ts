import { create } from 'zustand';

interface UrgeLog {
  strength: string;
  triggers: string[];
  actions: string[];
  timestamp: Date;
}

interface RelapseLog {
  triggers: string[];
  mood: string;
  location: string;
  reflection: string;
  timestamp: Date;
}

interface AppState {
  onboardingComplete: boolean;
  streak: number;
  xp: number;
  level: number;
  levelName: string;
  xpForNextLevel: number;
  urgeLogs: UrgeLog[];
  relapseLogs: RelapseLog[];
  completeOnboarding: (lastRelapse: string) => void;
  resistUrge: () => void;
  logUrge: (log: Omit<UrgeLog, 'timestamp'>) => void;
  logRelapse: (log: Omit<RelapseLog, 'timestamp'>) => void;
  resetStreak: () => void;
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

export const useAppStore = create<AppState>((set) => ({
  onboardingComplete: false,
  streak: 0,
  xp: 0,
  level: 1,
  levelName: 'Initiate',
  xpForNextLevel: 100,
  urgeLogs: [],
  relapseLogs: [],
  completeOnboarding: (lastRelapse) =>
    set(() => ({
      onboardingComplete: true,
      streak: getInitialStreak(lastRelapse),
      xp: 0,
      level: 1,
      levelName: 'Initiate',
      xpForNextLevel: 100,
    })),
  resistUrge: () =>
    set((state) => {
      const newXp = state.xp + 10;
      const { level, levelName, xpForNextLevel } = getLevelInfo(newXp);
      return { xp: newXp, level, levelName, xpForNextLevel };
    }),
  logUrge: (log) =>
    set((state) => {
      const newXp = state.xp + 2;
      const { level, levelName, xpForNextLevel } = getLevelInfo(newXp);
      return {
        xp: newXp,
        level,
        levelName,
        xpForNextLevel,
        urgeLogs: [...state.urgeLogs, { ...log, timestamp: new Date() }],
      };
    }),
  logRelapse: (log) =>
    set((state) => {
      const newXp = state.xp + 2;
      const { level, levelName, xpForNextLevel } = getLevelInfo(newXp);
      return {
        streak: 0,
        xp: newXp,
        level,
        levelName,
        xpForNextLevel,
        relapseLogs: [...state.relapseLogs, { ...log, timestamp: new Date() }],
      };
    }),
  resetStreak: () =>
    set(() => ({ streak: 0 })),
}));
