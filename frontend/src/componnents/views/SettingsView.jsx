import { useEffect, useState } from "react";
import styles from "./views.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function SettingsView({ token }) {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStage, setNewStage] = useState({ name: "", color: "#3b82f6" });

  useEffect(() => {
    fetchStages();
  }, []);

  async function fetchStages() {
    try {
      const res = await fetch(`${API_BASE}/stages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateStage() {
    if (!newStage.name) return;
    try {
      const res = await fetch(`${API_BASE}/stages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStage),
      });
      const created = await res.json();
      setStages([...stages, created]);
      setNewStage({ name: "", color: "#3b82f6" });
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.view}>
      <h1>Settings</h1>

      <div className={styles.section}>
        <h2>Pipeline Stages</h2>

        <div style={{ marginBottom: "24px", padding: "16px", background: "#f7fafc", borderRadius: "8px" }}>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Stage Name</label>
            <input
              type="text"
              value={newStage.name}
              onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
              placeholder="e.g., Proposal"
              style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e0", borderRadius: "6px" }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Color</label>
            <input
              type="color"
              value={newStage.color}
              onChange={(e) => setNewStage({ ...newStage, color: e.target.value })}
              style={{ width: "100%", padding: "6px", border: "1px solid #cbd5e0", borderRadius: "6px", height: "40px" }}
            />
          </div>

          <button
            onClick={handleCreateStage}
            style={{
              padding: "8px 16px",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Add Stage
          </button>
        </div>

        <div>
          {stages.map((stage) => (
            <div
              key={stage._id}
              style={{
                padding: "12px",
                background: "white",
                marginBottom: "8px",
                borderRadius: "6px",
                borderLeft: `4px solid ${stage.color}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>{stage.name}</strong>
              <div style={{ width: "20px", height: "20px", backgroundColor: stage.color, borderRadius: "4px" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
