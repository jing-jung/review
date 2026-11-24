import { StateCreator } from 'zustand';
import { Todo, TodoStatus } from '@/types';

export interface TodoSlice {
  todos: Todo[];
  isLoadingTodos: boolean;
  fetchTodos: (params?: { weeklyPlanId?: string; goalId?: string; status?: string }) => Promise<void>;
  addTodo: (todo: Partial<Todo> & { title: string }) => Promise<Todo | null>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  reorderTodo: (id: string, newStatus: TodoStatus, newOrder: string) => Promise<void>;
}

export const createTodoSlice: StateCreator<TodoSlice, [], [], TodoSlice> = (set, get) => ({
  todos: [],
  isLoadingTodos: false,

  fetchTodos: async (params) => {
    set({ isLoadingTodos: true });
    try {
      const sp = new URLSearchParams();
      if (params?.weeklyPlanId) sp.set('weeklyPlanId', params.weeklyPlanId);
      if (params?.goalId) sp.set('goalId', params.goalId);
      if (params?.status) sp.set('status', params.status);

      const res = await fetch(`/api/todos?${sp.toString()}`);
      if (res.ok) {
        const data = await res.json();
        set({ todos: data });
      }
    } catch (e) {
      console.error('Failed to fetch todos:', e);
    } finally {
      set({ isLoadingTodos: false });
    }
  },

  addTodo: async (todoData) => {
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      });
      if (res.ok) {
        const newTodo = await res.json();
        set({ todos: [...get().todos, newTodo] });
        return newTodo;
      }
    } catch (e) {
      console.error('Failed to add todo:', e);
    }
    return null;
  },

  updateTodo: async (id, updates) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        set({
          todos: get().todos.map((t) => (t._id === id ? updated : t)),
        });
      }
    } catch (e) {
      console.error('Failed to update todo:', e);
    }
  },

  deleteTodo: async (id) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        set({
          todos: get().todos.filter((t) => t._id !== id),
        });
      }
    } catch (e) {
      console.error('Failed to delete todo:', e);
    }
  },

  // Optimistic update + PATCH 1회 호출 + 에러 시 롤백
  reorderTodo: async (id, newStatus, newOrder) => {
    const prevTodos = get().todos;

    // 1. Optimistic update
    set({
      todos: prevTodos.map((t) =>
        t._id === id ? { ...t, status: newStatus, order: newOrder } : t
      ),
    });

    try {
      // 2. 단 1회 PATCH 요청 발생
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, order: newOrder }),
      });

      if (!res.ok) {
        // 3. 실패 시 롤백
        set({ todos: prevTodos });
      }
    } catch (e) {
      // 3. 실패 시 롤백
      set({ todos: prevTodos });
      console.error('Failed to reorder todo:', e);
    }
  },
});
