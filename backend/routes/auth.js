import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tanents.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function buildTenantSlug(value) {
  const normalized = String(value || "dealflow").trim().toLowerCase();
  return normalized.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
}

router.post("/signup", async (req, res) => {
  const { name, tenantSlug, email, password } = req.body;
  if (!name || !tenantSlug || !email || !password) {
    return res.status(400).json({ error: "Name, tenant slug, email, and password are required. Tenant creation is controlled by the workspace owner." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(400).json({ error: "A user with this email already exists." });
  }

  const tenant = await Tenant.findOne({ slug: String(tenantSlug).trim().toLowerCase() });
  if (!tenant) {
    return res.status(404).json({ error: "Tenant not found. Tenant creation is handled by the backend." });
  }

  if (tenant.status !== "ACTIVE") {
    return res.status(403).json({ error: "Tenant is not active yet. Your request will be reviewed by the super admin." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = new User({
    tenantId: tenant._id,
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash,
    role: "USER",
    status: "PENDING",
  });
  await user.save();

  res.status(201).json({
    status: "PENDING",
    message: "Your access request has been submitted and is awaiting approval.",
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  if (user.status !== "ACTIVE") {
    return res.status(403).json({ error: "Your account is pending approval or has been disabled." });
  }

  const tenant = await Tenant.findById(user.tenantId);
  if (!tenant || tenant.status !== "ACTIVE") {
    return res.status(403).json({ error: "Tenant is not active yet or has been suspended." });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const token = jwt.sign({ userId: user._id, tenantId: user.tenantId }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({
    token,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export default router;
