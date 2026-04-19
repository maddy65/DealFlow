import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CommentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const LeadSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    leadNumber: { type: Number },

    name: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    company: { type: String, trim: true },
    industry: { type: String },
    website: { type: String },
    address: { type: String },

    source: { type: String },
    campaign: { type: String },
    medium: { type: String },
    referrer: { type: String },

    stageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stage",
      index: true,
    },

    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST", "CANCELLED"],
      default: "NEW",
      index: true,
    },

    value: { type: Number, default: 0 },
    probability: { type: Number, min: 0, max: 100, default: 0 },
    closeDate: { type: Date },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
      index: true,
    },

    score: { type: Number, default: 0 },
    riskFlags: [{ type: String }],

    intentScore: { type: Number, min: 0, max: 100, default: 0 },
    persona: { type: String },
    segment: { type: String },

    lastActivityAt: { type: Date, default: Date.now, index: true },
    nextFollowUpDate: { type: Date },
    contactAttempts: { type: Number, default: 0 },

    notes: [NoteSchema],
    comments: [CommentSchema],
    tags: [{ type: String, trim: true }],

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Performance indexes
LeadSchema.index({ tenantId: 1, stageId: 1 });
LeadSchema.index({ tenantId: 1, ownerId: 1 });
LeadSchema.index({ tenantId: 1, assignedTo: 1 });
LeadSchema.index({ tenantId: 1, status: 1 });
LeadSchema.index({ tenantId: 1, createdAt: -1 });
LeadSchema.index({ tenantId: 1, lastActivityAt: -1 });
LeadSchema.index({ tenantId: 1, tags: 1 });

export default mongoose.model("Lead", LeadSchema);
