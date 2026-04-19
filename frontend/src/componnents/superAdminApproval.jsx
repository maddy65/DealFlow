import React, { useState } from "react";
import styles from "./signup.module.css";

const API_BASE = "http://localhost:4000/api";

export default function SuperAdminApproval({ onToggle }) {
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState({ tenants: [], users: [] });
  const [serverError, setServerError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function loadPending() {
    setServerError("");
    setStatusMessage("");
    try {
      const response = await fetch(`${API_BASE}/admin/pending`, {
        headers: { "x-super-admin-password": password },
      });
      const result = await response.json();
      if (!response.ok) {
        setServerError(result.error || "Unable to load pending requests.");
        return;
      }
      setPending(result);
    } catch (err) {
      setServerError("Unable to connect to the server.");
    }
  }

  async function handleAction(action, type, payload) {
    setServerError("");
    setStatusMessage("");
    try {
      const response = await fetch(`${API_BASE}/admin/${action}-${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-super-admin-password": password },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setServerError(result.error || "Unable to perform action.");
        return;
      }
      setStatusMessage(result.message);
      await loadPending();
    } catch (err) {
      setServerError("Unable to connect to the server.");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.left}>
          <div className={styles.brand}>
            <div className={styles.logo}>DF</div>
            <div>
              <div style={{ fontWeight: 700, color: "#e6eef8" }}>Super Admin</div>
              <div className={styles.small}>Approve pending tenant and user requests.</div>
            </div>
          </div>

          <div className={styles.heroTitle}>Approval dashboard</div>
          <div className={styles.heroText}>Enter your super admin password to review and approve tenant and user requests.</div>

          <svg className={styles.illustration} width="260" height="160" viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="20" width="240" height="120" rx="16" fill="url(#g)" opacity="0.18" />
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="#06b6d4" />
                <stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className={styles.right}>
          <div>
            <div className={styles.formTitle}>Super admin approval</div>
            <div className={styles.formSub}>Use the secret password to fetch pending tenant/user requests.</div>
          </div>

          <div className={styles.form}>
            <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} placeholder="Super admin password" aria-label="Super admin password" />
            <button type="button" className={styles.submit} onClick={loadPending}>Load pending requests</button>
            {serverError && <div className={styles.error}>{serverError}</div>}
            {statusMessage && <div style={{ color: "#9ad9bf", fontSize: 13 }}>{statusMessage}</div>}
          </div>

          {pending.tenants.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className={styles.formTitle}>Pending tenants</div>
              {pending.tenants.map((tenant) => (
                <div key={tenant.slug} style={{ padding: 12, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, marginTop: 10 }}>
                  <div style={{ fontWeight: 700 }}>{tenant.name}</div>
                  <div style={{ fontSize: 13, color: "#9fb3cf" }}>Slug: {tenant.slug}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button type="button" className={styles.submit} onClick={() => handleAction("approve", "tenant", { slug: tenant.slug })}>Approve</button>
                    <button type="button" className={styles.submit} style={{ background: "#ef4444" }} onClick={() => handleAction("reject", "tenant", { slug: tenant.slug })}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pending.users.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className={styles.formTitle}>Pending users</div>
              {pending.users.map((user) => (
                <div key={user.id} style={{ padding: 12, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, marginTop: 10 }}>
                  <div style={{ fontWeight: 700 }}>{user.name}</div>
                  <div style={{ fontSize: 13, color: "#9fb3cf" }}>Email: {user.email}</div>
                  <div style={{ fontSize: 13, color: "#9fb3cf" }}>Role: {user.role}</div>
                  <div style={{ fontSize: 13, color: "#9fb3cf" }}>Tenant: {user.tenantName} ({user.tenantSlug})</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button type="button" className={styles.submit} onClick={() => handleAction("approve", "user", { email: user.email, tenantSlug: user.tenantSlug })}>Approve</button>
                    <button type="button" className={styles.submit} style={{ background: "#ef4444" }} onClick={() => handleAction("reject", "user", { email: user.email, tenantSlug: user.tenantSlug })}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.footer} style={{ marginTop: 16 }}>
            <button type="button" onClick={() => onToggle && onToggle("login")} style={{ background: "none", border: "none", color: "#cfefff", fontWeight: 700, cursor: "pointer", padding: 0 }}>Back to login</button>
          </div>
        </div>
      </div>
    </div>
  );
}
