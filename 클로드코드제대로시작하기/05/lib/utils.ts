import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 주어진 날짜가 포함된 주의 월요일 00:00:00 Date 객체를 반환합니다.
 */
export function getWeekStart(date: Date | string = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  // 일요일(0)이면 -6, 월요일(1)이면 0, 화요일(2)이면 -1, ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatWeekRange(weekStart: Date | string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${formatDate(start)} ~ ${formatDate(end)}`;
}
