import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
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

    title: { type: String, required: true },
    description: { type: String },

    taskType: {
      type: String,
      enum: [
        "IMMEDIATE",
        "QUALIFICATION",
        "CALL",
        "DEMO",
        "EMAIL",
        "PROPOSAL",
        "DEAL_PROGRESSION",
        "DECISION_STAGE",
        "REENGAGEMENT",
        "INTERNAL",
        "OTHER",
      ],
      default: "FOLLOW_UP",
    },

    category: {
      type: String,
      enum: [
        "IMMEDIATE",
        "QUALIFICATION",
        "NURTURING",
        "DEAL_PROGRESSION",
        "DECISION",
        "REENGAGEMENT",
        "INTERNAL",
      ],
      default: "NURTURING",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    dueDate: { type: Date },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "OVERDUE"],
      default: "PENDING",
    },

    completedAt: { type: Date },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TaskSchema.index({ tenantId: 1, leadId: 1 });
TaskSchema.index({ tenantId: 1, assignedTo: 1 });
TaskSchema.index({ tenantId: 1, dueDate: 1 });
TaskSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model("Task", TaskSchema);
