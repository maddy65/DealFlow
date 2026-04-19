import React from "react";
import styles from "./Sidebar.module.css";

export default function Sidebar({ active, onNavigate, user, onLogout }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "pipeline", label: "Pipeline", icon: "🏗️" },
    { id: "tasks", label: "My Tasks", icon: "✓" },
    { id: "leads", label: "All Leads", icon: "👥" },
  ];

  if (user?.role === "TENANT_ADMIN") {
    menuItems.push({ id: "users", label: "Team", icon: "👤" });
    menuItems.push({ id: "settings", label: "Settings", icon: "⚙️" });
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>DF</div>
        <div className={styles.logoText}>DealFlow</div>
      </div>

      <div className={styles.user}>
        <div className={styles.userName}>{user?.name}</div>
        <div className={styles.userRole}>{user?.role}</div>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${active === item.id ? styles.active : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </nav>

      <button className={styles.logout} onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}
