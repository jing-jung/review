import React from 'react';
import { Plus, Clock } from 'lucide-react';
import { Todo } from '@/types';
import { PriorityBadge } from '../shared/PriorityBadge';

interface WeekGridProps {
  todos: Todo[];
  onSelectDay: (dayOfWeek: number) => void;
  onEditTodo: (todo: Todo) => void;
}

const DAY_NAMES = [
  { day: 1, label: '월요일' },
  { day: 2, label: '화요일' },
  { day: 3, label: '수요일' },
  { day: 4, label: '목요일' },
  { day: 5, label: '금요일' },
  { day: 6, label: '토요일', isWeekend: true },
  { day: 0, label: '일요일', isWeekend: true },
];

export const WeekGrid: React.FC<WeekGridProps> = ({ todos, onSelectDay, onEditTodo }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
      {DAY_NAMES.map(({ day, label, isWeekend }) => {
        const dayTodos = todos.filter((t) => t.dayOfWeek === day);
        const doneCount = dayTodos.filter((t) => t.status === 'done').length;

        return (
          <div
            key={day}
            className={`bg-white rounded-2xl border p-3 flex flex-col justify-between min-h-[220px] transition hover:shadow-sm ${
              isWeekend ? 'border-amber-100 bg-amber-50/20' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`font-bold text-xs ${
                      isWeekend ? 'text-amber-700' : 'text-slate-800'
                    }`}
                  >
                    {label}
                  </span>
                  <span className="text-[10px] px-1 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {doneCount}/{dayTodos.length}
                  </span>
                </div>
                <button
                  onClick={() => onSelectDay(day)}
                  className="p-0.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition"
                  title={`${label}에 할 일 배치`}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Tasks List */}
              <div className="space-y-1.5">
                {dayTodos.map((todo) => {
                  const isDone = todo.status === 'done';
                  return (
                    <div
                      key={todo._id}
                      onClick={() => onEditTodo(todo)}
                      className={`p-2 rounded-xl border text-[11px] cursor-pointer transition hover:border-slate-300 ${
                        isDone
                          ? 'bg-slate-50 border-slate-200 line-through text-slate-400'
                          : 'bg-white border-slate-200 shadow-2xs text-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-semibold line-clamp-2 leading-tight">
                          {todo.title}
                        </span>
                        <PriorityBadge priority={todo.priority} size="sm" />
                      </div>
                      {todo.dueDate && (
                        <span className="text-[10px] text-slate-400 flex items-center space-x-0.5">
                          <Clock size={10} />
                          <span>{todo.dueDate.slice(5)}</span>
                        </span>
                      )}
                    </div>
                  );
                })}

                {dayTodos.length === 0 && (
                  <div
                    onClick={() => onSelectDay(day)}
                    className="h-20 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl text-center cursor-pointer hover:bg-slate-50/50 transition"
                  >
                    <span className="text-[10px] text-slate-400">+ 할일 배치</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
