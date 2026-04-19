import React, { useEffect, useState } from "react";
import styles from "./signup.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function Signup({ onToggle }) {
  const [subMode, setSubMode] = useState("addTenant");
  const [form, setForm] = useState({
    tenantName: "", tenantSlug: "", adminName: "", adminEmail: "", userName: "", userEmail: "", password: "", confirm: "", role: "USER", selectedTenant: "", superPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [tenantOptions, setTenantOptions] = useState([]);

  useEffect(() => {
    if (subMode === "addUser") {
      async function loadTenants() {
        try {
          const response = await fetch(`${API_BASE}/tenants/public`);
          const list = await response.json();
          setTenantOptions(list || []);
        } catch (err) {
          setTenantOptions([]);
        }
      }
      loadTenants();
    }
  }, [subMode]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const errs = {};
    if (subMode === "addTenant") {
      if (!form.tenantName.trim()) errs.tenantName = "Please enter a tenant name.";
      if (!form.adminName.trim()) errs.adminName = "Please enter an admin name.";
      if (!form.adminEmail.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) errs.adminEmail = "Enter a valid admin email.";
      if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
      if (form.password !== form.confirm) errs.confirm = "Passwords do not match.";
    } else {
      if (!form.userName.trim()) errs.userName = "Please enter a user name.";
      if (!form.userEmail.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) errs.userEmail = "Enter a valid email.";
      if (!form.selectedTenant) errs.selectedTenant = "Select a tenant.";
      if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
      if (form.password !== form.confirm) errs.confirm = "Passwords do not match.";
    }
    if (!form.superPassword) errs.superPassword = "Super admin password is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setServerError("");
    setStatusMessage("");

    try {
      let response;
      if (subMode === "addTenant") {
        response = await fetch(`${API_BASE}/tenants`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-system-api-key": form.superPassword },
          body: JSON.stringify({
            name: form.tenantName,
            slug: form.tenantSlug,
            admin: {
              name: form.adminName,
              email: form.adminEmail,
              password: form.password,
            },
          }),
        });
      } else {
        response = await fetch(`${API_BASE}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-super-admin-password": form.superPassword },
          body: JSON.stringify({
            name: form.userName,
            email: form.userEmail,
            password: form.password,
            role: form.role,
            tenantId: form.selectedTenant,
          }),
        });
      }
      const result = await response.json();
      if (!response.ok) {
        setServerError(result.error || "Unable to create.");
        return;
      }
      setStatusMessage(`${subMode === "addTenant" ? "Tenant" : "User"} created successfully.`);
      setForm((prev) => ({ ...prev, password: "", confirm: "", superPassword: "" }));
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
              <div className={styles.small}>Admin Panel</div>
            </div>
          </div>

          <div className={styles.heroTitle}>Admin Sign Up</div>
          <div className={styles.heroText}>Create tenants and users with super admin access.</div>

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
            <div className={styles.formTitle}>Admin Sign Up</div>
            <div className={styles.formSub}>Select option to add tenant or user.</div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => setSubMode("addTenant")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: subMode === "addTenant" ? "1px solid #7c3aed" : "1px solid rgba(255,255,255,0.16)",
                background: subMode === "addTenant" ? "rgba(124,58,237,0.16)" : "rgba(255,255,255,0.04)",
                color: "#e6eef8",
                cursor: "pointer",
              }}
            >
              Add Tenant
            </button>
            <button
              type="button"
              onClick={() => setSubMode("addUser")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: subMode === "addUser" ? "1px solid #7c3aed" : "1px solid rgba(255,255,255,0.16)",
                background: subMode === "addUser" ? "rgba(124,58,237,0.16)" : "rgba(255,255,255,0.04)",
                color: "#e6eef8",
                cursor: "pointer",
              }}
            >
              Add User
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {subMode === "addTenant" ? (
              <>
                <input name="tenantName" value={form.tenantName} onChange={handleChange} className={styles.input} placeholder="Tenant name" aria-label="Tenant name" />
                {errors.tenantName && <div className={styles.error}>{errors.tenantName}</div>}

                <input name="tenantSlug" value={form.tenantSlug} onChange={handleChange} className={styles.input} placeholder="Tenant slug (optional)" aria-label="Tenant slug" />

                <input name="adminName" value={form.adminName} onChange={handleChange} className={styles.input} placeholder="Admin full name" aria-label="Admin full name" />
                {errors.adminName && <div className={styles.error}>{errors.adminName}</div>}

                <input name="adminEmail" value={form.adminEmail} onChange={handleChange} className={styles.input} placeholder="Admin email" aria-label="Admin email" />
                {errors.adminEmail && <div className={styles.error}>{errors.adminEmail}</div>}
              </>
            ) : (
              <>
                <input name="userName" value={form.userName} onChange={handleChange} className={styles.input} placeholder="User full name" aria-label="User full name" />
                {errors.userName && <div className={styles.error}>{errors.userName}</div>}

                <input name="userEmail" value={form.userEmail} onChange={handleChange} className={styles.input} placeholder="User email" aria-label="User email" />
                {errors.userEmail && <div className={styles.error}>{errors.userEmail}</div>}

                <select name="selectedTenant" value={form.selectedTenant} onChange={handleChange} className={styles.input}>
                  <option value="">Select tenant</option>
                  {tenantOptions.map((tenant) => (
                    <option key={tenant.slug} value={tenant._id}>{tenant.name} ({tenant.slug})</option>
                  ))}
                </select>
                {errors.selectedTenant && <div className={styles.error}>{errors.selectedTenant}</div>}

                <select name="role" value={form.role} onChange={handleChange} className={styles.input}>
                  <option value="TENANT_ADMIN">Tenant Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="USER">User</option>
                </select>
              </>
            )}

            <div className={styles.row}>
              <input name="password" type="password" value={form.password} onChange={handleChange} className={styles.input} placeholder="Password" aria-label="Password" />
              <input name="confirm" type="password" value={form.confirm} onChange={handleChange} className={styles.input} placeholder="Confirm password" aria-label="Confirm password" />
            </div>
            {errors.password && <div className={styles.error}>{errors.password}</div>}
            {errors.confirm && <div className={styles.error}>{errors.confirm}</div>}

            <input name="superPassword" type="password" value={form.superPassword} onChange={handleChange} className={styles.input} placeholder="Super admin password" aria-label="Super admin password" />
            {errors.superPassword && <div className={styles.error}>{errors.superPassword}</div>}

            {serverError && <div className={styles.error}>{serverError}</div>}
            {statusMessage && <div style={{ color: "#9ad9bf", fontSize: 13 }}>{statusMessage}</div>}

            <button type="submit" className={styles.submit}>{subMode === "addTenant" ? "Create Tenant" : "Create User"}</button>
            <div className={styles.footer}>Already have an account? <button type="button" onClick={() => onToggle && onToggle("login")} style={{ background: "none", border: "none", color: "#cfefff", fontWeight: 700, cursor: "pointer", padding: 0 }}>Log in</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}
