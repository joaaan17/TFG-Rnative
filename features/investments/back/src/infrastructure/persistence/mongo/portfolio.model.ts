import mongoose, { Schema, type Model } from 'mongoose';

const HoldingSchema = new Schema(
  {
    symbol: { type: String, required: true, trim: true, uppercase: true },
    shares: { type: Number, required: true, min: 0 },
    avgBuyPrice: { type: Number, required: true, min: 0 },
    lastUpdatedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

export type PortfolioDocument = mongoose.Document & {
  userId: string;
  cashBalance: number;
  currency: string;
  holdings: Array<{
    symbol: string;
    shares: number;
    avgBuyPrice: number;
    lastUpdatedAt: Date;
  }>;
};

const PortfolioSchema = new Schema<PortfolioDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    cashBalance: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: 'USD' },
    holdings: { type: [HoldingSchema], default: [] },
  },
  { timestamps: true },
);

export const PortfolioModel: Model<PortfolioDocument> =
  (mongoose.models.Portfolio as Model<PortfolioDocument>) ??
  mongoose.model<PortfolioDocument>('Portfolio', PortfolioSchema);
