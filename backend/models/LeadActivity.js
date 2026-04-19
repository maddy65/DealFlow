import mongoose from "mongoose";

const LeadActivitySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: ["CREATED", "UPDATED", "ASSIGNED", "STATUS_CHANGED", "NOTE_ADDED", "STAGE_CHANGED", "CANCELLED"],
      required: true,
    },

    meta: { type: Object },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("LeadActivity", LeadActivitySchema);
