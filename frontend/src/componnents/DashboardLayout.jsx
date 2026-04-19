import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "./DashboardLayout.css";
import Pipeline from "./views/Pipeline";
import TasksView from "./views/TasksView";
import LeadsView from "./views/LeadsView";
import DashboardView from "./views/DashboardView";
import TeamView from "./views/TeamView";
import SettingsView from "./views/SettingsView";

const API_BASE = "http://localhost:4000/api";

export default function DashboardLayout({ token, user, onLogout }) {
  const [view, setView] = useState("dashboard");

  const viewComponents = {
    dashboard: <DashboardView token={token} />,
    pipeline: <Pipeline token={token} />,
    tasks: <TasksView token={token} />,
    leads: <LeadsView token={token} />,
    users: <TeamView token={token} />,
    settings: <SettingsView token={token} />,
  };

  return (
    <div className="dashboardLayout">
      <Sidebar active={view} onNavigate={setView} user={user} onLogout={onLogout} />
      <div className="mainContent">
        <div className="contentArea">
          {viewComponents[view]}
        </div>
      </div>
    </div>
  );
}
