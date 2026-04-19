import React, { useState } from "react";
import Signup from "./signup";
import Login from "./login";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("signup");

  return (
    <div>
      {mode === "signup" && <Signup onToggle={setMode} />}
      {mode === "login" && <Login onToggle={setMode} onLogin={onLogin} />}
    </div>
  );
}
