import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "admin@gmail.com" && password === "admin123") {
      localStorage.setItem("admin", "true");
      navigate("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="admin-login-page">
      <span className="admin-login-orb orb-one" aria-hidden="true" />
      <span className="admin-login-orb orb-two" aria-hidden="true" />

      <form className="admin-login-card" onSubmit={handleLogin}>
        <p className="admin-login-eyebrow">Control Center</p>
        <h1>Admin Portal</h1>
        <p className="admin-login-subtitle">Sign in to manage website content.</p>

        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          placeholder="admin@gmail.com"
          autoComplete="email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Secure Login</button>
      </form>
    </div>
  );
}