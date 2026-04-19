import { useEffect, useState } from "react";
import styles from "./views.module.css";

const API_BASE = "http://localhost:4000/api";

export default function TeamView({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.view}>
      <h1>Team Members</h1>

      {users.length === 0 ? (
        <p className={styles.empty}>No users</p>
      ) : (
        <div className={styles.tasksList}>
          {users.map((user) => (
            <div key={user._id} className={styles.taskRow}>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <span className={styles.taskType}>{user.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
