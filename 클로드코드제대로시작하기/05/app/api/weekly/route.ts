import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { WeeklyPlan } from '@/models/WeeklyPlan';
import { memoryStore } from '@/lib/memoryStore';
import { getWeekStart } from '@/lib/utils';

// GET: 주간 계획 목록 (최신순 또는 weekStart 필터)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const weekStartParam = searchParams.get('weekStart');

  try {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      const query = weekStartParam
        ? { weekStart: new Date(weekStartParam) }
        : {};
      const plans = await WeeklyPlan.find(query).sort({ weekStart: -1 });
      return NextResponse.json(plans);
    }
  } catch (e) {
    // fallback
  }

  let plans = [...memoryStore.weeklyPlans];
  if (weekStartParam) {
    const targetTime = new Date(weekStartParam).getTime();
    plans = plans.filter((p) => new Date(p.weekStart).getTime() === targetTime);
  }
  return NextResponse.json(plans);
}

// POST: 신규 주간 계획 생성
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { weekStart, goals = [], memo = '', retrospective = '', goalId } = body;

    const normalizedWeekStart = getWeekStart(weekStart || new Date());

    const { isFallback } = await connectDB();
    if (!isFallback) {
      // 중복 체크 (409)
      const existing = await WeeklyPlan.findOne({ weekStart: normalizedWeekStart });
      if (existing) {
        return NextResponse.json(
          { error: 'A weekly plan for this week already exists' },
          { status: 409 }
        );
      }

      const newPlan = await WeeklyPlan.create({
        weekStart: normalizedWeekStart,
        goals: goals.slice(0, 5), // 최대 5개
        memo,
        retrospective,
        goalId: goalId || undefined,
      });

      return NextResponse.json(newPlan, { status: 201 });
    }

    // Fallback In-memory
    const existing = memoryStore.weeklyPlans.find(
      (p) => new Date(p.weekStart).getTime() === normalizedWeekStart.getTime()
    );
    if (existing) {
      return NextResponse.json(
        { error: 'A weekly plan for this week already exists' },
        { status: 409 }
      );
    }

    const newPlan = {
      _id: `weekly-${Date.now()}`,
      weekStart: normalizedWeekStart.toISOString(),
      goals: (goals || []).slice(0, 5).map((g: any, i: number) => ({
        _id: `wg-${Date.now()}-${i}`,
        text: g.text || g,
        done: !!g.done,
      })),
      memo: memo || '',
      retrospective: retrospective || '',
      goalId: goalId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryStore.weeklyPlans.unshift(newPlan);
    return NextResponse.json(newPlan, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
