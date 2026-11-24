export type TodoStatus = 'todo' | 'doing' | 'done';
export type TodoPriority = 'high' | 'medium' | 'low';

export interface Goal {
  _id: string;
  title: string;
  description: string;
  progress: number; // 0-100 (P1 — 연결된 todo 완료율 자동 계산)
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyGoalItem {
  _id?: string;
  text: string;
  done: boolean;
}

export interface WeeklyPlan {
  _id: string;
  weekStart: string; // ISO Date String
  goals: WeeklyGoalItem[]; // 완료 추적 서브도큐먼트 (최대 5개)
  memo: string;
  retrospective?: string; // P1
  goalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority; // P1
  dueDate?: string; // P1 (YYYY-MM-DD)
  dayOfWeek?: number; // 0(일)~6(토)
  order: string; // fractional index 문자열 (예: "a0", "a1", "Zz")
  weeklyPlanId?: string;
  goalId?: string;
  createdAt: string;
  updatedAt: string;
}
