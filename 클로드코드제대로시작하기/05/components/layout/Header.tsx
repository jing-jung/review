'use client';

import React from 'react';
import { Target, Calendar, CheckSquare, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store';

export const Header: React.FC = () => {
  const { todos, currentWeeklyPlan } = useAppStore();

  const total = todos.length;
  const done = todos.filter((t) => t.status === 'done').length;
  const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <h2 className="text-base font-bold text-slate-800">
          FocusFlow
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
          Goal-Oriented Todo
        </span>
      </div>

      <div className="flex items-center space-x-6">
        {/* Weekly Mini Progress */}
        <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl">
          <CheckSquare size={16} className="text-emerald-500" />
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 space-x-3">
              <span>전체 달성률</span>
              <span className="font-bold text-indigo-600">{progressPercent}%</span>
            </div>
            <div className="w-28 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {currentWeeklyPlan && (
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500">
            <Calendar size={14} className="text-slate-400" />
            <span>이번 주 목표: {currentWeeklyPlan.goals.filter((g) => g.done).length}/{currentWeeklyPlan.goals.length} 달성</span>
          </div>
        )}
      </div>
    </header>
  );
};
