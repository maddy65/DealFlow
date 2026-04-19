import express from "express";
import bcrypt from "bcryptjs";
import Tenant from "../models/Tanents.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/public", async (req, res) => {
  const tenants = await Tenant.find({ status: "ACTIVE" }).select("name slug").lean();
  res.json(tenants);
});

router.post("/request", async (req, res) => {
  const { name, slug, admin } = req.body;
  if (!name || !admin || !admin.name || !admin.email || !admin.password) {
    return res.status(400).json({ error: "Tenant name and admin contact details are required for a tenant request." });
  }

  const tenantSlug = slug
    ? String(slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "")
    : `${String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${Date.now()}`;

  const existingTenant = await Tenant.findOne({ slug: tenantSlug });
  if (existingTenant) {
    return res.status(400).json({ error: "This tenant slug is already taken. Please choose another." });
  }

  const tenant = await Tenant.create({
    name: String(name).trim(),
    slug: tenantSlug,
    status: "PENDING",
  });

  const normalizedEmail = String(admin.email).trim().toLowerCase();
  const passwordHash = await bcrypt.hash(String(admin.password), 12);
  await User.create({
    tenantId: tenant._id,
    name: String(admin.name).trim(),
    email: normalizedEmail,
    passwordHash,
    role: "TENANT_ADMIN",
    status: "PENDING",
  });

  res.status(201).json({
    status: "PENDING",
    message: "Tenant request has been submitted for approval. You will receive access once approved.",
  });
});

function systemKeyAuth(req, res, next) {
  const headerKey = req.header("x-system-api-key");
  if (!headerKey || headerKey !== process.env.SYSTEM_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.post("/", systemKeyAuth, async (req, res) => {
  const { name, slug, license, admin } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Tenant name is required." });
  }

  const tenantSlug = slug
    ? String(slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "")
    : `${String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${Date.now()}`;

  const tenant = await Tenant.create({
    name: String(name).trim(),
    slug: tenantSlug,
    license: license || undefined,
    status: "ACTIVE",
  });

  let user = null;
  if (admin && admin.name && admin.email && admin.password) {
    const normalizedEmail = String(admin.email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "Admin email already exists." });
    }

    const passwordHash = await bcrypt.hash(String(admin.password), 12);
    user = await User.create({
      tenantId: tenant._id,
      name: String(admin.name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: "TENANT_ADMIN",
    });
  }

  res.status(201).json({
    tenant: {
      id: tenant._id,
      name: tenant.name,
      slug: tenant.slug,
      license: tenant.license,
      status: tenant.status,
    },
    admin: user
      ? {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      : null,
  });
});

router.get("/", requireAuth, async (req, res) => {
  if (req.user.role !== "TENANT_ADMIN") {
    return res.status(403).json({ error: "Only tenant admins can view tenant details." });
  }

  const tenant = await Tenant.findById(req.user.tenantId).lean();
  if (!tenant) {
    return res.status(404).json({ error: "Tenant not found." });
  }

  res.json({
    id: tenant._id,
    name: tenant.name,
    slug: tenant.slug,
    license: tenant.license,
    status: tenant.status,
  });
});

export default router;
