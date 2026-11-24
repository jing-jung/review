'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { getWeekStart, formatWeekRange } from '@/lib/utils';
import { ProgressBar } from '@/components/weekly/ProgressBar';
import { TodoModal } from '@/components/todos/TodoModal';
import { GoalProgress } from '@/components/goals/GoalProgress';

export default function DashboardPage() {
  const {
    goals,
    weeklyPlans,
    todos,
    currentWeeklyPlan,
    fetchGoals,
    fetchWeeklyPlans,
    fetchTodos,
    toggleWeeklyGoal,
    addTodo,
    updateTodo,
  } = useAppStore();

  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);

  useEffect(() => {
    fetchGoals();
    fetchWeeklyPlans();
    fetchTodos();
  }, [fetchGoals, fetchWeeklyPlans, fetchTodos]);

  // 이번 주 계획 식별 (현재 주차)
  const currentMonday = getWeekStart().toISOString();
  const activePlan =
    currentWeeklyPlan ||
    weeklyPlans.find((p) => new Date(p.weekStart).getTime() === new Date(currentMonday).getTime()) ||
    weeklyPlans[0];

  const weekTodos = activePlan
    ? todos.filter((t) => t.weeklyPlanId === activePlan._id)
    : todos;

  const todoCount = weekTodos.filter((t) => t.status === 'todo').length;
  const doingCount = weekTodos.filter((t) => t.status === 'doing').length;
  const doneCount = weekTodos.filter((t) => t.status === 'done').length;
  const totalCount = weekTodos.length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const weeklyGoalDoneCount = activePlan?.goals.filter((g) => g.done).length || 0;
  const weeklyGoalTotalCount = activePlan?.goals.length || 0;
  const weeklyGoalProgress = weeklyGoalTotalCount > 0
    ? Math.round((weeklyGoalDoneCount / weeklyGoalTotalCount) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-indigo-100 border border-white/20">
            <Sparkles size={13} className="text-amber-300" />
            <span>
              {activePlan ? formatWeekRange(activePlan.weekStart) : '이번 주 계획'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            방향성과 실행을 한눈에 파악하세요
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed">
            1년 장기 목표 ➔ 이번 주 핵심 계획 ➔ 일일 할 일이 유기적으로 연결된 스마트 대시보드입니다.
          </p>
        </div>

        {/* Status Count Badges */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
            <span className="text-[11px] text-indigo-200 block">할 일 (Todo)</span>
            <span className="text-2xl font-extrabold mt-1 block">{todoCount}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
            <span className="text-[11px] text-indigo-200 block">진행 중 (Doing)</span>
            <span className="text-2xl font-extrabold mt-1 block">{doingCount}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
            <span className="text-[11px] text-indigo-200 block">완료됨 (Done)</span>
            <span className="text-2xl font-extrabold mt-1 block">{doneCount}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Weekly Goals & Current Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Weekly Plan & Goals Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Target size={20} className="text-indigo-600" />
                <h2 className="text-base font-bold text-slate-800">이번 주 핵심 목표</h2>
              </div>
              <Link
                href="/weekly"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
              >
                <span>주간 플래너 전체보기</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {activePlan && activePlan.goals.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {activePlan.goals.map((g, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleWeeklyGoal(activePlan._id, idx, !g.done)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        g.done
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle2
                          size={18}
                          className={g.done ? 'text-emerald-500' : 'text-slate-300'}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            g.done ? 'line-through text-slate-400 font-normal' : 'text-slate-800'
                          }`}
                        >
                          {g.text}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {g.done ? '완료됨' : '진행 중'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <ProgressBar progress={weeklyGoalProgress} label="주간 목표 달성률" />
                </div>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center">
                <p className="text-xs text-slate-400">이번 주 목표가 등록되지 않았습니다.</p>
                <Link
                  href="/weekly"
                  className="mt-2 text-xs font-medium text-indigo-600 hover:underline inline-block"
                >
                  주간 계획 수립하기 →
                </Link>
              </div>
            )}
          </div>

          {/* Section 2: Tasks Action List */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CheckSquare size={20} className="text-indigo-600" />
                <h2 className="text-base font-bold text-slate-800">실행 중 & 대기 중인 할 일</h2>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsTodoModalOpen(true)}
                  className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                >
                  <Plus size={14} />
                  <span>할 일 추가</span>
                </button>
                <Link
                  href="/todos"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                >
                  <span>칸반 보드</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              {weekTodos
                .filter((t) => t.status !== 'done')
                .slice(0, 6)
                .map((todo) => {
                  const linkedGoal = goals.find((g) => g._id === todo.goalId);
                  return (
                    <div
                      key={todo._id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition group"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <button
                          onClick={() => updateTodo(todo._id, { status: 'done' })}
                          className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-emerald-500 transition"
                          title="완료로 변경"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                            {todo.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            {linkedGoal && (
                              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                                🎯 {linkedGoal.title}
                              </span>
                            )}
                            {todo.dueDate && (
                              <span className="text-[11px] text-slate-400 flex items-center space-x-0.5">
                                <Clock size={10} />
                                <span>{todo.dueDate}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          todo.status === 'doing'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {todo.status === 'doing' ? '진행 중' : '대기'}
                      </span>
                    </div>
                  );
                })}

              {weekTodos.filter((t) => t.status !== 'done').length === 0 && (
                <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center">
                  <p className="text-xs text-slate-400">진행 중이거나 대기 중인 할 일이 없습니다!</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    이번 주 할 일을 모두 완료했습니다 🎉
                  </p>
                </div>
              )}
            </div>

            {/* Weekly Overall Progress Bar */}
            <div className="pt-4 mt-4 border-t border-slate-100">
              <ProgressBar progress={progressPercent} label="주간 전체 할 일 달성률" />
            </div>
          </div>
        </div>

        {/* Right 1 Col: 1-Year Goals & Linked Tasks Count */}
        <div className="space-y-6">
          {/* 1-Year Goals Progress */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Target size={20} className="text-indigo-600" />
                <h2 className="text-base font-bold text-slate-800">1년 목표별 연결 현황</h2>
              </div>
              <Link
                href="/goals"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
              >
                <span>목표 관리</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="space-y-4">
              {goals.map((g) => {
                const linkedThisWeek = weekTodos.filter((t) => t.goalId === g._id);
                const doneThisWeek = linkedThisWeek.filter((t) => t.status === 'done');

                return (
                  <div key={g._id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 truncate max-w-[170px]">
                        {g.title}
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        이번 주 {linkedThisWeek.length}건 연결
                      </span>
                    </div>

                    <GoalProgress progress={g.progress} />

                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>이번 주 완료: {doneThisWeek.length}/{linkedThisWeek.length}</span>
                      <span>전체 누적 완료율 {g.progress}%</span>
                    </div>
                  </div>
                );
              })}

              {goals.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">등록된 1년 목표가 없습니다.</p>
              )}
            </div>
          </div>

          {/* Memo Widget */}
          {activePlan?.memo && (
            <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/80 shadow-sm">
              <h3 className="text-xs font-bold text-amber-900 mb-1.5 flex items-center space-x-1">
                <span>📌 이번 주 메모</span>
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-wrap">
                {activePlan.memo}
              </p>
            </div>
          )}
        </div>
      </div>

      <TodoModal
        isOpen={isTodoModalOpen}
        onClose={() => setIsTodoModalOpen(false)}
        goals={goals}
        weeklyPlans={weeklyPlans}
        onSubmit={addTodo}
      />
    </div>
  );
}
