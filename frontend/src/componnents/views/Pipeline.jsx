import { useEffect, useState } from "react";
import styles from "./views.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function Pipeline({ token }) {
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipeline();
  }, []);

  async function fetchPipeline() {
    try {
      const res = await fetch(`${API_BASE}/dashboard/leads-by-stage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPipeline(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.view}>
      <h1>Lead Pipeline</h1>

      <div className={styles.kanban}>
        {pipeline.map((stage) => (
          <div key={stage.stage.id} className={styles.stage}>
            <div className={styles.stageHeader} style={{ borderTopColor: stage.stage.color }}>
              <h3>{stage.stage.name}</h3>
              <span className={styles.stageCount}>{stage.count}</span>
            </div>

            <div className={styles.leadsList}>
              {stage.leads.length === 0 ? (
                <p className={styles.empty}>No leads</p>
              ) : (
                stage.leads.map((lead) => (
                  <div key={lead._id} className={styles.leadCard}>
                    <div className={styles.leadName}>{lead.name}</div>
                    <div className={styles.leadCompany}>{lead.company || "—"}</div>
                    <div className={styles.leadPriority}>
                      <span className={`${styles.priority} ${styles["p-" + lead.priority.toLowerCase()]}`}>
                        {lead.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
