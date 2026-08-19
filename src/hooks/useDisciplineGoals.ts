import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { resolveGoalIconName } from '@/lib/goalIcons';

export interface DisciplineGoal {
  id: string;
  user_id: string;
  goal_name: string;
  is_completed: boolean;
  icon_name?: string | null;
  created_at: string;
}

const GUEST_KEY = 'reforged-guest-goals';

function readGuestGoals(): DisciplineGoal[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeGuestGoals(goals: DisciplineGoal[]) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(goals));
}

export function useDisciplineGoals() {
  const { user, isGuest } = useAuth();
  const [goals, setGoals] = useState<DisciplineGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (isGuest || !user) {
      setGoals(readGuestGoals());
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('discipline_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (!error && data) setGoals(data as DisciplineGoal[]);
    setLoading(false);
  }, [user, isGuest]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = useCallback(
    async (goal_name: string) => {
      const trimmed = goal_name.trim();
      if (!trimmed) return null;
      const icon_name = resolveGoalIconName(trimmed);

      if (isGuest || !user) {
        const newGoal: DisciplineGoal = {
          id: crypto.randomUUID(),
          user_id: 'guest',
          goal_name: trimmed,
          is_completed: false,
          icon_name,
          created_at: new Date().toISOString(),
        };
        const next = [...readGuestGoals(), newGoal];
        writeGuestGoals(next);
        setGoals(next);
        return newGoal;
      }

      const { data, error } = await supabase
        .from('discipline_goals')
        .insert({ user_id: user.id, goal_name: trimmed, icon_name })
        .select()
        .single();
      if (error || !data) return null;
      setGoals((g) => [...g, data as DisciplineGoal]);
      return data as DisciplineGoal;
    },
    [user, isGuest],
  );

  const toggleGoal = useCallback(
    async (id: string) => {
      const target = goals.find((g) => g.id === id);
      if (!target) return;
      const next = !target.is_completed;

      setGoals((g) => g.map((x) => (x.id === id ? { ...x, is_completed: next } : x)));

      if (isGuest || !user) {
        writeGuestGoals(
          readGuestGoals().map((x) => (x.id === id ? { ...x, is_completed: next } : x)),
        );
        return;
      }
      await supabase.from('discipline_goals').update({ is_completed: next }).eq('id', id);
    },
    [goals, user, isGuest],
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      setGoals((g) => g.filter((x) => x.id !== id));
      if (isGuest || !user) {
        writeGuestGoals(readGuestGoals().filter((x) => x.id !== id));
        return;
      }
      await supabase.from('discipline_goals').delete().eq('id', id);
    },
    [user, isGuest],
  );

  return { goals, loading, addGoal, toggleGoal, deleteGoal, refresh: fetchGoals };
}
