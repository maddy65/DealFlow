import mongoose from "mongoose";

const WorkflowJobSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowRule",
    },

    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },

    status: {
      type: String,
      enum: ["PENDING", "DONE", "FAILED"],
      default: "PENDING",
    },

    attempts: { type: Number, default: 0 },
    error: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("WorkflowJob", WorkflowJobSchema);
