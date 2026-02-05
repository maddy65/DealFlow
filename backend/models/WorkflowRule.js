import mongoose from "mongoose";

const WorkflowRuleSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    trigger: {
      type: String,
      enum: ["LEAD_CREATED", "STATUS_CHANGED"],
      required: true,
    },

    condition: { type: Object }, // JSON logic
    actions: [{ type: Object }],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("WorkflowRule", WorkflowRuleSchema);
