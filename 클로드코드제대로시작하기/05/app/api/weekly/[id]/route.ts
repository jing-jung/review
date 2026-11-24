import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { WeeklyPlan } from '@/models/WeeklyPlan';
import { memoryStore } from '@/lib/memoryStore';

// GET: 단일 주간 계획
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      const plan = await WeeklyPlan.findById(id);
      if (!plan) {
        return NextResponse.json({ error: 'Weekly plan not found' }, { status: 404 });
      }
      return NextResponse.json(plan);
    }
  } catch (e) {
    // fallback
  }

  const plan = memoryStore.weeklyPlans.find((p) => p._id === id);
  if (!plan) {
    return NextResponse.json({ error: 'Weekly plan not found' }, { status: 404 });
  }
  return NextResponse.json(plan);
}

// PUT: 전체 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  try {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      const updated = await WeeklyPlan.findByIdAndUpdate(
        id,
        {
          goals: body.goals?.slice(0, 5),
          memo: body.memo,
          retrospective: body.retrospective,
          goalId: body.goalId || null,
        },
        { new: true }
      );
      if (!updated) {
        return NextResponse.json({ error: 'Weekly plan not found' }, { status: 404 });
      }
      return NextResponse.json(updated);
    }
  } catch (e) {
    // fallback
  }

  const index = memoryStore.weeklyPlans.findIndex((p) => p._id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Weekly plan not found' }, { status: 404 });
  }

  memoryStore.weeklyPlans[index] = {
    ...memoryStore.weeklyPlans[index],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(memoryStore.weeklyPlans[index]);
}

// PATCH: goals[n].done 토글 또는 특정 필드 부분 업데이트
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  try {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      const plan = await WeeklyPlan.findById(id);
      if (!plan) {
        return NextResponse.json({ error: 'Weekly plan not found' }, { status: 404 });
      }

      if (body.goalIndex !== undefined && typeof body.done === 'boolean') {
        if (plan.goals[body.goalIndex]) {
          plan.goals[body.goalIndex].done = body.done;
        }
      } else if (body.goalId && typeof body.done === 'boolean') {
        const targetGoal = plan.goals.find((g: any) => g._id?.toString() === body.goalId);
        if (targetGoal) {
          targetGoal.done = body.done;
        }
      }

      if (body.memo !== undefined) plan.memo = body.memo;
      if (body.retrospective !== undefined) plan.retrospective = body.retrospective;

      await plan.save();
      return NextResponse.json(plan);
    }
  } catch (e) {
    // fallback
  }

  const plan = memoryStore.weeklyPlans.find((p) => p._id === id);
  if (!plan) {
    return NextResponse.json({ error: 'Weekly plan not found' }, { status: 404 });
  }

  if (body.goalIndex !== undefined && typeof body.done === 'boolean') {
    if (plan.goals[body.goalIndex]) {
      plan.goals[body.goalIndex].done = body.done;
    }
  } else if (body.goalId && typeof body.done === 'boolean') {
    const targetGoal = plan.goals.find((g) => g._id === body.goalId);
    if (targetGoal) {
      targetGoal.done = body.done;
    }
  }

  if (body.memo !== undefined) plan.memo = body.memo;
  if (body.retrospective !== undefined) plan.retrospective = body.retrospective;
  plan.updatedAt = new Date().toISOString();

  return NextResponse.json(plan);
}

// DELETE: 삭제
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      const deleted = await WeeklyPlan.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ error: 'Weekly plan not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Deleted successfully' });
    }
  } catch (e) {
    // fallback
  }

  const index = memoryStore.weeklyPlans.findIndex((p) => p._id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Weekly plan not found' }, { status: 404 });
  }

  memoryStore.weeklyPlans.splice(index, 1);
  return NextResponse.json({ message: 'Deleted successfully' });
}
