import mongoose, { Schema, type Model } from 'mongoose';

export type TransactionDocument = mongoose.Document & {
  userId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total: number;
  executedAt: Date;
};

const TransactionSchema = new Schema<TransactionDocument>(
  {
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true, trim: true, uppercase: true },
    type: { type: String, required: true, enum: ['BUY', 'SELL'] },
    shares: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    executedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

TransactionSchema.index({ userId: 1, executedAt: -1 });

export const TransactionModel: Model<TransactionDocument> =
  (mongoose.models.Transaction as Model<TransactionDocument>) ??
  mongoose.model<TransactionDocument>('Transaction', TransactionSchema);
