import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Todo } from '@/models/Todo';
import { Goal } from '@/models/Goal';
import { memoryStore } from '@/lib/memoryStore';

// GET: 단일 할 일
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      const todo = await Todo.findById(id);
      if (!todo) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
      }
      return NextResponse.json(todo);
    }
  } catch (e) {
    // fallback
  }

  const todo = memoryStore.todos.find((t) => t._id === id);
  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }
  return NextResponse.json(todo);
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
      const updated = await Todo.findByIdAndUpdate(
        id,
        {
          title: body.title,
          description: body.description,
          status: body.status,
          priority: body.priority,
          dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
          dayOfWeek: body.dayOfWeek,
          weeklyPlanId: body.weeklyPlanId || null,
          goalId: body.goalId || null,
        },
        { new: true }
      );
      if (!updated) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
      }

      if (updated.goalId) {
        const total = await Todo.countDocuments({ goalId: updated.goalId });
        const done = await Todo.countDocuments({ goalId: updated.goalId, status: 'done' });
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        await Goal.findByIdAndUpdate(updated.goalId, { progress });
      }

      return NextResponse.json(updated);
    }
  } catch (e) {
    // fallback
  }

  const index = memoryStore.todos.findIndex((t) => t._id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }

  memoryStore.todos[index] = {
    ...memoryStore.todos[index],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  if (memoryStore.todos[index].goalId) {
    memoryStore.recalcGoalProgress(memoryStore.todos[index].goalId);
  }

  return NextResponse.json(memoryStore.todos[index]);
}

// PATCH: status, order, dayOfWeek 등 부분 수정 (DnD 카드 1건 이동 시 호출)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  try {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      const updateData: any = {};
      if (body.status !== undefined) updateData.status = body.status;
      if (body.order !== undefined) updateData.order = body.order;
      if (body.dayOfWeek !== undefined) updateData.dayOfWeek = body.dayOfWeek;
      if (body.priority !== undefined) updateData.priority = body.priority;

      const updated = await Todo.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
      }

      // Goal progress 재계산
      if (updated.goalId && body.status !== undefined) {
        const total = await Todo.countDocuments({ goalId: updated.goalId });
        const done = await Todo.countDocuments({ goalId: updated.goalId, status: 'done' });
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        await Goal.findByIdAndUpdate(updated.goalId, { progress });
      }

      return NextResponse.json(updated);
    }
  } catch (e) {
    // fallback
  }

  const index = memoryStore.todos.findIndex((t) => t._id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }

  const oldGoalId = memoryStore.todos[index].goalId;
  memoryStore.todos[index] = {
    ...memoryStore.todos[index],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  if (oldGoalId) {
    memoryStore.recalcGoalProgress(oldGoalId);
  }

  return NextResponse.json(memoryStore.todos[index]);
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
      const deleted = await Todo.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
      }

      if (deleted.goalId) {
        const total = await Todo.countDocuments({ goalId: deleted.goalId });
        const done = await Todo.countDocuments({ goalId: deleted.goalId, status: 'done' });
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        await Goal.findByIdAndUpdate(deleted.goalId, { progress });
      }

      return NextResponse.json({ message: 'Deleted successfully' });
    }
  } catch (e) {
    // fallback
  }

  const index = memoryStore.todos.findIndex((t) => t._id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }

  const goalId = memoryStore.todos[index].goalId;
  memoryStore.todos.splice(index, 1);
  if (goalId) {
    memoryStore.recalcGoalProgress(goalId);
  }

  return NextResponse.json({ message: 'Deleted successfully' });
}
