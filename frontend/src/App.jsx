import { useEffect, useState } from "react";
import Auth from "./componnents/auth";
import DashboardLayout from "./componnents/DashboardLayout";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("dealflowToken"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("dealflowUser");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("dealflowToken");
    const storedUser = localStorage.getItem("dealflowUser");
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  function handleLogin({ token, user }) {
    localStorage.setItem("dealflowToken", token);
    localStorage.setItem("dealflowUser", JSON.stringify(user));
    setToken(token);
    setUser(user);
  }

  function handleLogout() {
    localStorage.removeItem("dealflowToken");
    localStorage.removeItem("dealflowUser");
    setToken(null);
    setUser(null);
  }

  return token ? (
    <DashboardLayout token={token} user={user} onLogout={handleLogout} />
  ) : (
    <Auth onLogin={handleLogin} />
  );
}

export default App
