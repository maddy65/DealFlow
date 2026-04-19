import express from "express";
import WorkflowRule from "../models/WorkflowRule.js";
import WorkflowJob from "../models/WorkflowJob.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/rules", async (req, res) => {
  const rules = await WorkflowRule.find({ tenantId: req.user.tenantId }).lean();
  res.json(rules);
});

router.post("/rules", async (req, res) => {
  const rule = await WorkflowRule.create({
    tenantId: req.user.tenantId,
    trigger: req.body.trigger || "LEAD_CREATED",
    condition: req.body.condition || {},
    actions: req.body.actions || [],
    isActive: req.body.isActive !== false,
  });
  res.status(201).json(rule);
});

router.get("/jobs", async (req, res) => {
  const jobs = await WorkflowJob.find({ tenantId: req.user.tenantId })
    .sort({ createdAt: -1 })
    .lean();
  res.json(jobs);
});

export default router;
