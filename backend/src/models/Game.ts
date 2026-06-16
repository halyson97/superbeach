import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IGame extends Document {
  userId: Types.ObjectId;
  shareToken: string;
  championshipId: string;
  championship: Record<string, unknown>;
  status: 'active' | 'finished';
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new Schema<IGame>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    shareToken: { type: String, required: true, unique: true, index: true },
    championshipId: { type: String, required: true, index: true },
    championship: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['active', 'finished'], required: true, index: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

function excludeDeleted(this: mongoose.Query<unknown, unknown>) {
  void this.where({ deletedAt: null });
}

gameSchema.pre('find', excludeDeleted);
gameSchema.pre('findOne', excludeDeleted);
gameSchema.pre('countDocuments', excludeDeleted);

gameSchema.index({ userId: 1, status: 1 });

export const Game = mongoose.model<IGame>('Game', gameSchema);
