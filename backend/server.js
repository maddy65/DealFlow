import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import leadRoutes from "./routes/leads.js";
import workflowRoutes from "./routes/workflow.js";
import usersRoutes from "./routes/users.js";
import tenantsRoutes from "./routes/tenants.js";
import adminRoutes from "./routes/admin.js";
import stagesRoutes from "./routes/stages.js";
import tasksRoutes from "./routes/tasks.js";
import dashboardRoutes from "./routes/dashboard.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dealflow";

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174", "https://dealflow.milaniya.com"] }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/stages", stagesRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/workflow", workflowRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tenants", tenantsRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "DealFlow backend is running." });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB", MONGO_URI);
    app.listen(PORT, () => {
      console.log(`DealFlow backend listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
