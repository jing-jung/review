'use client';

import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, Search, Filter } from 'lucide-react';
import { useAppStore } from '@/store';
import { Todo, TodoStatus } from '@/types';
import { getOrderBetween } from '@/lib/fractionalIndex';
import { KanbanColumn } from './KanbanColumn';
import { TodoCard } from './TodoCard';
import { TodoModal } from './TodoModal';

export const KanbanBoard: React.FC = () => {
  const {
    todos,
    goals,
    weeklyPlans,
    addTodo,
    updateTodo,
    deleteTodo,
    reorderTodo,
  } = useAppStore();

  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TodoStatus>('todo');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 1. Filter
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = todo.title.toLowerCase().includes(query);
        const matchesDesc = todo.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      if (selectedGoalId !== 'all' && todo.goalId !== selectedGoalId) {
        return false;
      }
      if (selectedPriority !== 'all' && todo.priority !== selectedPriority) {
        return false;
      }
      return true;
    });
  }, [todos, searchQuery, selectedGoalId, selectedPriority]);

  // 2. Sort by order
  // P1: 우선순위 High 상단 정렬 및 order 사전순 결합
  const sortTodos = (list: Todo[]) => {
    return [...list].sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return a.order.localeCompare(b.order);
    });
  };

  const todoList = useMemo(
    () => sortTodos(filteredTodos.filter((t) => t.status === 'todo')),
    [filteredTodos]
  );
  const doingList = useMemo(
    () => sortTodos(filteredTodos.filter((t) => t.status === 'doing')),
    [filteredTodos]
  );
  const doneList = useMemo(
    () => sortTodos(filteredTodos.filter((t) => t.status === 'done')),
    [filteredTodos]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = todos.find((t) => t._id === active.id);
    if (found) {
      setActiveTodo(found);
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // dnd-kit visual feedback
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTodo(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const draggedTodo = todos.find((t) => t._id === activeId);
    if (!draggedTodo) return;

    // Check if target is a column id ('todo' | 'doing' | 'done') or another card
    const isOverColumn = ['todo', 'doing', 'done'].includes(overId);
    let targetStatus: TodoStatus = draggedTodo.status;
    let targetList: Todo[] = [];

    if (isOverColumn) {
      targetStatus = overId as TodoStatus;
      targetList = todos.filter((t) => t.status === targetStatus && t._id !== activeId);
    } else {
      const overTodo = todos.find((t) => t._id === overId);
      if (overTodo) {
        targetStatus = overTodo.status;
        targetList = todos.filter((t) => t.status === targetStatus && t._id !== activeId);
      }
    }

    // fractional-indexing key calculation
    let newOrder = draggedTodo.order;

    if (isOverColumn) {
      // 빈 컬럼 또는 컬럼 맨 끝에 추가
      const lastOrder = targetList.length > 0 ? targetList[targetList.length - 1].order : null;
      newOrder = getOrderBetween(lastOrder, null);
    } else {
      const overIndex = targetList.findIndex((t) => t._id === overId);
      if (overIndex === -1) {
        const lastOrder = targetList.length > 0 ? targetList[targetList.length - 1].order : null;
        newOrder = getOrderBetween(lastOrder, null);
      } else {
        const prevOrder = overIndex > 0 ? targetList[overIndex - 1].order : null;
        const nextOrder = targetList[overIndex].order;
        newOrder = getOrderBetween(prevOrder, nextOrder);
      }
    }

    // 상태 또는 순서가 변경된 경우 단 1회의 PATCH로 완결
    if (draggedTodo.status !== targetStatus || draggedTodo.order !== newOrder) {
      reorderTodo(activeId, targetStatus, newOrder);
    }
  };

  const handleOpenAdd = (status: TodoStatus = 'todo') => {
    setEditingTodo(null);
    setDefaultStatus(status);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`'${title}' 할 일을 삭제하시겠습니까?`)) {
      deleteTodo(id);
    }
  };

  const handleToggleStatus = (todo: Todo) => {
    const nextStatus: TodoStatus = todo.status === 'done' ? 'todo' : 'done';
    updateTodo(todo._id, { status: nextStatus });
  };

  const handleSaveTodo = (todoData: Partial<Todo> & { title: string }) => {
    if (editingTodo) {
      updateTodo(editingTodo._id, todoData);
    } else {
      addTodo(todoData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="할 일 검색..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* Goal Filter */}
          <div className="flex items-center space-x-1">
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="all">🎯 모든 목표 보기</option>
              {goals.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-1">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="all">🚩 우선순위 전체</option>
              <option value="high">높음 (High)</option>
              <option value="medium">중간 (Medium)</option>
              <option value="low">낮음 (Low)</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => handleOpenAdd('todo')}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition shrink-0"
        >
          <Plus size={18} />
          <span>할 일 추가</span>
        </button>
      </div>

      {/* Kanban DnD Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KanbanColumn
            id="todo"
            title="할 일 (Todo)"
            todos={todoList}
            goals={goals}
            onAddTodo={handleOpenAdd}
            onEditTodo={handleOpenEdit}
            onDeleteTodo={handleDelete}
            onToggleStatus={handleToggleStatus}
            accentColor="bg-slate-400"
          />
          <KanbanColumn
            id="doing"
            title="진행 중 (Doing)"
            todos={doingList}
            goals={goals}
            onAddTodo={handleOpenAdd}
            onEditTodo={handleOpenEdit}
            onDeleteTodo={handleDelete}
            onToggleStatus={handleToggleStatus}
            accentColor="bg-blue-500"
          />
          <KanbanColumn
            id="done"
            title="완료 (Done)"
            todos={doneList}
            goals={goals}
            onAddTodo={handleOpenAdd}
            onEditTodo={handleOpenEdit}
            onDeleteTodo={handleDelete}
            onToggleStatus={handleToggleStatus}
            accentColor="bg-emerald-500"
          />
        </div>

        <DragOverlay>
          {activeTodo ? (
            <TodoCard
              todo={activeTodo}
              goals={goals}
              onEdit={() => {}}
              onDelete={() => {}}
              onToggleStatus={() => {}}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTodo={editingTodo}
        defaultStatus={defaultStatus}
        goals={goals}
        weeklyPlans={weeklyPlans}
        onSubmit={handleSaveTodo}
      />
    </div>
  );
};
