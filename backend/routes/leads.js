import express from "express";
import mongoose from "mongoose";
import Lead from "../models/Leads.js";
import LeadActivity from "../models/LeadActivity.js";
import Task from "../models/Task.js";
import Stage from "../models/Stage.js";
import WorkflowJob from "../models/WorkflowJob.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

function createActivity(user, lead, action, meta = {}) {
  return LeadActivity.create({
    tenantId: user.tenantId,
    leadId: lead._id,
    action,
    meta,
    createdBy: user._id,
  });
}

async function maybeCreateWorkflowJob(user, lead, event = "CREATED") {
  if (event === "CREATED" && lead.status === "NEW") {
    return WorkflowJob.create({
      tenantId: user.tenantId,
      leadId: lead._id,
      status: "PENDING",
      error: null,
    });
  }

  if (event === "STATUS_CHANGED" && lead.status === "WON") {
    return WorkflowJob.create({
      tenantId: user.tenantId,
      leadId: lead._id,
      status: "PENDING",
      error: null,
    });
  }

  return null;
}

router.get("/", async (req, res) => {
  const { stageId, ownerId, status, priority, source, tag, search } = req.query;

  const filter = {
    tenantId: req.user.tenantId,
    isDeleted: false,
  };

  if (stageId && mongoose.Types.ObjectId.isValid(stageId)) filter.stageId = stageId;
  if (ownerId && mongoose.Types.ObjectId.isValid(ownerId)) filter.ownerId = ownerId;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (source) filter.source = source;
  if (tag) filter.tags = tag;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { source: { $regex: search, $options: "i" } },
    ];
  }

  const leads = await Lead.find(filter).sort({ updatedAt: -1 }).lean();
  res.json(leads);
});

router.get("/:id", async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId,
    isDeleted: false,
  })
    .populate("stageId", "name color")
    .populate("ownerId", "name email")
    .populate("createdBy", "name email")
    .lean();

  if (!lead) return res.status(404).json({ error: "Lead not found." });

  const tasks = await Task.find({
    tenantId: req.user.tenantId,
    leadId: lead._id,
    isDeleted: false,
  })
    .sort({ dueDate: 1, createdAt: -1 })
    .lean();

  const activities = await LeadActivity.find({
    tenantId: req.user.tenantId,
    leadId: lead._id,
  })
    .sort({ createdAt: -1 })
    .populate("createdBy", "name email")
    .lean();

  res.json({ lead, tasks, activities });
});

router.post("/", async (req, res) => {
  const {
    name,
    email,
    phone,
    company,
    industry,
    website,
    address,
    source,
    campaign,
    medium,
    referrer,
    stageId,
    status,
    value,
    probability,
    closeDate,
    ownerId,
    priority,
    score,
    riskFlags,
    intentScore,
    persona,
    segment,
    nextFollowUpDate,
    contactAttempts,
    tags,
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Lead name is required." });
  }

  let validatedStageId;
  if (stageId) {
    if (!mongoose.Types.ObjectId.isValid(stageId)) {
      return res.status(400).json({ error: "Invalid stageId." });
    }
    const stage = await Stage.findOne({ _id: stageId, tenantId: req.user.tenantId });
    if (!stage) return res.status(400).json({ error: "Stage not found for this tenant." });
    validatedStageId = stageId;
  }

  const validatedOwnerId = ownerId && mongoose.Types.ObjectId.isValid(ownerId) ? ownerId : req.user._id;

  const newLead = {
    tenantId: req.user.tenantId,
    createdBy: req.user._id,
    ownerId: validatedOwnerId,
    name: String(name).trim(),
    email: email ? String(email).trim().toLowerCase() : undefined,
    phone: phone ? String(phone).trim() : undefined,
    company: company ? String(company).trim() : undefined,
    industry: industry ? String(industry).trim() : undefined,
    website: website ? String(website).trim() : undefined,
    address: address ? String(address).trim() : undefined,
    source: source ? String(source).trim() : undefined,
    campaign: campaign ? String(campaign).trim() : undefined,
    medium: medium ? String(medium).trim() : undefined,
    referrer: referrer ? String(referrer).trim() : undefined,
    stageId: validatedStageId,
    status: status || "NEW",
    value: value || 0,
    probability: probability || 0,
    closeDate: closeDate ? new Date(closeDate) : undefined,
    priority: priority || "MEDIUM",
    score: score || 0,
    riskFlags: Array.isArray(riskFlags) ? riskFlags : [],
    intentScore: intentScore || 0,
    persona: persona ? String(persona).trim() : undefined,
    segment: segment ? String(segment).trim() : undefined,
    nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : undefined,
    contactAttempts: contactAttempts || 0,
    tags: Array.isArray(tags) ? tags.map((tag) => String(tag).trim()) : tags ? [String(tags).trim()] : [],
  };

  const lead = await Lead.create(newLead);
  await createActivity(req.user, lead, "CREATED", { source: newLead.source, status: newLead.status });
  await maybeCreateWorkflowJob(req.user, lead, "CREATED");
  res.status(201).json(lead);
});

router.put("/:id", async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId,
    isDeleted: false,
  });
  if (!lead) return res.status(404).json({ error: "Lead not found." });

  const previousStatus = lead.status;
  const previousStage = lead.stageId;
  const updates = {};

  const fields = [
    "name",
    "email",
    "phone",
    "company",
    "industry",
    "website",
    "address",
    "source",
    "campaign",
    "medium",
    "referrer",
    "status",
    "value",
    "probability",
    "closeDate",
    "priority",
    "score",
    "riskFlags",
    "intentScore",
    "persona",
    "segment",
    "nextFollowUpDate",
    "contactAttempts",
    "tags",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (req.body.stageId) {
    if (!mongoose.Types.ObjectId.isValid(req.body.stageId)) {
      return res.status(400).json({ error: "Invalid stageId." });
    }
    const stage = await Stage.findOne({ _id: req.body.stageId, tenantId: req.user.tenantId });
    if (!stage) return res.status(400).json({ error: "Stage not found for this tenant." });
    updates.stageId = req.body.stageId;
  }

  Object.assign(lead, updates);
  await lead.save();

  await createActivity(req.user, lead, "UPDATED", { updates });
  if (updates.status && updates.status !== previousStatus) {
    await createActivity(req.user, lead, "STATUS_CHANGED", { from: previousStatus, to: updates.status });
    await maybeCreateWorkflowJob(req.user, lead, "STATUS_CHANGED");
  }
  if (updates.stageId && String(updates.stageId) !== String(previousStage)) {
    await createActivity(req.user, lead, "STAGE_CHANGED", { from: previousStage, to: updates.stageId });
  }

  res.json(lead);
});

router.patch("/:id/assign", async (req, res) => {
  const { ownerId } = req.body;
  if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
    return res.status(400).json({ error: "Valid ownerId is required." });
  }

  const lead = await Lead.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId,
    isDeleted: false,
  });
  if (!lead) return res.status(404).json({ error: "Lead not found." });

  const previousOwner = lead.ownerId;
  lead.ownerId = ownerId;
  await lead.save();

  await createActivity(req.user, lead, "ASSIGNED", { from: previousOwner, to: ownerId });
  res.json(lead);
});

router.patch("/:id/stage", async (req, res) => {
  const { stageId, status } = req.body;
  if (!stageId && !status) {
    return res.status(400).json({ error: "stageId or status is required." });
  }

  const lead = await Lead.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId,
    isDeleted: false,
  });
  if (!lead) return res.status(404).json({ error: "Lead not found." });

  const previousStage = lead.stageId;
  const previousStatus = lead.status;

  if (stageId) {
    if (!mongoose.Types.ObjectId.isValid(stageId)) {
      return res.status(400).json({ error: "Invalid stageId." });
    }
    const stage = await Stage.findOne({ _id: stageId, tenantId: req.user.tenantId });
    if (!stage) return res.status(400).json({ error: "Stage not found for this tenant." });
    lead.stageId = stageId;
  }

  if (status) {
    lead.status = status;
  }

  await lead.save();

  if (stageId && String(stageId) !== String(previousStage)) {
    await createActivity(req.user, lead, "STAGE_CHANGED", { from: previousStage, to: stageId });
  }
  if (status && status !== previousStatus) {
    await createActivity(req.user, lead, "STATUS_CHANGED", { from: previousStatus, to: status });
    await maybeCreateWorkflowJob(req.user, lead, "STATUS_CHANGED");
  }

  res.json(lead);
});

router.patch("/:id/cancel", async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId,
    isDeleted: false,
  });
  if (!lead) return res.status(404).json({ error: "Lead not found." });

  if (lead.status === "CANCELLED") {
    return res.status(400).json({ error: "Lead is already cancelled." });
  }

  const previousStatus = lead.status;
  lead.status = "CANCELLED";
  await lead.save();

  await createActivity(req.user, lead, "CANCELLED", { from: previousStatus });
  res.json(lead);
});

router.post("/:id/comments", async (req, res) => {
  const { text } = req.body;
  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: "Comment text is required." });
  }

  const lead = await Lead.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId,
    isDeleted: false,
  });
  if (!lead) return res.status(404).json({ error: "Lead not found." });

  lead.comments.push({
    text: String(text).trim(),
    createdBy: req.user._id,
    createdAt: new Date(),
  });

  await lead.save();
  await createActivity(req.user, lead, "NOTE_ADDED", { comment: text });
  res.status(201).json(lead.comments[lead.comments.length - 1]);
});

router.get("/:id/comments", async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId,
    isDeleted: false,
  }).populate("comments.createdBy", "name email");

  if (!lead) return res.status(404).json({ error: "Lead not found." });

  res.json(lead.comments || []);
});

router.post("/:id/tasks", async (req, res) => {
  const { title, description, taskType, category, assignedTo, dueDate, priority } = req.body;

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "Task title is required." });
  }

  const lead = await Lead.findOne({
    _id: req.params.id,
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

  await createActivity(req.user, lead, "UPDATED", { taskCreated: task._id });
  res.status(201).json(task);
});

router.get("/:id/tasks", async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.params.id,
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

router.patch("/:id/assign-to", async (req, res) => {
  const { userId } = req.body;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Valid userId is required." });
  }

  const lead = await Lead.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId,
    isDeleted: false,
  });
  if (!lead) return res.status(404).json({ error: "Lead not found." });

  const previousAssigned = lead.assignedTo;
  lead.assignedTo = userId;
  await lead.save();

  await createActivity(req.user, lead, "ASSIGNED", { from: previousAssigned, to: userId });
  res.json(lead);
});

router.delete("/:id", async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId,
    isDeleted: false,
  });
  if (!lead) return res.status(404).json({ error: "Lead not found." });

  lead.isDeleted = true;
  await lead.save();
  await createActivity(req.user, lead, "UPDATED", { deleted: true });
  res.status(204).end();
});

export default router;
