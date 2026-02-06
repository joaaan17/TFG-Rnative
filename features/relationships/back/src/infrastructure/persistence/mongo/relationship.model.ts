import mongoose, { Schema, type Model } from 'mongoose';
import type { RelationshipStatus } from '../../../domain/relationship.types';

export type RelationshipDocument = mongoose.Document & {
  userAId: mongoose.Types.ObjectId;
  userBId: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  status: RelationshipStatus;
  createdAt: Date;
  updatedAt: Date;
};

const RelationshipSchema = new Schema<RelationshipDocument>(
  {
    userAId: { type: Schema.Types.ObjectId, required: true, ref: 'Profile' },
    userBId: { type: Schema.Types.ObjectId, required: true, ref: 'Profile' },
    requesterId: { type: Schema.Types.ObjectId, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'blocked'],
      default: 'pending',
      required: true,
    },
  },
  { timestamps: true },
);

RelationshipSchema.index({ userAId: 1, userBId: 1 }, { unique: true });
RelationshipSchema.index({ userAId: 1, status: 1 });
RelationshipSchema.index({ userBId: 1, status: 1 });
RelationshipSchema.index({ requesterId: 1, status: 1 });

export const RelationshipModel: Model<RelationshipDocument> =
  (mongoose.models.Relationship as Model<RelationshipDocument>) ??
  mongoose.model<RelationshipDocument>('Relationship', RelationshipSchema);
