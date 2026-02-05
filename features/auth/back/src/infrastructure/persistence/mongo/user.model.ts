import mongoose, { Schema, type Model } from 'mongoose';

export type UserDocument = mongoose.Document & {
  email: string;
  passwordHash: string;
  name: string;
  isVerified: boolean;
  verificationCode?: string | null;
};

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    verificationCode: {
      type: String,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument>) ??
  mongoose.model<UserDocument>('User', UserSchema);
