import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: ["TENANT_ADMIN", "MANAGER", "USER"],
      default: "USER",
    },

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "DISABLED"],
      default: "PENDING",
    },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Email unique per tenant
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export default mongoose.model("User", UserSchema);
