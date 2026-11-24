import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITodo extends Document {
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  dayOfWeek?: number;
  order: string;
  weeklyPlanId?: mongoose.Types.ObjectId;
  goalId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['todo', 'doing', 'done'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    dueDate: { type: Date },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    order: { type: String, required: true, default: 'a0' },
    weeklyPlanId: { type: Schema.Types.ObjectId, ref: 'WeeklyPlan', index: true },
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal', index: true },
  },
  {
    timestamps: true,
  }
);

// 인덱스: status 및 order 사전순 정렬
TodoSchema.index({ status: 1, order: 1 });

export const Todo: Model<ITodo> =
  mongoose.models.Todo || mongoose.model<ITodo>('Todo', TodoSchema);
