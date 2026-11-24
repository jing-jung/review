import React from 'react';

interface GoalProgressProps {
  progress: number;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ progress }) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">목표 달성률</span>
        <span className="font-bold text-indigo-600">{progress}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
