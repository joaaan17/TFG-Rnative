import mongoose, { Schema, type Model } from 'mongoose';

export type ProfileDocument = mongoose.Document & {
  name: string;
  username?: string;
  joinedAt?: string;
  bf?: number;
  following?: number;
  followers?: number;
};

const ProfileSchema = new Schema<ProfileDocument>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, trim: true },
    joinedAt: { type: String },
    bf: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ProfileModel: Model<ProfileDocument> =
  (mongoose.models.Profile as Model<ProfileDocument>) ??
  mongoose.model<ProfileDocument>('Profile', ProfileSchema);
