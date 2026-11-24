import React, { useState, useEffect } from 'react';
import { Goal } from '@/types';

interface GoalFormProps {
  initialGoal?: Goal | null;
  onSubmit: (data: { title: string; description: string }) => void;
  onCancel: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ initialGoal, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setDescription(initialGoal.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [initialGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          목표 제목 <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 풀스택 웹 개발 역량 강화 및 포트폴리오 완성"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          목표 상세 설명 / 방향성 (선택)
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="이 목표가 중요한 이유와 달성 전략을 적어보세요."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
        />
      </div>

      <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
        >
          {initialGoal ? '수정 완료' : '목표 생성'}
        </button>
      </div>
    </form>
  );
};
