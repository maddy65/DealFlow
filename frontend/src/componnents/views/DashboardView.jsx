import { useEffect, useState } from "react";
import styles from "./views.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function DashboardView({ token }) {
  const [summary, setSummary] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [sumRes, taskRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/dashboard/today-tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const sum = await sumRes.json();
      const tasks = await taskRes.json();

      setSummary(sum);

      setTodayTasks(tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.view}>
      <h1>Dashboard</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{summary?.totalLeads || 0}</div>
          <div className={styles.statLabel}>Total Leads</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{summary?.totalTasks || 0}</div>
          <div className={styles.statLabel}>Tasks</div>
        </div>
        <div className={styles.statCard + " " + styles.alert}>
          <div className={styles.statNumber}>{summary?.overdueTasks || 0}</div>
          <div className={styles.statLabel}>Overdue</div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Today's Tasks</h2>
        {todayTasks.length === 0 ? (
          <p className={styles.empty}>No tasks for today</p>
        ) : (
          <div className={styles.taskList}>
            {todayTasks.map((task) => (
              <div key={task._id} className={styles.taskItem}>
                <div className={styles.taskTitle}>{task.title}</div>
                <div className={styles.taskMeta}>
                  {task.leadId?.name} • {task.priority}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
