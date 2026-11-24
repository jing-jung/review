import { StateCreator } from 'zustand';
import { WeeklyPlan } from '@/types';

export interface WeeklySlice {
  weeklyPlans: WeeklyPlan[];
  currentWeeklyPlan: WeeklyPlan | null;
  isLoadingWeekly: boolean;
  fetchWeeklyPlans: (weekStart?: string) => Promise<void>;
  fetchWeeklyPlanById: (id: string) => Promise<WeeklyPlan | null>;
  setCurrentWeeklyPlan: (plan: WeeklyPlan | null) => void;
  addWeeklyPlan: (plan: {
    weekStart: string;
    goals?: { text: string; done?: boolean }[];
    memo?: string;
    retrospective?: string;
    goalId?: string;
  }) => Promise<WeeklyPlan | null>;
  updateWeeklyPlan: (id: string, updates: Partial<WeeklyPlan>) => Promise<void>;
  toggleWeeklyGoal: (planId: string, goalIndex: number, done: boolean) => Promise<void>;
}

export const createWeeklySlice: StateCreator<WeeklySlice, [], [], WeeklySlice> = (set, get) => ({
  weeklyPlans: [],
  currentWeeklyPlan: null,
  isLoadingWeekly: false,

  fetchWeeklyPlans: async (weekStart?: string) => {
    set({ isLoadingWeekly: true });
    try {
      const url = weekStart ? `/api/weekly?weekStart=${encodeURIComponent(weekStart)}` : '/api/weekly';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        set({ weeklyPlans: data });
        if (!get().currentWeeklyPlan && data.length > 0) {
          set({ currentWeeklyPlan: data[0] });
        }
      }
    } catch (e) {
      console.error('Failed to fetch weekly plans:', e);
    } finally {
      set({ isLoadingWeekly: false });
    }
  },

  fetchWeeklyPlanById: async (id: string) => {
    try {
      const res = await fetch(`/api/weekly/${id}`);
      if (res.ok) {
        const data = await res.json();
        set({ currentWeeklyPlan: data });
        return data;
      }
    } catch (e) {
      console.error('Failed to fetch plan by id:', e);
    }
    return null;
  },

  setCurrentWeeklyPlan: (plan) => set({ currentWeeklyPlan: plan }),

  addWeeklyPlan: async (planData) => {
    try {
      const res = await fetch('/api/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });
      if (res.ok) {
        const newPlan = await res.json();
        set({
          weeklyPlans: [newPlan, ...get().weeklyPlans],
          currentWeeklyPlan: newPlan,
        });
        return newPlan;
      } else if (res.status === 409) {
        alert('해당 주차의 주간 계획이 이미 존재합니다.');
      }
    } catch (e) {
      console.error('Failed to add weekly plan:', e);
    }
    return null;
  },

  updateWeeklyPlan: async (id, updates) => {
    try {
      const res = await fetch(`/api/weekly/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        set({
          weeklyPlans: get().weeklyPlans.map((p) => (p._id === id ? updated : p)),
          currentWeeklyPlan: get().currentWeeklyPlan?._id === id ? updated : get().currentWeeklyPlan,
        });
      }
    } catch (e) {
      console.error('Failed to update weekly plan:', e);
    }
  },

  toggleWeeklyGoal: async (planId, goalIndex, done) => {
    // Optimistic update
    const prevPlans = get().weeklyPlans;
    const prevCurrent = get().currentWeeklyPlan;

    set({
      weeklyPlans: prevPlans.map((p) => {
        if (p._id !== planId) return p;
        const newGoals = [...p.goals];
        if (newGoals[goalIndex]) {
          newGoals[goalIndex] = { ...newGoals[goalIndex], done };
        }
        return { ...p, goals: newGoals };
      }),
      currentWeeklyPlan:
        prevCurrent?._id === planId
          ? {
              ...prevCurrent,
              goals: prevCurrent.goals.map((g, idx) =>
                idx === goalIndex ? { ...g, done } : g
              ),
            }
          : prevCurrent,
    });

    try {
      const res = await fetch(`/api/weekly/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalIndex, done }),
      });
      if (!res.ok) {
        // Rollback
        set({ weeklyPlans: prevPlans, currentWeeklyPlan: prevCurrent });
      }
    } catch (e) {
      set({ weeklyPlans: prevPlans, currentWeeklyPlan: prevCurrent });
      console.error('Failed to toggle goal done:', e);
    }
  },
});
