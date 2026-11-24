import { Goal, WeeklyPlan, Todo } from '@/types';
import { getWeekStart, formatDate } from '@/lib/utils';

// Global singleton in-memory database fallback
class MemoryStore {
  goals: Goal[] = [];
  weeklyPlans: WeeklyPlan[] = [];
  todos: Todo[] = [];
  private initialized = false;

  constructor() {
    this.initDefaultData();
  }

  private initDefaultData() {
    if (this.initialized) return;
    this.initialized = true;

    const now = new Date().toISOString();
    const currentWeekStart = getWeekStart().toISOString();

    const g1: Goal = {
      _id: 'goal-1',
      title: '풀스택 웹 개발 역량 강화 및 포트폴리오 완성',
      description: 'React, Next.js, TypeScript 실전 프로젝트 완성과 기술 블로그 주 1회 작성',
      progress: 50,
      createdAt: now,
      updatedAt: now,
    };

    const g2: Goal = {
      _id: 'goal-2',
      title: '정보처리기사 및 SQLD 자격증 취득',
      description: '상반기 필기/실기 원패스 합격을 위한 기출문제 풀이 및 개념 복습',
      progress: 33,
      createdAt: now,
      updatedAt: now,
    };

    this.goals.push(g1, g2);

    const wp1: WeeklyPlan = {
      _id: 'weekly-1',
      weekStart: currentWeekStart,
      goals: [
        { _id: 'wg-1', text: 'Next.js 14 칸반 보드 드래그앤드롭 완성', done: true },
        { _id: 'wg-2', text: 'SQLD 2과목 기출문제 50제 풀이 및 오답노트', done: false },
        { _id: 'wg-3', text: '주 3회 야외 러닝 5km 달성', done: false },
      ],
      memo: '이번 주는 칸반 보드와 주간 플래너 연동에 집중하기!',
      retrospective: '주초에 계획했던 목표들을 차근차근 잘 진행 중임.',
      goalId: g1._id,
      createdAt: now,
      updatedAt: now,
    };

    this.weeklyPlans.push(wp1);

    const t1: Todo = {
      _id: 'todo-1',
      title: 'PRD 요구사항 분석 및 Next.js 14 아키텍처 설계',
      description: '1년 목표 - 주간 계획 - 할일 간의 매핑 구조 정의',
      status: 'done',
      priority: 'high',
      dueDate: formatDate(new Date()),
      dayOfWeek: 1, // 월요일
      order: 'a0',
      weeklyPlanId: wp1._id,
      goalId: g1._id,
      createdAt: now,
      updatedAt: now,
    };

    const t2: Todo = {
      _id: 'todo-2',
      title: 'SQLD 2과목 SQL 기본 및 활용 기출 풀이',
      description: '윈도우 함수와 계층형 질의 집중 복습',
      status: 'done',
      priority: 'medium',
      dueDate: formatDate(new Date()),
      dayOfWeek: 1, // 월요일
      order: 'a1',
      weeklyPlanId: wp1._id,
      goalId: g2._id,
      createdAt: now,
      updatedAt: now,
    };

    const t3: Todo = {
      _id: 'todo-3',
      title: '칸반 보드 드래그앤드롭 및 fractional-indexing 연동',
      description: 'status 변경 시 단 1회의 PATCH로 완결',
      status: 'doing',
      priority: 'high',
      dueDate: formatDate(new Date(Date.now() + 86400000)),
      dayOfWeek: 2, // 화요일
      order: 'a0',
      weeklyPlanId: wp1._id,
      goalId: g1._id,
      createdAt: now,
      updatedAt: now,
    };

    const t4: Todo = {
      _id: 'todo-4',
      title: '퇴근 후 러닝 5km (페이스 6분 유지)',
      description: '체력 증진 및 심폐지구력 강화',
      status: 'todo',
      priority: 'medium',
      dueDate: formatDate(new Date(Date.now() + 86400000)),
      dayOfWeek: 2, // 화요일
      order: 'a0',
      weeklyPlanId: wp1._id,
      createdAt: now,
      updatedAt: now,
    };

    const t5: Todo = {
      _id: 'todo-5',
      title: 'WeekGrid 7열 요일별 할일 배치 뷰 구현',
      description: '월~일 요일별 셀 클릭으로 할일 배치',
      status: 'todo',
      priority: 'medium',
      dueDate: formatDate(new Date(Date.now() + 2 * 86400000)),
      dayOfWeek: 3, // 수요일
      order: 'a1',
      weeklyPlanId: wp1._id,
      goalId: g1._id,
      createdAt: now,
      updatedAt: now,
    };

    this.todos.push(t1, t2, t3, t4, t5);
  }

  // Goal Progress 재계산
  recalcGoalProgress(goalId?: string) {
    if (!goalId) return;
    const targetGoal = this.goals.find((g) => g._id === goalId);
    if (!targetGoal) return;

    const linkedTodos = this.todos.filter((t) => t.goalId === goalId);
    if (linkedTodos.length === 0) {
      targetGoal.progress = 0;
      return;
    }
    const doneTodos = linkedTodos.filter((t) => t.status === 'done');
    targetGoal.progress = Math.round((doneTodos.length / linkedTodos.length) * 100);
  }
}

declare global {
  var memoryStore: MemoryStore | undefined;
}

export const memoryStore = global.memoryStore || new MemoryStore();
if (!global.memoryStore) {
  global.memoryStore = memoryStore;
}
