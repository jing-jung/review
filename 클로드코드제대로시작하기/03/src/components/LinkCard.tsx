'use client';

import { useState } from 'react';

type LinkCardProps = {
  title: string;
  url: string;
  icon?: string;
  initialClicks?: number;
};

export default function LinkCard({ title, url, icon, initialClicks = 0 }: LinkCardProps) {
  const [clicks, setClicks] = useState(initialClicks);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setClicks((prev) => prev + 1);
    // TODO: MongoDB API 호출을 통한 실시간 카운트 저장 연동
    console.log(`Clicked ${title}: ${clicks + 1}`);
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group relative flex items-center justify-between w-full px-5 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700/80 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
    >
      <div className="flex items-center gap-3.5">
        {icon && <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{icon}</span>}
        <span className="text-base font-semibold text-gray-800 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {title}
        </span>
      </div>

      {/* 클릭 수 배지 */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-mono">
        <span className="text-[11px] font-sans font-medium text-gray-400">클릭</span>
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 font-semibold group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {clicks}
        </span>
      </div>
    </a>
  );
}
