import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGoal extends Document {
  title: string;
  description: string;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    progress: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Goal: Model<IGoal> =
  mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);
