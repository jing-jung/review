'use client';

import React, { useEffect, useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { useAppStore } from '@/store';
import { Goal } from '@/types';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalForm } from '@/components/goals/GoalForm';
import { Modal } from '@/components/shared/Modal';

export default function GoalsPage() {
  const {
    goals,
    fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
  } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`'${title}' 목표를 삭제하시겠습니까?`)) {
      await deleteGoal(id);
    }
  };

  const handleSaveGoal = async (data: { title: string; description: string }) => {
    if (editingGoal) {
      await updateGoal(editingGoal._id, data);
    } else {
      await addGoal(data);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Target size={24} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">1년 목표 관리 (Yearly Vision)</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              단순 할 일을 넘어 어디로 향하고 있는지 장기적인 방향성을 설정하고 연결된 할 일의 달성률을 추적합니다.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition"
        >
          <Plus size={18} />
          <span>새 1년 목표 등록</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <GoalCard
            key={goal._id}
            goal={goal}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {goals.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Target size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">등록된 1년 목표가 없습니다.</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            올해 이루고 싶은 가장 중요한 핵심 목표를 먼저 세워보세요!
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
          >
            첫 1년 목표 등록하기
          </button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? '1년 목표 수정' : '새로운 1년 목표 등록'}
      >
        <GoalForm
          initialGoal={editingGoal}
          onSubmit={handleSaveGoal}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
