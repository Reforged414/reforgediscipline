import {
  Moon,
  Dumbbell,
  BookOpen,
  Wind,
  Droplet,
  PenLine,
  Footprints,
  Smartphone,
  Sparkles,
  GraduationCap,
  Apple,
  Users,
  Target,
  type LucideIcon,
} from 'lucide-react';

export const GOAL_ICON_MAP: Record<string, LucideIcon> = {
  Moon,
  Dumbbell,
  BookOpen,
  Wind,
  Droplet,
  PenLine,
  Footprints,
  Smartphone,
  Sparkles,
  GraduationCap,
  Apple,
  Users,
  Target,
};

const KEYWORD_RULES: Array<[string[], string]> = [
  [['sleep', 'wake'], 'Moon'],
  [['gym', 'workout', 'exercise'], 'Dumbbell'],
  [['read', 'reading', 'book'], 'BookOpen'],
  [['meditate', 'meditation', 'breathe'], 'Wind'],
  [['water', 'hydrate'], 'Droplet'],
  [['journal', 'write'], 'PenLine'],
  [['walk', 'run', 'steps'], 'Footprints'],
  [['screen', 'phone', 'scroll'], 'Smartphone'],
  [['pray', 'prayer', 'faith'], 'Sparkles'],
  [['study', 'learn'], 'GraduationCap'],
  [['diet', 'eat', 'food'], 'Apple'],
  [['social', 'friends', 'call'], 'Users'],
];

/** Resolve an icon name from a goal title via keyword matching. */
export function resolveGoalIconName(title: string): string {
  const text = title.toLowerCase();
  for (const [keywords, icon] of KEYWORD_RULES) {
    if (keywords.some((k) => text.includes(k))) return icon;
  }
  return 'Target';
}

export function getGoalIcon(iconName?: string | null): LucideIcon {
  return (iconName && GOAL_ICON_MAP[iconName]) || Target;
}
