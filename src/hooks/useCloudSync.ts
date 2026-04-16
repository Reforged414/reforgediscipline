import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/useAppStore';

/**
 * Syncs Zustand local state with Supabase user_data table for authenticated users.
 * - On login: loads cloud data into local store
 * - On state change: saves to cloud (debounced)
 */
export function useCloudSync() {
  const { user, isGuest } = useAuth();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingFromCloud = useRef(false);
  const hasLoaded = useRef(false);

  // Load data from cloud on auth
  useEffect(() => {
    if (!user || isGuest) {
      hasLoaded.current = false;
      return;
    }

    const loadFromCloud = async () => {
      isLoadingFromCloud.current = true;
      try {
        const { data, error } = await supabase
          .from('user_data')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          isLoadingFromCloud.current = false;
          hasLoaded.current = true;
          return;
        }

        // Apply cloud data to local store
        const store = useAppStore.getState();
        useAppStore.setState({
          onboardingComplete: data.onboarding_complete,
          onboardingData: data.onboarding_data as any,
          streak: data.streak,
          xp: data.xp,
          level: data.level,
          levelName: data.level_name,
          xpForNextLevel: data.xp_for_next_level,
          dailyDiscipline: (data.daily_discipline as any) ?? store.dailyDiscipline,
          resistedTimestamps: (data.resisted_timestamps as any) ?? [],
          urgeLogs: (data.urge_logs as any) ?? [],
          relapseLogs: (data.relapse_logs as any) ?? [],
          journalLogs: (data.journal_logs as any) ?? [],
          shownMilestones: (data.shown_milestones as any) ?? [],
          pendingMilestone: data.pending_milestone,
          hasCompletedTutorial: (data as any).has_completed_tutorial ?? false,
          hasSeenTutorial: (data as any).has_completed_tutorial ?? false,
        });
      } catch (err) {
        console.error('Failed to load cloud data:', err);
      } finally {
        isLoadingFromCloud.current = false;
        hasLoaded.current = true;
      }
    };

    loadFromCloud();
  }, [user, isGuest]);

  // Subscribe to store changes and save to cloud (debounced)
  useEffect(() => {
    if (!user || isGuest) return;

    const unsubscribe = useAppStore.subscribe((state) => {
      if (isLoadingFromCloud.current || !hasLoaded.current) return;

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          await supabase
            .from('user_data')
            .update({
              streak: state.streak,
              xp: state.xp,
              level: state.level,
              level_name: state.levelName,
              xp_for_next_level: state.xpForNextLevel,
              onboarding_complete: state.onboardingComplete,
              onboarding_data: state.onboardingData as any,
              daily_discipline: state.dailyDiscipline as any,
              resisted_timestamps: state.resistedTimestamps as any,
              urge_logs: state.urgeLogs as any,
              relapse_logs: state.relapseLogs as any,
              journal_logs: state.journalLogs as any,
              shown_milestones: state.shownMilestones as any,
              pending_milestone: state.pendingMilestone,
            })
            .eq('user_id', user.id);
        } catch (err) {
          console.error('Failed to sync to cloud:', err);
        }
      }, 1500);
    });

    return () => {
      unsubscribe();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [user, isGuest]);
}
