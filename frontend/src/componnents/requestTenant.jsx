import React, { useState } from "react";
import styles from "./signup.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function RequestTenant({ onToggle }) {
  const [form, setForm] = useState({ name: "", slug: "", adminName: "", adminEmail: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Please enter a tenant name.";
    if (!form.adminName.trim()) errs.adminName = "Please enter an admin name.";
    if (!form.adminEmail.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) errs.adminEmail = "Enter a valid admin email.";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setServerError("");
    setStatusMessage("");

    try {
      const response = await fetch(`${API_BASE}/tenants/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          admin: {
            name: form.adminName,
            email: form.adminEmail,
            password: form.password,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setServerError(result.error || "Unable to submit tenant request.");
        return;
      }
      setStatusMessage(result.message || "Tenant request submitted. Await approval.");
      setForm((prev) => ({ ...prev, password: "", confirm: "" }));
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
              <div style={{ fontWeight: 700, color: "#e6eef8" }}>DealFlow</div>
              <div className={styles.small}>Organize. Track. Grow.</div>
            </div>
          </div>

          <div className={styles.heroTitle}>Request a new tenant</div>
          <div className={styles.heroText}>Create a workspace request for your organization. A super admin must approve the tenant before it becomes active.</div>

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
            <div className={styles.formTitle}>Request workspace registration</div>
            <div className={styles.formSub}>Enter tenant details and an administrator account for review.</div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <input name="name" value={form.name} onChange={handleChange} className={styles.input} placeholder="Tenant name" aria-label="Tenant name" />
            {errors.name && <div className={styles.error}>{errors.name}</div>}

            <input name="slug" value={form.slug} onChange={handleChange} className={styles.input} placeholder="Tenant slug (optional)" aria-label="Tenant slug" />

            <input name="adminName" value={form.adminName} onChange={handleChange} className={styles.input} placeholder="Admin full name" aria-label="Admin full name" />
            {errors.adminName && <div className={styles.error}>{errors.adminName}</div>}

            <input name="adminEmail" value={form.adminEmail} onChange={handleChange} className={styles.input} placeholder="Admin email" aria-label="Admin email" />
            {errors.adminEmail && <div className={styles.error}>{errors.adminEmail}</div>}

            <div className={styles.row}>
              <input name="password" type="password" value={form.password} onChange={handleChange} className={styles.input} placeholder="Password" aria-label="Password" />
              <input name="confirm" type="password" value={form.confirm} onChange={handleChange} className={styles.input} placeholder="Confirm password" aria-label="Confirm password" />
            </div>
            {errors.password && <div className={styles.error}>{errors.password}</div>}
            {errors.confirm && <div className={styles.error}>{errors.confirm}</div>}

            {serverError && <div className={styles.error}>{serverError}</div>}
            {statusMessage && <div style={{ color: "#9ad9bf", fontSize: 13 }}>{statusMessage}</div>}

            <button type="submit" className={styles.submit}>Request tenant</button>
            <div className={styles.footer}>Already have a workspace? <button type="button" onClick={() => onToggle && onToggle("login")} style={{ background: "none", border: "none", color: "#cfefff", fontWeight: 700, cursor: "pointer", padding: 0 }}>Log in</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}
