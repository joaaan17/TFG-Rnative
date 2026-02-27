import mongoose, { Schema, type Model } from 'mongoose';

/** Documento L2 en MongoDB. key único (ej. QUOTE:AAPL, HIST:AAPL:1d:1mo). */
export interface PriceCacheDocument extends mongoose.Document {
  key: string;
  value: unknown;
  fetchedAt: Date;
  expiresAt: Date;
  staleAt?: Date;
  meta?: {
    symbol: string;
    type: string;
    provider?: string;
    interval?: string;
    range?: string;
  };
}

const PriceCacheSchema = new Schema<PriceCacheDocument>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    fetchedAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
    staleAt: { type: Date, required: false },
    meta: { type: Schema.Types.Mixed, required: false },
  },
  { timestamps: false },
);

PriceCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PriceCacheModel: Model<PriceCacheDocument> =
  (mongoose.models.PriceCache as Model<PriceCacheDocument>) ??
  mongoose.model<PriceCacheDocument>('PriceCache', PriceCacheSchema);
