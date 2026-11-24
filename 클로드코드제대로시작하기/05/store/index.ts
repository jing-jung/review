import { create } from 'zustand';
import { createGoalSlice, GoalSlice } from './goalSlice';
import { createWeeklySlice, WeeklySlice } from './weeklySlice';
import { createTodoSlice, TodoSlice } from './todoSlice';

export type RootStore = GoalSlice & WeeklySlice & TodoSlice;

export const useAppStore = create<RootStore>()((...a) => ({
  ...createGoalSlice(...a),
  ...createWeeklySlice(...a),
  ...createTodoSlice(...a),
}));
