import React, { useState, useEffect } from 'react';
import { Target, Calendar, Flag, AlignLeft } from 'lucide-react';
import { Todo, Goal, WeeklyPlan, TodoStatus, TodoPriority } from '@/types';

interface TodoFormProps {
  initialTodo?: Todo | null;
  defaultStatus?: TodoStatus;
  defaultDayOfWeek?: number;
  goals: Goal[];
  weeklyPlans: WeeklyPlan[];
  onSubmit: (data: Partial<Todo> & { title: string }) => void;
  onCancel: () => void;
}

const DAY_OPTIONS = [
  { value: -1, label: '요일 미지정' },
  { value: 1, label: '월요일' },
  { value: 2, label: '화요일' },
  { value: 3, label: '수요일' },
  { value: 4, label: '목요일' },
  { value: 5, label: '금요일' },
  { value: 6, label: '토요일' },
  { value: 0, label: '일요일' },
];

export const TodoForm: React.FC<TodoFormProps> = ({
  initialTodo,
  defaultStatus = 'todo',
  defaultDayOfWeek,
  goals,
  weeklyPlans,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TodoStatus>(defaultStatus);
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(
    defaultDayOfWeek !== undefined ? defaultDayOfWeek : -1
  );
  const [goalId, setGoalId] = useState('');
  const [weeklyPlanId, setWeeklyPlanId] = useState('');

  useEffect(() => {
    if (initialTodo) {
      setTitle(initialTodo.title);
      setDescription(initialTodo.description || '');
      setStatus(initialTodo.status);
      setPriority(initialTodo.priority);
      setDueDate(initialTodo.dueDate || '');
      setDayOfWeek(initialTodo.dayOfWeek !== undefined ? initialTodo.dayOfWeek : -1);
      setGoalId(initialTodo.goalId || '');
      setWeeklyPlanId(initialTodo.weeklyPlanId || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setDueDate('');
      setDayOfWeek(defaultDayOfWeek !== undefined ? defaultDayOfWeek : -1);
      setGoalId(goals[0]?._id || '');
      setWeeklyPlanId(weeklyPlans[0]?._id || '');
    }
  }, [initialTodo, defaultStatus, defaultDayOfWeek, goals, weeklyPlans]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate || undefined,
      dayOfWeek: dayOfWeek === -1 ? undefined : dayOfWeek,
      goalId: goalId || undefined,
      weeklyPlanId: weeklyPlanId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          할 일 제목 <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 칸반 보드 드래그앤드롭 완성"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
          <AlignLeft size={13} />
          <span>상세 설명 (선택)</span>
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="메모나 실행 세부 항목을 입력하세요."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
        />
      </div>

      {/* Linked 1-Year Goal */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
          <Target size={13} className="text-indigo-600" />
          <span>연결할 1년 목표 (방향성)</span>
        </label>
        <select
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium"
        >
          <option value="">🎯 연결 안 함 (단순 일상 할일)</option>
          {goals.map((g) => (
            <option key={g._id} value={g._id}>
              🎯 {g.title}
            </option>
          ))}
        </select>
      </div>

      {/* Status & Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            상태
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TodoStatus)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          >
            <option value="todo">할 일 (Todo)</option>
            <option value="doing">진행 중 (Doing)</option>
            <option value="done">완료 (Done)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
            <Flag size={13} />
            <span>우선순위 (P1)</span>
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TodoPriority)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          >
            <option value="high">높음 (High)</option>
            <option value="medium">중간 (Medium)</option>
            <option value="low">낮음 (Low)</option>
          </select>
        </div>
      </div>

      {/* Due Date & Day of Week */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
            <Calendar size={13} />
            <span>마감일 (P1)</span>
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            배치 요일
          </label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          >
            {DAY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
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
          {initialTodo ? '수정 완료' : '할 일 추가'}
        </button>
      </div>
    </form>
  );
};
