import React, { useState } from 'react';
import { Plus, Trash2, Target } from 'lucide-react';
import { Goal, WeeklyPlan } from '@/types';
import { getWeekStart, formatDate } from '@/lib/utils';

interface WeeklyPlanFormProps {
  initialPlan?: WeeklyPlan | null;
  goals: Goal[];
  onSubmit: (data: {
    weekStart: string;
    goals: { text: string; done: boolean }[];
    memo: string;
    retrospective?: string;
    goalId?: string;
  }) => void;
  onCancel: () => void;
}

export const WeeklyPlanForm: React.FC<WeeklyPlanFormProps> = ({
  initialPlan,
  goals,
  onSubmit,
  onCancel,
}) => {
  const [weekStart, setWeekStart] = useState(
    initialPlan ? formatDate(initialPlan.weekStart) : formatDate(getWeekStart())
  );
  const [weeklyGoals, setWeeklyGoals] = useState<string[]>(
    initialPlan ? initialPlan.goals.map((g) => g.text) : ['']
  );
  const [memo, setMemo] = useState(initialPlan?.memo || '');
  const [retrospective, setRetrospective] = useState(initialPlan?.retrospective || '');
  const [selectedGoalId, setSelectedGoalId] = useState(initialPlan?.goalId || '');

  const handleAddGoalInput = () => {
    if (weeklyGoals.length >= 5) {
      alert('주간 목표는 최대 5개까지만 등록 가능합니다.');
      return;
    }
    setWeeklyGoals([...weeklyGoals, '']);
  };

  const handleGoalChange = (index: number, val: string) => {
    const updated = [...weeklyGoals];
    updated[index] = val;
    setWeeklyGoals(updated);
  };

  const handleRemoveGoal = (index: number) => {
    setWeeklyGoals(weeklyGoals.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validGoals = weeklyGoals
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((text) => ({ text, done: false }));

    onSubmit({
      weekStart: new Date(weekStart).toISOString(),
      goals: validGoals,
      memo: memo.trim(),
      retrospective: retrospective.trim(),
      goalId: selectedGoalId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Week Start */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          주차 시작일 (월요일)
        </label>
        <input
          type="date"
          required
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
        />
      </div>

      {/* Linked 1-Year Goal */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
          <Target size={14} className="text-indigo-600" />
          <span>연결할 1년 목표 (방향성)</span>
        </label>
        <select
          value={selectedGoalId}
          onChange={(e) => setSelectedGoalId(e.target.value)}
          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium"
        >
          <option value="">🎯 1년 목표 연결 안 함</option>
          {goals.map((g) => (
            <option key={g._id} value={g._id}>
              {g.title}
            </option>
          ))}
        </select>
      </div>

      {/* Weekly Goals (Max 5) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            이번 주 핵심 목표 (최대 5개)
          </label>
          <span className="text-xs text-slate-400 font-medium">{weeklyGoals.length}/5</span>
        </div>
        <div className="space-y-2">
          {weeklyGoals.map((goalText, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={goalText}
                onChange={(e) => handleGoalChange(index, e.target.value)}
                placeholder={`목표 ${index + 1}`}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
              {weeklyGoals.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveGoal(index)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        {weeklyGoals.length < 5 && (
          <button
            type="button"
            onClick={handleAddGoalInput}
            className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center space-x-1"
          >
            <Plus size={13} />
            <span>목표 추가</span>
          </button>
        )}
      </div>

      {/* Memo */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          주간 메모
        </label>
        <textarea
          rows={2}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="이번 주의 중요한 다짐이나 주의사항을 메모하세요."
          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
        />
      </div>

      {/* Retrospective (P1) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          주간 회고 (P1)
        </label>
        <textarea
          rows={2}
          value={retrospective}
          onChange={(e) => setRetrospective(e.target.value)}
          placeholder="한 주를 마무리하며 잘한 점과 개선할 점을 적어보세요."
          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
        />
      </div>

      <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
        >
          {initialPlan ? '수정 완료' : '주간 계획 생성'}
        </button>
      </div>
    </form>
  );
};
