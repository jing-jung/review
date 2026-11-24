import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Goal } from '@/models/Goal';
import { memoryStore } from '@/lib/memoryStore';

// GET: 목표 목록 조회
export async function GET() {
  try {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      const goals = await Goal.find().sort({ createdAt: -1 });
      return NextResponse.json(goals);
    }
  } catch (e) {
    // fallback
  }

  return NextResponse.json(memoryStore.goals);
}

// POST: 신규 목표 생성
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { isFallback } = await connectDB();
    if (!isFallback) {
      const newGoal = await Goal.create({
        title: title.trim(),
        description: description?.trim() || '',
        progress: 0,
      });
      return NextResponse.json(newGoal, { status: 201 });
    }
  } catch (e) {
    // fallback
  }

  const body = await req.json().catch(() => ({}));
  const newGoal = {
    _id: `goal-${Date.now()}`,
    title: body.title?.trim() || '새 목표',
    description: body.description?.trim() || '',
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryStore.goals.unshift(newGoal);
  return NextResponse.json(newGoal, { status: 201 });
}
