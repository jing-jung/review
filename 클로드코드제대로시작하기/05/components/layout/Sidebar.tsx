'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  KanbanSquare,
  CalendarDays,
  Target,
  ArrowUpRight,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '대시보드', icon: <LayoutDashboard size={18} /> },
    { href: '/todos', label: '할 일 칸반', icon: <KanbanSquare size={18} /> },
    { href: '/weekly', label: '주간 계획', icon: <CalendarDays size={18} /> },
    { href: '/goals', label: '1년 목표', icon: <Target size={18} /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Target size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">FocusFlow</span>
            <span className="text-[11px] text-slate-400">목표와 실행의 연결</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 m-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
        <h4 className="text-xs font-bold text-slate-800 mb-1">방향성과 실행의 일치</h4>
        <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
          1년 목표를 세우고, 이번 주 계획을 수립한 뒤, 칸반에서 매일 실행하세요.
        </p>
        <Link
          href="/goals"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <span>목표 설정하러 가기</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </aside>
  );
};
