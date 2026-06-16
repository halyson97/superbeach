import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IGame extends Document {
  userId: Types.ObjectId;
  shareToken: string;
  championshipId: string;
  championship: Record<string, unknown>;
  status: 'active' | 'finished';
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
  },
  { timestamps: true },
);

gameSchema.index({ userId: 1, status: 1 });

export const Game = mongoose.model<IGame>('Game', gameSchema);
