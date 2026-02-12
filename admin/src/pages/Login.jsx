import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("admin", JSON.stringify(data));
        navigate("/dashboard");
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
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