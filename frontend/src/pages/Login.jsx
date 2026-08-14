import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import Button from "../components/Button";
import { ErrorAlert } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell" style={{ maxWidth: 440, margin: "0 auto" }}>
      <div className="page-header" style={{ padding: "60px 0 24px", display: "block", textAlign: "center" }}>
        <h1>Health worker sign in</h1>
        <p style={{ margin: "6px auto 0" }}>Access the triage queue and manage community reports.</p>
      </div>

      <GlassCard>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <ErrorAlert message={error} />

          <Button type="submit" block loading={isSubmitting} style={{ marginTop: 6 }}>
            Sign in
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
