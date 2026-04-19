import express from "express";
import Task from "../models/Task.js";
import Lead from "../models/Leads.js";
import Stage from "../models/Stage.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/summary", async (req, res) => {
  const tenantId = req.user.tenantId;

  const totalLeads = await Lead.countDocuments({ tenantId, isDeleted: false });
  const totalTasks = await Task.countDocuments({ tenantId, isDeleted: false });
  const overdueTasks = await Task.countDocuments({
    tenantId,
    isDeleted: false,
    status: { $ne: "COMPLETED" },
    dueDate: { $lt: new Date() },
  });

  const tasksByStatus = await Task.aggregate([
    { $match: { tenantId, isDeleted: false } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  res.json({
    totalLeads,
    totalTasks,
    overdueTasks,
    tasksByStatus,
  });
});

router.get("/today-tasks", async (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  let query = {
    tenantId: req.user.tenantId,
    isDeleted: false,
    dueDate: { $gte: startOfDay, $lt: endOfDay },
  };

  if (req.user.role === "USER") {
    query.assignedTo = req.user._id;
  }

  const tasks = await Task.find(query)
    .populate("leadId", "name company")
    .populate("assignedTo", "name email")
    .sort({ dueDate: 1 })
    .lean();

  res.json(tasks);
});

router.get("/overdue-tasks", async (req, res) => {
  let query = {
    tenantId: req.user.tenantId,
    isDeleted: false,
    status: { $ne: "COMPLETED" },
    dueDate: { $lt: new Date() },
  };

  if (req.user.role === "USER") {
    query.assignedTo = req.user._id;
  }

  const tasks = await Task.find(query)
    .populate("leadId", "name company")
    .populate("assignedTo", "name email")
    .sort({ dueDate: 1 })
    .lean();

  res.json(tasks);
});

router.get("/leads-by-stage", async (req, res) => {
  const stages = await Stage.find({ tenantId: req.user.tenantId, isActive: true })
    .sort({ order: 1 })
    .lean();

  const leadsByStage = await Promise.all(
    stages.map(async (stage) => {
      const leads = await Lead.find({
        tenantId: req.user.tenantId,
        stageId: stage._id,
        isDeleted: false,
      })
        .select("name email company priority score")
        .lean();

      return {
        stage: {
          id: stage._id,
          name: stage.name,
          color: stage.color,
        },
        leads,
        count: leads.length,
      };
    })
  );

  res.json(leadsByStage);
});

router.post("/assign-task", async (req, res) => {
  if (req.user.role === "USER") {
    return res.status(403).json({ error: "Only managers and admins can assign tasks." });
  }

  const { taskId, assignedTo } = req.body;
  if (!taskId || !assignedTo) {
    return res.status(400).json({ error: "taskId and assignedTo are required." });
  }

  const task = await Task.findOne({ _id: taskId, tenantId: req.user.tenantId });
  if (!task) return res.status(404).json({ error: "Task not found." });

  const user = await User.findOne({ _id: assignedTo, tenantId: req.user.tenantId });
  if (!user) return res.status(404).json({ error: "User not found." });

  task.assignedTo = assignedTo;
  await task.save();

  res.json(task);
});

export default router;
