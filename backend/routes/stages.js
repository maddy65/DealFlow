import express from "express";
import Stage from "../models/Stage.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const stages = await Stage.find({ tenantId: req.user.tenantId, isActive: true })
    .sort({ order: 1 })
    .lean();
  res.json(stages);
});

router.post("/", async (req, res) => {
  if (req.user.role !== "TENANT_ADMIN") {
    return res.status(403).json({ error: "Only admins can create stages." });
  }

  const { name, description, color, order } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Stage name is required." });
  }

  const stage = await Stage.create({
    tenantId: req.user.tenantId,
    name: String(name).trim(),
    description: description ? String(description).trim() : "",
    color: color || "#3b82f6",
    order: order || 0,
  });

  res.status(201).json(stage);
});

router.patch("/:id", async (req, res) => {
  if (req.user.role !== "TENANT_ADMIN") {
    return res.status(403).json({ error: "Only admins can update stages." });
  }

  const stage = await Stage.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!stage) {
    return res.status(404).json({ error: "Stage not found." });
  }

  if (req.body.name) stage.name = String(req.body.name).trim();
  if (req.body.description !== undefined) stage.description = String(req.body.description).trim();
  if (req.body.color) stage.color = req.body.color;
  if (req.body.order !== undefined) stage.order = req.body.order;

  await stage.save();
  res.json(stage);
});

router.delete("/:id", async (req, res) => {
  if (req.user.role !== "TENANT_ADMIN") {
    return res.status(403).json({ error: "Only admins can delete stages." });
  }

  const stage = await Stage.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!stage) {
    return res.status(404).json({ error: "Stage not found." });
  }

  stage.isActive = false;
  await stage.save();
  res.status(204).end();
});

export default router;
