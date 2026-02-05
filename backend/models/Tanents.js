import mongoose from "mongoose";

const TenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    license: {
      plan: {
        type: String,
        enum: ["FREE", "PRO", "ENTERPRISE"],
        default: "FREE",
      },
      maxUsers: { type: Number, default: 5 },
      maxLeads: { type: Number, default: 1000 },
    },

    settings: {
      timezone: { type: String, default: "UTC" },
      currency: { type: String, default: "USD" },
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tenant", TenantSchema);
