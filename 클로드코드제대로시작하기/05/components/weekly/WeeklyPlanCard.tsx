import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, Target, CheckCircle2 } from 'lucide-react';
import { WeeklyPlan, Goal } from '@/types';
import { formatWeekRange } from '@/lib/utils';
import { ProgressBar } from './ProgressBar';

interface WeeklyPlanCardProps {
  plan: WeeklyPlan;
  goals: Goal[];
}

export const WeeklyPlanCard: React.FC<WeeklyPlanCardProps> = ({ plan, goals }) => {
  const linkedGoal = goals.find((g) => g._id === plan.goalId);
  const doneGoals = plan.goals.filter((g) => g.done).length;
  const progressPercent = plan.goals.length > 0
    ? Math.round((doneGoals / plan.goals.length) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Calendar size={16} />
            </span>
            <span className="text-xs font-bold text-slate-800">
              {formatWeekRange(plan.weekStart)}
            </span>
          </div>
          {linkedGoal && (
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 truncate max-w-[140px]">
              🎯 {linkedGoal.title}
            </span>
          )}
        </div>

        {/* Goals Checklist Preview */}
        <div className="space-y-1.5 my-4">
          {plan.goals.map((g, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-xs">
              <CheckCircle2
                size={14}
                className={g.done ? 'text-emerald-500' : 'text-slate-300'}
              />
              <span
                className={`truncate ${
                  g.done ? 'line-through text-slate-400' : 'text-slate-700'
                }`}
              >
                {g.text}
              </span>
            </div>
          ))}
          {plan.goals.length === 0 && (
            <p className="text-xs text-slate-400 py-1">등록된 주간 목표가 없습니다.</p>
          )}
        </div>

        {plan.memo && (
          <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2 mb-4">
            📌 {plan.memo}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-3">
        <ProgressBar progress={progressPercent} label="목표 달성률" />

        <Link
          href={`/weekly/${plan._id}`}
          className="w-full py-2 flex items-center justify-center space-x-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition border border-indigo-100"
        >
          <span>주간 플래너 상세 & 요일 배치</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};
