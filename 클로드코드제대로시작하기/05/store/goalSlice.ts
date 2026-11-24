import { StateCreator } from 'zustand';
import { Goal } from '@/types';

export interface GoalSlice {
  goals: Goal[];
  isLoadingGoals: boolean;
  fetchGoals: () => Promise<void>;
  addGoal: (goal: { title: string; description?: string }) => Promise<Goal | null>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const createGoalSlice: StateCreator<GoalSlice, [], [], GoalSlice> = (set, get) => ({
  goals: [],
  isLoadingGoals: false,

  fetchGoals: async () => {
    set({ isLoadingGoals: true });
    try {
      const res = await fetch('/api/goals');
      if (res.ok) {
        const data = await res.json();
        set({ goals: data });
      }
    } catch (e) {
      console.error('Failed to fetch goals:', e);
    } finally {
      set({ isLoadingGoals: false });
    }
  },

  addGoal: async (goalData) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });
      if (res.ok) {
        const newGoal = await res.json();
        set({ goals: [newGoal, ...get().goals] });
        return newGoal;
      }
    } catch (e) {
      console.error('Failed to add goal:', e);
    }
    return null;
  },

  updateGoal: async (id, updates) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        set({
          goals: get().goals.map((g) => (g._id === id ? updated : g)),
        });
      }
    } catch (e) {
      console.error('Failed to update goal:', e);
    }
  },

  deleteGoal: async (id) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        set({
          goals: get().goals.filter((g) => g._id !== id),
        });
      }
    } catch (e) {
      console.error('Failed to delete goal:', e);
    }
  },
});
