import React from 'react';
import { Modal } from '../shared/Modal';
import { TodoForm } from './TodoForm';
import { Todo, Goal, WeeklyPlan, TodoStatus } from '@/types';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTodo?: Todo | null;
  defaultStatus?: TodoStatus;
  defaultDayOfWeek?: number;
  goals: Goal[];
  weeklyPlans: WeeklyPlan[];
  onSubmit: (data: Partial<Todo> & { title: string }) => void;
}

export const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  initialTodo,
  defaultStatus,
  defaultDayOfWeek,
  goals,
  weeklyPlans,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTodo ? '할 일 수정' : '새로운 할 일 등록'}
    >
      <TodoForm
        initialTodo={initialTodo}
        defaultStatus={defaultStatus}
        defaultDayOfWeek={defaultDayOfWeek}
        goals={goals}
        weeklyPlans={weeklyPlans}
        onSubmit={(data) => {
          onSubmit(data);
          onClose();
        }}
        onCancel={onClose}
      />
    </Modal>
  );
};
