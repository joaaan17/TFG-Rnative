import mongoose, { Schema, type Model } from 'mongoose';

export type ProfileDocument = mongoose.Document & {
  name: string;
  username?: string;
  usernameLower?: string;
  nameLower?: string;
  avatarUrl?: string;
  joinedAt?: string;
  bf?: number;
  nivel?: number;
  division?: string;
  patrimonio?: number;
  following?: number;
  followers?: number;
  cashBalance?: number;
  experience?: number;
  /** IDs de noticias ya reclamadas (1 XP por noticia y usuario, evita farm). */
  claimedNewsIds?: string[];
};

const ProfileSchema = new Schema<ProfileDocument>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, trim: true },
    usernameLower: { type: String, trim: true, lowercase: true },
    nameLower: { type: String, trim: true, lowercase: true },
    avatarUrl: { type: String, trim: true },
    joinedAt: { type: String },
    bf: { type: Number, default: 0 },
    nivel: { type: Number, default: 1 },
    division: { type: String, default: 'Bronce', trim: true },
    patrimonio: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    cashBalance: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    claimedNewsIds: { type: [String], default: [] },
  },
  { timestamps: true },
);

ProfileSchema.pre('save', function (next) {
  if (this.isModified('username')) {
    this.usernameLower = (this.username ?? '').toLowerCase().trim();
  }
  if (this.isModified('name')) {
    this.nameLower = (this.name ?? '').toLowerCase().trim();
  }
  next();
});

export const ProfileModel: Model<ProfileDocument> =
  (mongoose.models.Profile as Model<ProfileDocument>) ??
  mongoose.model<ProfileDocument>('Profile', ProfileSchema);
