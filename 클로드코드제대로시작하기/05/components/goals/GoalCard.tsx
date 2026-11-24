import React from 'react';
import { Target, Edit3, Trash2 } from 'lucide-react';
import { Goal } from '@/types';
import { GoalProgress } from './GoalProgress';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string, title: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition relative group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Target size={16} />
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              1년 목표
            </span>
          </div>

          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="수정"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => onDelete(goal._id, goal.title)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="삭제"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-800 mb-2 leading-snug group-hover:text-indigo-600 transition">
          {goal.title}
        </h3>
        {goal.description && (
          <p className="text-xs text-slate-500 line-clamp-3 mb-6 leading-relaxed">
            {goal.description}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <GoalProgress progress={goal.progress} />
      </div>
    </div>
  );
};
