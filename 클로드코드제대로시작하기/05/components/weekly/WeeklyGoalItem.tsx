import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { WeeklyGoalItem as IWeeklyGoalItem } from '@/types';

interface WeeklyGoalItemProps {
  item: IWeeklyGoalItem;
  onToggle: (done: boolean) => void;
}

export const WeeklyGoalItem: React.FC<WeeklyGoalItemProps> = ({ item, onToggle }) => {
  return (
    <div
      onClick={() => onToggle(!item.done)}
      className={`flex items-start space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
        item.done
          ? 'bg-emerald-50/40 border-emerald-200'
          : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
      }`}
    >
      <button
        type="button"
        className={`mt-0.5 transition ${
          item.done ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        {item.done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
      </button>
      <p
        className={`text-xs font-semibold text-slate-800 leading-snug flex-1 ${
          item.done ? 'line-through text-slate-400 font-normal' : ''
        }`}
      >
        {item.text}
      </p>
    </div>
  );
};
