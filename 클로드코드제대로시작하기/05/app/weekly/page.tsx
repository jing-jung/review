'use client';

import React, { useEffect, useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { useAppStore } from '@/store';
import { WeeklyPlanCard } from '@/components/weekly/WeeklyPlanCard';
import { WeeklyPlanForm } from '@/components/weekly/WeeklyPlanForm';
import { Modal } from '@/components/shared/Modal';

export default function WeeklyPage() {
  const {
    weeklyPlans,
    goals,
    fetchWeeklyPlans,
    fetchGoals,
    addWeeklyPlan,
  } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWeeklyPlans();
    fetchGoals();
  }, [fetchWeeklyPlans, fetchGoals]);

  const handleCreatePlan = async (data: any) => {
    const res = await addWeeklyPlan(data);
    if (res) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <CalendarDays size={24} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">주간 계획 관리</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              한 주간의 핵심 목표(최대 5개)와 메모를 작성하고, 요일별로 할 일을 배치합니다.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition"
        >
          <Plus size={18} />
          <span>새 주간 계획 수립</span>
        </button>
      </div>

      {/* Weekly Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weeklyPlans.map((plan) => (
          <WeeklyPlanCard key={plan._id} plan={plan} goals={goals} />
        ))}
      </div>

      {weeklyPlans.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <CalendarDays size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">등록된 주간 계획이 없습니다.</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            이번 주를 알차게 보내기 위한 첫 주간 계획을 수립해보세요!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
          >
            첫 주간 계획 수립하기
          </button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="새 주간 계획 수립"
      >
        <WeeklyPlanForm
          goals={goals}
          onSubmit={handleCreatePlan}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
