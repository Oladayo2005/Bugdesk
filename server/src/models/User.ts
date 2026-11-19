
import mongoose, { Schema, Document } from "mongoose";

export type VerificationPurpose =
  | "registration"
  | "login"
  | "password-reset";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "developer" | "tester";
  avatar?: string;
  avatarPublicId?: string;
  isActive: boolean;
  emailVerified: boolean;

  // SESSION MANAGEMENT
  tokenVersion: number;

  // EMAIL VERIFICATION
  verificationCodeHash?: string;
  verificationCodePurpose?: VerificationPurpose;
  verificationCodeExpiresAt?: Date;
  verificationCodeAttempts: number;
  verificationCodeLastSentAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "developer", "tester"],
      default: "tester",
    },

    // PROFILE AVATAR
    avatar: {
      type: String,
      default: "",
    },

    avatarPublicId: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    // SESSION VERSION
    tokenVersion: {
      type: Number,
      default: 0,
    },

    // VERIFICATION CODE
    verificationCodeHash: {
      type: String,
      select: false,
    },

    verificationCodePurpose: {
      type: String,
      enum: ["registration", "login", "password-reset"],
    },

    verificationCodeExpiresAt: {
      type: Date,
    },

    verificationCodeAttempts: {
      type: Number,
      default: 0,
    },

    verificationCodeLastSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
