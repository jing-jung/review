import React from 'react';
import { TodoStatus } from '@/types';

interface BadgeProps {
  status: TodoStatus;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  const config = {
    todo: { label: '할 일', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    doing: { label: '진행 중', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    done: { label: '완료', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };

  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${config[status].bg}`}>
      {config[status].label}
    </span>
  );
};
