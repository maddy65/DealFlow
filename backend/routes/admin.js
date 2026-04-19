import express from "express";
import Tenant from "../models/Tanents.js";
import User from "../models/User.js";

const router = express.Router();
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "Kola@123";

function verifySuperPassword(req, res, next) {
  const password = req.header("x-super-admin-password") || req.body.superPassword;
  if (!password || password !== SUPER_ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.get("/pending", verifySuperPassword, async (req, res) => {
  const tenants = await Tenant.find({ status: "PENDING" }).select("name slug createdAt").lean();
  const users = await User.find({ status: "PENDING" })
    .populate({ path: "tenantId", select: "slug name" })
    .select("name email role createdAt tenantId")
    .lean();

  const formattedUsers = users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantSlug: user.tenantId?.slug || "",
    tenantName: user.tenantId?.name || "",
    createdAt: user.createdAt,
  }));

  res.json({ tenants, users: formattedUsers });
});

router.post("/approve-tenant", verifySuperPassword, async (req, res) => {
  const { slug } = req.body;
  if (!slug) {
    return res.status(400).json({ error: "Tenant slug is required." });
  }

  const tenant = await Tenant.findOne({ slug: String(slug).trim().toLowerCase() });
  if (!tenant) {
    return res.status(404).json({ error: "Tenant not found." });
  }
  if (tenant.status !== "PENDING") {
    return res.status(400).json({ error: "Tenant is not pending approval." });
  }

  tenant.status = "ACTIVE";
  await tenant.save();
  await User.updateMany({ tenantId: tenant._id, status: "PENDING" }, { status: "ACTIVE" });

  res.json({ message: "Tenant and associated pending users approved successfully." });
});

router.post("/approve-user", verifySuperPassword, async (req, res) => {
  const { email, tenantSlug } = req.body;
  if (!email || !tenantSlug) {
    return res.status(400).json({ error: "User email and tenant slug are required." });
  }

  const tenant = await Tenant.findOne({ slug: String(tenantSlug).trim().toLowerCase() });
  if (!tenant) {
    return res.status(404).json({ error: "Tenant not found." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ tenantId: tenant._id, email: normalizedEmail });
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  if (user.status !== "PENDING") {
    return res.status(400).json({ error: "User is not pending approval." });
  }

  user.status = "ACTIVE";
  await user.save();

  res.json({ message: "User approved successfully." });
});

router.post("/reject-tenant", verifySuperPassword, async (req, res) => {
  const { slug } = req.body;
  if (!slug) {
    return res.status(400).json({ error: "Tenant slug is required." });
  }

  const tenant = await Tenant.findOne({ slug: String(slug).trim().toLowerCase() });
  if (!tenant) {
    return res.status(404).json({ error: "Tenant not found." });
  }

  await User.deleteMany({ tenantId: tenant._id });
  await tenant.deleteOne();

  res.json({ message: "Tenant request rejected and removed." });
});

router.post("/reject-user", verifySuperPassword, async (req, res) => {
  const { email, tenantSlug } = req.body;
  if (!email || !tenantSlug) {
    return res.status(400).json({ error: "User email and tenant slug are required." });
  }

  const tenant = await Tenant.findOne({ slug: String(tenantSlug).trim().toLowerCase() });
  if (!tenant) {
    return res.status(404).json({ error: "Tenant not found." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ tenantId: tenant._id, email: normalizedEmail });
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  await user.deleteOne();
  res.json({ message: "User request rejected and removed." });
});

export default router;
