import React from 'react';
import { TodoPriority } from '@/types';

interface PriorityBadgeProps {
  priority: TodoPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'sm' }) => {
  const styles: Record<TodoPriority, string> = {
    high: 'bg-rose-50 text-rose-700 border-rose-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const labels: Record<TodoPriority, string> = {
    high: '높음',
    medium: '중간',
    low: '낮음',
  };

  const sizeStyle = size === 'sm' ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center font-medium border rounded ${styles[priority]} ${sizeStyle}`}>
      {labels[priority]}
    </span>
  );
};
