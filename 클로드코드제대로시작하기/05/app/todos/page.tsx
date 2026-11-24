'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { KanbanSquare } from 'lucide-react';
import { useAppStore } from '@/store';

// dnd-kit SSR 이슈 방지를 위한 dynamic import
const KanbanBoard = dynamic(
  () => import('@/components/todos/KanbanBoard').then((mod) => mod.KanbanBoard),
  { ssr: false }
);

export default function TodosPage() {
  const { fetchTodos, fetchGoals, fetchWeeklyPlans } = useAppStore();

  useEffect(() => {
    fetchTodos();
    fetchGoals();
    fetchWeeklyPlans();
  }, [fetchTodos, fetchGoals, fetchWeeklyPlans]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <KanbanSquare size={24} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">할 일 칸반 보드</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            드래그 앤 드롭으로 할 일의 상태를 변경하고, 우선순위 및 1년 목표별로 필터링하여 실행하세요.
          </p>
        </div>
      </div>

      <KanbanBoard />
    </div>
  );
}
