import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Todo, TodoStatus, Goal } from '@/types';
import { TodoCard } from './TodoCard';

interface KanbanColumnProps {
  id: TodoStatus;
  title: string;
  todos: Todo[];
  goals: Goal[];
  onAddTodo: (status: TodoStatus) => void;
  onEditTodo: (todo: Todo) => void;
  onDeleteTodo: (id: string, title: string) => void;
  onToggleStatus: (todo: Todo) => void;
  accentColor: string;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  todos,
  goals,
  onAddTodo,
  onEditTodo,
  onDeleteTodo,
  onToggleStatus,
  accentColor,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { status: id },
  });

  return (
    <div className="flex flex-col bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80 min-h-[550px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${accentColor}`} />
          <h3 className="font-bold text-sm text-slate-800">{title}</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
            {todos.length}
          </span>
        </div>
        <button
          onClick={() => onAddTodo(id)}
          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition"
          title={`${title}에 추가`}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Sortable Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2.5 p-1 rounded-xl transition min-h-[150px] ${
          isOver ? 'bg-indigo-50/50 ring-2 ring-indigo-300 ring-dashed' : ''
        }`}
      >
        <SortableContext
          items={todos.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {todos.map((todo) => (
            <TodoCard
              key={todo._id}
              todo={todo}
              goals={goals}
              onEdit={onEditTodo}
              onDelete={onDeleteTodo}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </SortableContext>

        {todos.length === 0 && !isOver && (
          <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl text-center p-4">
            <p className="text-xs text-slate-400">카드가 없습니다</p>
            <button
              onClick={() => onAddTodo(id)}
              className="mt-2 text-xs text-indigo-600 hover:underline font-medium"
            >
              + 할 일 추가
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
