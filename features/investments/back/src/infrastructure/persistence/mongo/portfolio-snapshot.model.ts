import mongoose, { Schema, type Model } from 'mongoose';

export type PortfolioSnapshotDocument = mongoose.Document & {
  userId: string;
  timestamp: Date;
  equityValue: number;
  cashValue: number;
  positionsValue: number;
  rangeKey?: string;
  updatedAt: Date;
};

const PortfolioSnapshotSchema = new Schema<PortfolioSnapshotDocument>(
  {
    userId: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true, index: true },
    equityValue: { type: Number, required: true },
    cashValue: { type: Number, required: true },
    positionsValue: { type: Number, required: true },
    rangeKey: { type: String, required: false },
    updatedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

PortfolioSnapshotSchema.index({ userId: 1, timestamp: -1 });

export const PortfolioSnapshotModel: Model<PortfolioSnapshotDocument> =
  (mongoose.models.PortfolioSnapshot as Model<PortfolioSnapshotDocument>) ??
  mongoose.model<PortfolioSnapshotDocument>(
    'PortfolioSnapshot',
    PortfolioSnapshotSchema,
  );
