import { useEffect, useState } from "react";

const API_BASE = "http://localhost:4000/api";

export default function Dashboard({ token, user, onLogout }) {
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "Referral",
    status: "NEW",
    priority: "MEDIUM",
    score: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setError("");
    try {
      const response = await fetch(`${API_BASE}/leads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Unable to load leads");
      const data = await response.json();
      setLeads(data);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const url = selectedId ? `${API_BASE}/leads/${selectedId}` : `${API_BASE}/leads`;
      const method = selectedId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to save lead.");
      }

      const saved = await response.json();
      if (selectedId) {
        setLeads((current) => current.map((lead) => (lead._id === saved._id ? saved : lead)));
      } else {
        setLeads((current) => [saved, ...current]);
      }
      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        source: "Referral",
        status: "NEW",
        priority: "MEDIUM",
        score: 0,
      });
      setSelectedId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(lead) {
    setSelectedId(lead._id);
    setForm({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      source: lead.source || "Referral",
      status: lead.status || "NEW",
      priority: lead.priority || "MEDIUM",
      score: lead.score || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!confirm("Remove this lead?")) return;
    try {
      const response = await fetch(`${API_BASE}/leads/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Unable to delete lead.");
      setLeads((current) => current.filter((lead) => lead._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="dashboardShell">
      <header className="dashboardHeader">
        <div>
          <div className="dashboardBrand">DealFlow</div>
          <div className="dashboardSubtitle">Lead management + workflow automation for your team.</div>
        </div>
        <div className="dashboardActions">
          <span>{user?.name || "User"}</span>
          <button className="secondaryButton" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="panel">
        <div className="panelTitle">Add or update a lead</div>
        <form className="leadForm" onSubmit={handleSubmit}>
          <div className="formRow">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Lead name" required />
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" />
          </div>
          <div className="formRow">
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
            <input name="company" value={form.company} onChange={handleChange} placeholder="Company" />
          </div>
          <div className="formRow">
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>
            <select name="priority" value={form.priority} onChange={handleChange}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="formRow">
            <input name="source" value={form.source} onChange={handleChange} placeholder="Source" />
            <input name="score" value={form.score} onChange={handleChange} type="number" min="0" placeholder="Score" />
          </div>
          {error && <div className="errorMessage">{error}</div>}
          <div className="formFooter">
            <button type="submit" disabled={saving}>
              {selectedId ? "Update lead" : "Create lead"}
            </button>
            {selectedId && (
              <button type="button" className="secondaryButton" onClick={() => {
                setSelectedId(null);
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  company: "",
                  source: "Referral",
                  status: "NEW",
                  priority: "MEDIUM",
                  score: 0,
                });
              }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panelTitle">Your leads</div>
        {error ? (
          <div className="errorMessage">{error}</div>
        ) : leads.length === 0 ? (
          <div className="emptyState">No leads yet — add one to get started.</div>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>{lead.name}</td>
                    <td>{lead.company || "—"}</td>
                    <td>{lead.status}</td>
                    <td>{lead.priority}</td>
                    <td>{lead.ownerId ? lead.ownerId : "You"}</td>
                    <td>
                      <button className="smallButton" onClick={() => handleEdit(lead)}>
                        Edit
                      </button>
                      <button className="smallButton dangerButton" onClick={() => handleDelete(lead._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
