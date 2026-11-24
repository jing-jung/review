import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, CheckCircle2, Circle, Edit3, Trash2, GripVertical } from 'lucide-react';
import { Todo, Goal } from '@/types';
import { PriorityBadge } from '../shared/PriorityBadge';

interface TodoCardProps {
  todo: Todo;
  goals: Goal[];
  onEdit: (todo: Todo) => void;
  onDelete: (id: string, title: string) => void;
  onToggleStatus: (todo: Todo) => void;
  isOverlay?: boolean;
}

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  goals,
  onEdit,
  onDelete,
  onToggleStatus,
  isOverlay = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo._id,
    data: { todo },
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const linkedGoal = goals.find((g) => g._id === todo.goalId);
  const isDone = todo.status === 'done';

  // 마감일 경고 (P1: 오늘 이전 날짜 경고)
  const isOverdue =
    todo.dueDate &&
    !isDone &&
    new Date(todo.dueDate).setHours(23, 59, 59, 999) < new Date().getTime();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl p-3.5 border transition select-none group relative ${
        isDragging ? 'opacity-40 ring-2 ring-indigo-500/40 border-indigo-400' : 'border-slate-200 shadow-2xs hover:shadow-sm'
      } ${isDone ? 'bg-slate-50/60 opacity-80' : ''} ${
        isOverlay ? 'shadow-xl ring-2 ring-indigo-500 scale-102 cursor-grabbing' : ''
      }`}
    >
      {/* Header: Goal Tag & Quick Toggle */}
      <div className="flex items-start justify-between gap-1.5 mb-2">
        <div className="flex items-center space-x-1 flex-1 min-w-0">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-0.5 rounded transition -ml-1"
            title="드래그하여 이동"
          >
            <GripVertical size={14} />
          </button>

          {linkedGoal ? (
            <span
              className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded truncate max-w-[130px]"
              title={`1년 목표: ${linkedGoal.title}`}
            >
              🎯 {linkedGoal.title}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">일반 할일</span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(todo);
          }}
          className={`p-0.5 transition ${
            isDone ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-slate-500'
          }`}
        >
          {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
        </button>
      </div>

      {/* Title */}
      <h4
        className={`text-xs font-semibold text-slate-800 leading-snug mb-1.5 ${
          isDone ? 'line-through text-slate-400 font-normal' : ''
        }`}
      >
        {todo.title}
      </h4>

      {/* Description */}
      {todo.description && (
        <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
          {todo.description}
        </p>
      )}

      {/* Footer: Priority & DueDate & Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-1.5">
          <PriorityBadge priority={todo.priority} size="sm" />

          {todo.dueDate && (
            <span
              className={`inline-flex items-center space-x-0.5 text-[10px] font-medium ${
                isOverdue ? 'text-rose-600 font-bold' : 'text-slate-400'
              }`}
              title={isOverdue ? '마감일 경과!' : `마감일: ${todo.dueDate}`}
            >
              <Clock size={11} className={isOverdue ? 'text-rose-500' : 'text-slate-400'} />
              <span>{todo.dueDate.slice(5)}</span>
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(todo)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
            title="수정"
          >
            <Edit3 size={13} />
          </button>
          <button
            onClick={() => onDelete(todo._id, todo.title)}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
            title="삭제"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
