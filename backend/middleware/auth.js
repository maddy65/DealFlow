import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tanents.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function requireAuth(req, res, next) {
  const authorization = req.header("Authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authorization.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) throw new Error("User not found");
    if (user.status !== "ACTIVE") {
      return res.status(403).json({ error: "User account is not active." });
    }

    const tenant = await Tenant.findById(user.tenantId);
    if (!tenant || tenant.status !== "ACTIVE") {
      return res.status(403).json({ error: "Tenant is not active." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
