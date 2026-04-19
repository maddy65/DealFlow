import { useEffect, useState } from "react";
import styles from "./views.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const emptyLead = {
  name: "",
  email: "",
  phone: "",
  company: "",
  source: "Website",
  priority: "MEDIUM",
  status: "NEW",
  probability: 0,
  closeDate: "",
  nextFollowUpDate: "",
  tags: "",
};

const emptyTask = {
  title: "",
  description: "",
  taskType: "EMAIL",
  category: "NURTURING",
  dueDate: "",
  priority: "MEDIUM",
};

const emptyComment = "";

export default function LeadsView({ token, users = [] }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [newLead, setNewLead] = useState(emptyLead);
  
  const [detailLeadId, setDetailLeadId] = useState(null);
  const [detailLead, setDetailLead] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState(emptyComment);
  const [newTask, setNewTask] = useState(emptyTask);
  const [showTaskForm, setShowTaskForm] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (detailLeadId) {
      fetchLeadDetails();
    }
  }, [detailLeadId]);

  function handleSelectLead(id) {
    setSelectedLeadIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function handleSelectAll(event) {
    const checked = event.target.checked;
    if (checked) {
      setSelectedLeadIds(leads.map((lead) => lead._id));
    } else {
      setSelectedLeadIds([]);
    }
  }

  async function fetchLeads() {
    try {
      const res = await fetch(`${API_BASE}/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLeadDetails() {
    try {
      const [commentsRes, tasksRes] = await Promise.all([
        fetch(`${API_BASE}/leads/${detailLeadId}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/leads/${detailLeadId}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const commentsData = await commentsRes.json();
      const tasksData = await tasksRes.json();
      setComments(Array.isArray(commentsData) ? commentsData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      
      const leadData = leads.find((l) => l._id === detailLeadId);
      if (leadData) setDetailLead(leadData);
    } catch (err) {
      console.error(err);
    }
  }

  function resetForm() {
    setEditingLeadId(null);
    setNewLead(emptyLead);
    setError("");
  }

  function openFormForNew() {
    resetForm();
    setFormVisible(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setNewLead((prev) => ({ ...prev, [name]: value }));
  }

  function handleTaskChange(event) {
    const { name, value } = event.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        ...newLead,
        tags: newLead.tags ? newLead.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      };

      const url = editingLeadId ? `${API_BASE}/leads/${editingLeadId}` : `${API_BASE}/leads`;
      const method = editingLeadId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unable to save lead.");
      }

      const saved = await res.json();
      setLeads((current) => {
        if (editingLeadId) {
          return current.map((lead) => (lead._id === saved._id ? saved : lead));
        }
        return [saved, ...current];
      });
      resetForm();
      setFormVisible(false);
    } catch (err) {
      setError(err.message || "Unable to save lead.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(lead) {
    setEditingLeadId(lead._id);
    setFormVisible(true);
    setNewLead({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      source: lead.source || "Website",
      priority: lead.priority || "MEDIUM",
      status: lead.status || "NEW",
      probability: lead.probability != null ? lead.probability : 0,
      closeDate: lead.closeDate ? lead.closeDate.slice(0, 10) : "",
      nextFollowUpDate: lead.nextFollowUpDate ? lead.nextFollowUpDate.slice(0, 10) : "",
      tags: Array.isArray(lead.tags) ? lead.tags.join(", ") : lead.tags || "",
    });
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this lead permanently?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/leads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unable to delete lead.");
      }
      setLeads((current) => current.filter((lead) => lead._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to delete lead.");
    }
  }

  async function handleCancelLead(id) {
    const confirmed = window.confirm("Cancel this lead and mark it as cancelled?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/leads/${id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unable to cancel lead.");
      }
      const updated = await res.json();
      setLeads((current) => current.map((lead) => (lead._id === updated._id ? updated : lead)));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to cancel lead.");
    }
  }

  function handleViewLead(lead) {
    setDetailLeadId(lead._id);
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/leads/${detailLeadId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unable to add comment.");
      }

      const newCommentData = await res.json();
      setComments((prev) => [...prev, newCommentData]);
      setNewComment(emptyComment);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to add comment.");
    }
  }

  async function handleAddTask() {
    if (!newTask.title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/leads/${detailLeadId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unable to create task.");
      }

      const task = await res.json();
      setTasks((prev) => [...prev, task]);
      setNewTask(emptyTask);
      setShowTaskForm(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to create task.");
    }
  }

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.viewWithDetail}>
      <div className={styles.mainContent}>
        <div className={styles.view}>
          <div className={styles.pageHeader}>
            <div>
              <h1>All Leads</h1>
              <p className={styles.subtitle}>Create and manage your lead pipeline from here.</p>
            </div>
            <button className={styles.primaryBtn} onClick={openFormForNew}>
              Add Lead
            </button>
          </div>

          {formVisible && (
            <form className={styles.formSection} onSubmit={handleSubmit}>
              <div className={styles.formHeader}>
                <div>
                  <h2>{editingLeadId ? "Update Lead" : "New Lead"}</h2>
                  <p className={styles.subtitle}>Separate form fields make lead entry clearer and faster.</p>
                </div>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.dangerOutline}`}
                  onClick={() => {
                    resetForm();
                    setFormVisible(false);
                  }}
                >
                  Close
                </button>
              </div>

              {error && <div className={styles.errorMessage}>{error}</div>}

              <div className={styles.formRow}>
                <label className={styles.fieldLabel}>
                  Name
                  <input
                    name="name"
                    value={newLead.name}
                    onChange={handleChange}
                    className={styles.inputField}
                    required
                  />
                </label>
                <label className={styles.fieldLabel}>
                  Email
                  <input
                    name="email"
                    type="email"
                    value={newLead.email}
                    onChange={handleChange}
                    className={styles.inputField}
                    required
                  />
                </label>
              </div>

              <div className={styles.formRow}>
                <label className={styles.fieldLabel}>
                  Company
                  <input
                    name="company"
                    value={newLead.company}
                    onChange={handleChange}
                    className={styles.inputField}
                  />
                </label>
                <label className={styles.fieldLabel}>
                  Phone
                  <input
                    name="phone"
                    value={newLead.phone}
                    onChange={handleChange}
                    className={styles.inputField}
                  />
                </label>
              </div>

              <div className={styles.formRow}>
                <label className={styles.fieldLabel}>
                  Source
                  <input
                    name="source"
                    value={newLead.source}
                    onChange={handleChange}
                    className={styles.inputField}
                    placeholder="Source"
                  />
                </label>
                <label className={styles.fieldLabel}>
                  Status
                  <select
                    name="status"
                    value={newLead.status || "NEW"}
                    onChange={handleChange}
                    className={styles.inputField}
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="PROPOSAL">Proposal</option>
                    <option value="WON">Won</option>
                    <option value="LOST">Lost</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </label>
              </div>

              <div className={styles.formRow}>
                <label className={styles.fieldLabel}>
                  Priority
                  <select
                    name="priority"
                    value={newLead.priority}
                    onChange={handleChange}
                    className={styles.inputField}
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </label>
                <label className={styles.fieldLabel}>
                  Probability
                  <input
                    name="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={newLead.probability}
                    onChange={handleChange}
                    className={styles.inputField}
                  />
                </label>
              </div>

              <div className={styles.formRow}>
                <label className={styles.fieldLabel}>
                  Close Date
                  <input
                    name="closeDate"
                    type="date"
                    value={newLead.closeDate || ""}
                    onChange={handleChange}
                    className={styles.inputField}
                  />
                </label>
                <label className={styles.fieldLabel}>
                  Follow Up
                  <input
                    name="nextFollowUpDate"
                    type="date"
                    value={newLead.nextFollowUpDate || ""}
                    onChange={handleChange}
                    className={styles.inputField}
                  />
                </label>
              </div>

              <div className={styles.formRow}>
                <label className={styles.fieldLabel}>
                  Tags
                  <input
                    name="tags"
                    value={newLead.tags}
                    onChange={handleChange}
                    className={styles.inputField}
                    placeholder="Tags, comma separated"
                  />
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  {saving ? "Saving..." : editingLeadId ? "Update Lead" : "Create Lead"}
                </button>
                {editingLeadId && (
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.dangerOutline}`}
                    onClick={() => {
                      resetForm();
                      setFormVisible(false);
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          )}

          <div className={styles.tableWrap}>
            <div className={styles.tableHeader}>
              <div>
                <h2>Lead Grid</h2>
                <p className={styles.subtitle}>Click the 👁️ icon to view lead details, add comments, and create tasks.</p>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className={styles.empty}>No leads available.</div>
            ) : (
              <div className={styles.leadTable}>
                <div className={styles.leadRowHead}>
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.length === leads.length && leads.length > 0}
                      onChange={handleSelectAll}
                    />
                  </div>
                  <div>Name</div>
                  <div>Company</div>
                  <div>Source</div>
                  <div>Status</div>
                  <div>Probability</div>
                  <div>Close Date</div>
                  <div>Actions</div>
                </div>
                {leads.map((lead) => (
                  <div key={lead._id} className={styles.leadRow}>
                    <div>
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.includes(lead._id)}
                        onChange={() => handleSelectLead(lead._id)}
                      />
                    </div>
                    <div>
                      <strong>{lead.name}</strong>
                      <div className={styles.rowMeta}>{lead.email || ""}</div>
                    </div>
                    <div>{lead.company || "—"}</div>
                    <div>{lead.source || "—"}</div>
                    <div>{lead.status || "NEW"}</div>
                    <div>{lead.probability != null ? `${lead.probability}%` : "—"}</div>
                    <div>{lead.closeDate ? new Date(lead.closeDate).toLocaleDateString() : "—"}</div>
                    <div className={styles.rowActions}>
                      <button className={styles.iconBtn} title="View" onClick={() => handleViewLead(lead)}>
                        👁️
                      </button>
                      <button className={styles.iconBtn} title="Update" onClick={() => handleEdit(lead)}>
                        ✏️
                      </button>
                      <button className={`${styles.iconBtn} ${styles.warningOutline}`} title="Cancel" onClick={() => handleCancelLead(lead._id)}>
                        ❌
                      </button>
                      <button className={`${styles.iconBtn} ${styles.dangerBtn}`} title="Delete" onClick={() => handleDelete(lead._id)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {detailLeadId && detailLead && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <div>
              <h2>{detailLead.name}</h2>
              <p className={styles.subtitle}>{detailLead.company}</p>
            </div>
            <button
              className={styles.iconBtn}
              title="Close"
              onClick={() => {
                setDetailLeadId(null);
                setDetailLead(null);
              }}
            >
              ✕
            </button>
          </div>

          <div className={styles.detailContent}>
            <div className={styles.detailSection}>
              <h3>Lead Info</h3>
              <div className={styles.infoGrid}>
                <div>
                  <label>Email</label>
                  <p>{detailLead.email || "—"}</p>
                </div>
                <div>
                  <label>Phone</label>
                  <p>{detailLead.phone || "—"}</p>
                </div>
                <div>
                  <label>Status</label>
                  <p>{detailLead.status || "NEW"}</p>
                </div>
                <div>
                  <label>Priority</label>
                  <p>{detailLead.priority || "MEDIUM"}</p>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.sectionHeader}>
                <h3>Comments</h3>
              </div>
              <div className={styles.commentsList}>
                {comments.length === 0 ? (
                  <p className={styles.empty}>No comments yet.</p>
                ) : (
                  comments.map((comment, idx) => (
                    <div key={idx} className={styles.commentItem}>
                      <p>{comment.text}</p>
                      <small>{new Date(comment.createdAt).toLocaleString()}</small>
                    </div>
                  ))
                )}
              </div>
              <div className={styles.commentForm}>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className={styles.inputField}
                />
                <button onClick={handleAddComment} className={styles.primaryBtn}>
                  Add
                </button>
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.sectionHeader}>
                <h3>Tasks</h3>
                <button className={styles.smallBtn} onClick={() => setShowTaskForm(!showTaskForm)}>
                  + New Task
                </button>
              </div>

              {showTaskForm && (
                <div className={styles.taskForm}>
                  <input
                    type="text"
                    name="title"
                    value={newTask.title}
                    onChange={handleTaskChange}
                    placeholder="Task title"
                    className={styles.inputField}
                  />
                  <textarea
                    name="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Description"
                    className={styles.inputField}
                  />
                  <div className={styles.formRow}>
                    <select name="category" value={newTask.category} onChange={handleTaskChange} className={styles.inputField}>
                      <option value="IMMEDIATE">Immediate</option>
                      <option value="QUALIFICATION">Qualification</option>
                      <option value="NURTURING">Nurturing</option>
                      <option value="DEAL_PROGRESSION">Deal Progression</option>
                      <option value="DECISION">Decision</option>
                      <option value="REENGAGEMENT">Re-engagement</option>
                      <option value="INTERNAL">Internal</option>
                    </select>
                    <select name="taskType" value={newTask.taskType} onChange={handleTaskChange} className={styles.inputField}>
                      <option value="CALL">Call</option>
                      <option value="EMAIL">Email</option>
                      <option value="DEMO">Demo</option>
                      <option value="PROPOSAL">Proposal</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className={styles.formRow}>
                    <input type="date" name="dueDate" value={newTask.dueDate} onChange={handleTaskChange} className={styles.inputField} />
                    <select name="priority" value={newTask.priority} onChange={handleTaskChange} className={styles.inputField}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div className={styles.formActions}>
                    <button onClick={handleAddTask} className={styles.primaryBtn}>
                      Create Task
                    </button>
                    <button onClick={() => setShowTaskForm(false)} className={`${styles.actionBtn} ${styles.dangerOutline}`}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.tasksList}>
                {tasks.length === 0 ? (
                  <p className={styles.empty}>No tasks yet.</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task._id} className={styles.taskItem}>
                      <div className={styles.taskMeta}>
                        <strong>{task.title}</strong>
                        <span className={styles.badge}>{task.category}</span>
                      </div>
                      <p>{task.description}</p>
                      <div className={styles.taskFooter}>
                        <small>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</small>
                        <small className={styles.priority}>{task.priority}</small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
