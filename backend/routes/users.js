import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Tenant from "../models/Tanents.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/request", async (req, res) => {
  const { name, email, password, tenantSlug, role } = req.body;
  if (!name || !email || !password || !tenantSlug) {
    return res.status(400).json({ error: "Name, email, password, and tenant selection are required." });
  }

  const tenant = await Tenant.findOne({ slug: String(tenantSlug).trim().toLowerCase() });
  if (!tenant || tenant.status !== "ACTIVE") {
    return res.status(403).json({ error: "Tenant is not available for user requests." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await User.findOne({ tenantId: tenant._id, email: normalizedEmail });
  if (existingUser) {
    return res.status(400).json({ error: "A user with this email already exists for this tenant." });
  }

  const allowedRoles = ["TENANT_ADMIN", "MANAGER", "USER"];
  const requestedRole = allowedRoles.includes(role) ? role : "USER";
  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    tenantId: tenant._id,
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash,
    role: requestedRole,
    status: "PENDING",
  });

  res.status(201).json({
    status: "PENDING",
    message: "Your user access request has been submitted and is awaiting approval.",
  });
});

router.post("/", async (req, res) => {
  const superPassword = req.header("x-super-admin-password");
  const expectedPassword = process.env.SUPER_ADMIN_PASSWORD || "Kola@123";
  if (!superPassword || superPassword !== expectedPassword) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { name, email, password, role, tenantId } = req.body;
  if (!name || !email || !password || !tenantId) {
    return res.status(400).json({ error: "Name, email, password, and tenantId are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await User.findOne({ tenantId, email: normalizedEmail });
  if (existingUser) {
    return res.status(400).json({ error: "A user with this email already exists for this tenant." });
  }

  const allowedRoles = ["TENANT_ADMIN", "MANAGER", "USER"];
  const userRole = allowedRoles.includes(role) ? role : "USER";

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    tenantId,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: userRole,
    status: "ACTIVE",
  });

  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

router.use(requireAuth);

router.get("/", async (req, res) => {
  const users = await User.find({ tenantId: req.user.tenantId })
    .select("name email role status")
    .lean();
  res.json(users);
});

router.patch("/:id", async (req, res) => {
  if (req.user.role !== "TENANT_ADMIN") {
    return res.status(403).json({ error: "Only tenant admins can update users." });
  }

  const { role, status, name } = req.body;
  const allowedRoles = ["TENANT_ADMIN", "MANAGER", "USER"];
  const allowedStatus = ["ACTIVE", "DISABLED"];

  const user = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (role && allowedRoles.includes(role)) {
    user.role = role;
  }
  if (status && allowedStatus.includes(status)) {
    user.status = status;
  }
  if (name) {
    user.name = String(name).trim();
  }

  await user.save();

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  });
});

export default router;
