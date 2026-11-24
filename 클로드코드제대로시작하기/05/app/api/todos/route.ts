import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Todo } from '@/models/Todo';
import { Goal } from '@/models/Goal';
import { memoryStore } from '@/lib/memoryStore';
import { getOrderBetween } from '@/lib/fractionalIndex';

// GET: 할 일 목록 조회 (필터: status, weeklyPlanId, goalId)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const weeklyPlanId = searchParams.get('weeklyPlanId');
  const goalId = searchParams.get('goalId');

  try {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      const query: any = {};
      if (status) query.status = status;
      if (weeklyPlanId) query.weeklyPlanId = weeklyPlanId;
      if (goalId) query.goalId = goalId;

      const todos = await Todo.find(query).sort({ order: 1 });
      return NextResponse.json(todos);
    }
  } catch (e) {
    // fallback
  }

  let list = [...memoryStore.todos];
  if (status) list = list.filter((t) => t.status === status);
  if (weeklyPlanId) list = list.filter((t) => t.weeklyPlanId === weeklyPlanId);
  if (goalId) list = list.filter((t) => t.goalId === goalId);

  // order 사전순 정렬
  list.sort((a, b) => a.order.localeCompare(b.order));
  return NextResponse.json(list);
}

// POST: 신규 할 일 생성
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description = '',
      status = 'todo',
      priority = 'medium',
      dueDate,
      dayOfWeek,
      order,
      weeklyPlanId,
      goalId,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { isFallback } = await connectDB();
    if (!isFallback) {
      // order 계산 (전달되지 않은 경우 해당 status의 마지막 카드 뒤에 배치)
      let finalOrder = order;
      if (!finalOrder) {
        const lastTodo = await Todo.findOne({ status }).sort({ order: -1 });
        finalOrder = getOrderBetween(lastTodo?.order || null, null);
      }

      const newTodo = await Todo.create({
        title: title.trim(),
        description: description?.trim() || '',
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        dayOfWeek: dayOfWeek !== undefined ? Number(dayOfWeek) : undefined,
        order: finalOrder,
        weeklyPlanId: weeklyPlanId || undefined,
        goalId: goalId || undefined,
      });

      // 연결된 Goal progress 재계산
      if (goalId) {
        const total = await Todo.countDocuments({ goalId });
        const done = await Todo.countDocuments({ goalId, status: 'done' });
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        await Goal.findByIdAndUpdate(goalId, { progress });
      }

      return NextResponse.json(newTodo, { status: 201 });
    }

    // In-memory fallback
    const sameStatusTodos = memoryStore.todos
      .filter((t) => t.status === status)
      .sort((a, b) => a.order.localeCompare(b.order));
    const lastOrder = sameStatusTodos.length > 0
      ? sameStatusTodos[sameStatusTodos.length - 1].order
      : null;
    const finalOrder = order || getOrderBetween(lastOrder, null);

    const newTodo = {
      _id: `todo-${Date.now()}`,
      title: title.trim(),
      description: description?.trim() || '',
      status,
      priority,
      dueDate: dueDate || undefined,
      dayOfWeek: dayOfWeek !== undefined ? Number(dayOfWeek) : undefined,
      order: finalOrder,
      weeklyPlanId: weeklyPlanId || undefined,
      goalId: goalId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryStore.todos.push(newTodo);
    if (goalId) {
      memoryStore.recalcGoalProgress(goalId);
    }

    return NextResponse.json(newTodo, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
