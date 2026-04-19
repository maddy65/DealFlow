import express from "express";
import Task from "../models/Task.js";
import Lead from "../models/Leads.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

function canAccessTask(user, task) {
  if (user.role === "TENANT_ADMIN") return true;
  if (user.role === "MANAGER") return true;
  if (user.role === "USER" && String(task.assignedTo) === String(user._id)) return true;
  return false;
}

router.get("/lead/:leadId", async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.params.leadId,
    tenantId: req.user.tenantId,
    isDeleted: false,
  });
  if (!lead) return res.status(404).json({ error: "Lead not found." });

  const tasks = await Task.find({ leadId: lead._id, isDeleted: false })
    .populate("assignedTo", "name email")
    .sort({ dueDate: 1 })
    .lean();

  res.json(tasks);
});

router.get("/my-tasks", async (req, res) => {
  const tasks = await Task.find({
    tenantId: req.user.tenantId,
    assignedTo: req.user._id,
    isDeleted: false,
  })
    .populate("leadId", "name company")
    .sort({ dueDate: 1 })
    .lean();

  res.json(tasks);
});

router.post("/", async (req, res) => {
  const { leadId, title, description, taskType, category, assignedTo, dueDate, priority } = req.body;

  const lead = await Lead.findOne({
    _id: leadId,
    tenantId: req.user.tenantId,
    isDeleted: false,
  });
  if (!lead) return res.status(404).json({ error: "Lead not found." });

  const task = await Task.create({
    tenantId: req.user.tenantId,
    leadId: lead._id,
    title: String(title).trim(),
    description: description ? String(description).trim() : "",
    taskType: taskType || "EMAIL",
    category: category || "NURTURING",
    assignedTo: assignedTo || req.user._id,
    dueDate,
    priority: priority || "MEDIUM",
  });

  res.status(201).json(task);
});

router.patch("/:id", async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!task) return res.status(404).json({ error: "Task not found." });

  if (!canAccessTask(req.user, task)) {
    return res.status(403).json({ error: "Access denied." });
  }

  if (req.body.status) {
    task.status = req.body.status;
    if (req.body.status === "COMPLETED") {
      task.completedAt = new Date();
    }
  }
  if (req.body.title) task.title = String(req.body.title).trim();
  if (req.body.description !== undefined) task.description = String(req.body.description).trim();
  if (req.body.priority) task.priority = req.body.priority;
  if (req.body.dueDate) task.dueDate = req.body.dueDate;

  await task.save();
  res.json(task);
});

router.delete("/:id", async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!task) return res.status(404).json({ error: "Task not found." });

  if (!canAccessTask(req.user, task) && req.user.role !== "TENANT_ADMIN") {
    return res.status(403).json({ error: "Access denied." });
  }

  task.isDeleted = true;
  await task.save();
  res.status(204).end();
});

export default router;
