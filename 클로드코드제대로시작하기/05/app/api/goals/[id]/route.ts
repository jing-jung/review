import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Goal } from '@/models/Goal';
import { memoryStore } from '@/lib/memoryStore';

// GET: 단일 목표 조회
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      const goal = await Goal.findById(id);
      if (!goal) {
        return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
      }
      return NextResponse.json(goal);
    }
  } catch (e) {
    // fallback
  }

  const goal = memoryStore.goals.find((g) => g._id === id);
  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }
  return NextResponse.json(goal);
}

// PUT: 목표 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  try {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      const updated = await Goal.findByIdAndUpdate(
        id,
        {
          title: body.title,
          description: body.description,
          progress: body.progress,
        },
        { new: true }
      );
      if (!updated) {
        return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
      }
      return NextResponse.json(updated);
    }
  } catch (e) {
    // fallback
  }

  const index = memoryStore.goals.findIndex((g) => g._id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }

  memoryStore.goals[index] = {
    ...memoryStore.goals[index],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(memoryStore.goals[index]);
}

// DELETE: 목표 삭제
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      const deleted = await Goal.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Deleted successfully' });
    }
  } catch (e) {
    // fallback
  }

  const index = memoryStore.goals.findIndex((g) => g._id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }

  memoryStore.goals.splice(index, 1);
  // 연결된 todos의 goalId 해제
  memoryStore.todos.forEach((t) => {
    if (t.goalId === id) delete t.goalId;
  });

  return NextResponse.json({ message: 'Deleted successfully' });
}
