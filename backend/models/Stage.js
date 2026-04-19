import mongoose from "mongoose";

const StageSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    name: { type: String, required: true }, // "New", "Attempted", "Connected", etc.
    slug: { type: String }, // auto-generated from name
    description: { type: String },
    order: { type: Number, default: 0 }, // sort order in pipeline
    color: { type: String, default: "#3b82f6" }, // hex color for UI

    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

StageSchema.index({ tenantId: 1, order: 1 });
StageSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

export default mongoose.model("Stage", StageSchema);
