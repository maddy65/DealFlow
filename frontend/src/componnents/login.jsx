import React, { useState } from "react";
import styles from "./signup.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function Login({ onToggle, onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const errs = {};
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) errs.email = "Enter a valid email.";
    if (form.password.length < 6) errs.password = "Enter your password (min 6 characters).";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setServerError("");

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) {
        setServerError(result.error || "Unable to login.");
        return;
      }
      onLogin(result);
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

          <div className={styles.heroTitle}>Welcome back</div>
          <div className={styles.heroText}>Sign in to continue to your DealFlow workspace and manage your deals.</div>
        </div>

        <div className={styles.right}>
          <div>
            <div className={styles.formTitle}>Log in</div>
            <div className={styles.formSub}>Enter your credentials to access your account.</div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <input name="email" value={form.email} onChange={handleChange} className={styles.input} placeholder="Email address" aria-label="Email address" />
            {errors.email && <div className={styles.error}>{errors.email}</div>}

            <input name="password" type="password" value={form.password} onChange={handleChange} className={styles.input} placeholder="Password" aria-label="Password" />
            {errors.password && <div className={styles.error}>{errors.password}</div>}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className={styles.checkboxRow}><input type="checkbox" /> <span style={{ marginLeft: 8 }}>Remember me</span></label>
              <button type="button" style={{ background: "none", border: "none", color: "#9fb3cf", cursor: "pointer" }}>Forgot?</button>
            </div>

            {serverError && <div className={styles.error}>{serverError}</div>}
            <button type="submit" className={styles.submit}>Sign in</button>
            <div className={styles.footer}>Don't have an account? <button type="button" onClick={() => onToggle && onToggle("signup")} style={{ background: "none", border: "none", color: "#cfefff", fontWeight: 700, cursor: "pointer", padding: 0 }}>Sign up</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}
