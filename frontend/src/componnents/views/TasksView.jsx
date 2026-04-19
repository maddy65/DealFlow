import { useEffect, useState } from "react";
import styles from "./views.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function TasksView({ token }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const res = await fetch(`${API_BASE}/tasks/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = tasks.filter((task) => {
    if (filter === "pending") return task.status === "PENDING";
    if (filter === "completed") return task.status === "COMPLETED";
    if (filter === "overdue") return task.status === "OVERDUE";
    return true;
  });

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.view}>
      <h1>My Tasks</h1>

      <div className={styles.filters}>
        {["all", "pending", "completed", "overdue"].map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.active : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.tasksList}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>No tasks</p>
        ) : (
          filtered.map((task) => (
            <div key={task._id} className={`${styles.taskRow} ${styles["status-" + task.status.toLowerCase()]}`}>
              <div className={styles.taskType}>{task.taskType}</div>
              <div className={styles.taskContent}>
                <div className={styles.taskTitle}>{task.title}</div>
                <div className={styles.taskLead}>{task.leadId?.name}</div>
              </div>
              <div className={styles.taskDue}>
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
              </div>
              <div className={`${styles.taskPriority} ${styles["p-" + task.priority.toLowerCase()]}`}>
                {task.priority}
              </div>
              <div className={`${styles.taskStatus} ${styles["s-" + task.status.toLowerCase()]}`}>
                {task.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
