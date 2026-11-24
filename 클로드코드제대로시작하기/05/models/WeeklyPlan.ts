import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWeeklyGoal {
  text: string;
  done: boolean;
}

export interface IWeeklyPlan extends Document {
  weekStart: Date;
  goals: IWeeklyGoal[];
  memo: string;
  retrospective?: string;
  goalId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyGoalSchema = new Schema<IWeeklyGoal>({
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
});

const WeeklyPlanSchema = new Schema<IWeeklyPlan>(
  {
    weekStart: { type: Date, required: true, index: true },
    goals: { type: [WeeklyGoalSchema], default: [] },
    memo: { type: String, default: '' },
    retrospective: { type: String, default: '' },
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal' },
  },
  {
    timestamps: true,
  }
);

export const WeeklyPlan: Model<IWeeklyPlan> =
  mongoose.models.WeeklyPlan || mongoose.model<IWeeklyPlan>('WeeklyPlan', WeeklyPlanSchema);
