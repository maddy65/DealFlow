import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    leadNumber: { type: Number }, // per-tenant sequence (later)

    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    company: { type: String },

    source: { type: String },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"],
      default: "NEW",
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    score: { type: Number },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Performance indexes
LeadSchema.index({ tenantId: 1, status: 1 });
LeadSchema.index({ tenantId: 1, ownerId: 1 });
LeadSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.model("Lead", LeadSchema);
