'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CalendarDays,
  Target,
  ArrowLeft,
  StickyNote,
  MessageSquareQuote,
  Plus,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatWeekRange } from '@/lib/utils';
import { WeeklyGoalItem } from '@/components/weekly/WeeklyGoalItem';
import { WeekGrid } from '@/components/weekly/WeekGrid';
import { ProgressBar } from '@/components/weekly/ProgressBar';
import { TodoModal } from '@/components/todos/TodoModal';
import { Todo } from '@/types';

export default function WeeklyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const {
    currentWeeklyPlan,
    goals,
    todos,
    weeklyPlans,
    fetchWeeklyPlanById,
    fetchGoals,
    fetchTodos,
    toggleWeeklyGoal,
    updateWeeklyPlan,
    addTodo,
    updateTodo,
  } = useAppStore();

  const [memo, setMemo] = useState('');
  const [retrospective, setRetrospective] = useState('');
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(1);

  useEffect(() => {
    if (id) {
      fetchWeeklyPlanById(id);
    }
    fetchGoals();
    fetchTodos({ weeklyPlanId: id });
  }, [id, fetchWeeklyPlanById, fetchGoals, fetchTodos]);

  useEffect(() => {
    if (currentWeeklyPlan) {
      setMemo(currentWeeklyPlan.memo || '');
      setRetrospective(currentWeeklyPlan.retrospective || '');
    }
  }, [currentWeeklyPlan]);

  if (!currentWeeklyPlan) {
    return (
      <div className="p-12 text-center text-slate-400">
        주간 계획을 불러오는 중이거나 찾을 수 없습니다...
      </div>
    );
  }

  const linkedGoal = goals.find((g) => g._id === currentWeeklyPlan.goalId);
  const planTodos = todos.filter((t) => t.weeklyPlanId === id);

  const doneGoalsCount = currentWeeklyPlan.goals.filter((g) => g.done).length;
  const goalProgress = currentWeeklyPlan.goals.length > 0
    ? Math.round((doneGoalsCount / currentWeeklyPlan.goals.length) * 100)
    : 0;

  const handleSaveMemo = () => {
    updateWeeklyPlan(id, { memo });
  };

  const handleSaveRetro = () => {
    updateWeeklyPlan(id, { retrospective });
  };

  const handleSelectDay = (day: number) => {
    setEditingTodo(null);
    setSelectedDayOfWeek(day);
    setIsTodoModalOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setSelectedDayOfWeek(todo.dayOfWeek !== undefined ? todo.dayOfWeek : 1);
    setIsTodoModalOpen(true);
  };

  const handleSaveTodo = (data: Partial<Todo> & { title: string }) => {
    if (editingTodo) {
      updateTodo(editingTodo._id, data);
    } else {
      addTodo({
        ...data,
        weeklyPlanId: id,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/weekly')}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition"
          >
            <ArrowLeft size={14} />
            <span>주간 목록으로 돌아가기</span>
          </button>
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <CalendarDays size={22} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {formatWeekRange(currentWeeklyPlan.weekStart)} 주간 플래너
              </h1>
              {linkedGoal && (
                <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                  🎯 연결된 1년 목표: {linkedGoal.title}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="w-48">
          <ProgressBar progress={goalProgress} label="주간 목표 달성률" />
        </div>
      </div>

      {/* 2-Columns: Left (Goals & Memo & Retro) / Right (7-Day Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Goals & Notes */}
        <div className="space-y-6 lg:col-span-1">
          {/* Section 1: Weekly Goals Checklist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target size={18} className="text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-800">이번 주 핵심 목표</h3>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {doneGoalsCount}/{currentWeeklyPlan.goals.length}
              </span>
            </div>

            <div className="space-y-2">
              {currentWeeklyPlan.goals.map((item, idx) => (
                <WeeklyGoalItem
                  key={idx}
                  item={item}
                  onToggle={(done) => toggleWeeklyGoal(id, idx, done)}
                />
              ))}
              {currentWeeklyPlan.goals.length === 0 && (
                <p className="text-xs text-slate-400 py-2">등록된 주간 목표가 없습니다.</p>
              )}
            </div>
          </div>

          {/* Section 2: Weekly Memo */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StickyNote size={17} className="text-amber-500" />
                <h3 className="font-bold text-sm text-slate-800">주간 메모</h3>
              </div>
              <button
                onClick={handleSaveMemo}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                저장
              </button>
            </div>
            <textarea
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              onBlur={handleSaveMemo}
              placeholder="이번 주의 중요 일정이나 다짐을 기록하세요."
              className="w-full p-3 bg-amber-50/30 border border-amber-200/80 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition resize-none leading-relaxed"
            />
          </div>

          {/* Section 3: Weekly Retrospective (P1) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquareQuote size={17} className="text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-800">주간 회고 (P1)</h3>
              </div>
              <button
                onClick={handleSaveRetro}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                저장
              </button>
            </div>
            <textarea
              rows={3}
              value={retrospective}
              onChange={(e) => setRetrospective(e.target.value)}
              onBlur={handleSaveRetro}
              placeholder="한 주를 마치며 잘한 점(Keep), 아쉬운 점(Problem), 다음 주 시도할 점(Try)을 기록하세요."
              className="w-full p-3 bg-indigo-50/20 border border-indigo-200/80 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column: 7-Day Grid */}
        <div className="space-y-4 lg:col-span-2">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">요일별 할 일 배치 (7열 그리드)</h2>
            <button
              onClick={() => handleSelectDay(1)}
              className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
            >
              <Plus size={14} />
              <span>할 일 추가</span>
            </button>
          </div>

          <WeekGrid
            todos={planTodos}
            onSelectDay={handleSelectDay}
            onEditTodo={handleEditTodo}
          />
        </div>
      </div>

      <TodoModal
        isOpen={isTodoModalOpen}
        onClose={() => setIsTodoModalOpen(false)}
        initialTodo={editingTodo}
        defaultDayOfWeek={selectedDayOfWeek}
        goals={goals}
        weeklyPlans={weeklyPlans}
        onSubmit={handleSaveTodo}
      />
    </div>
  );
}
