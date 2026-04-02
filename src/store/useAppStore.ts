import { create } from 'zustand';

interface AppState {
  streak: number;
  xp: number;
  level: number;
  levelName: string;
  xpForNextLevel: number;
  resistUrge: () => void;
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

export const useAppStore = create<AppState>((set) => ({
  streak: 30,
  xp: 840,
  level: 8,
  levelName: 'Vanguard',
  xpForNextLevel: 1000,
  resistUrge: () =>
    set((state) => {
      const newXp = state.xp + 10;
      const newStreak = state.streak + 1;
      const { level, levelName, xpForNextLevel } = getLevelInfo(newXp);
      return { xp: newXp, streak: newStreak, level, levelName, xpForNextLevel };
    }),
  resetStreak: () =>
    set(() => ({ streak: 0 })),
}));
