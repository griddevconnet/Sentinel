import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import Button from "../components/Button";
import PasswordInput from "../components/PasswordInput";
import { ErrorAlert } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockedOutSeconds, setLockedOutSeconds] = useState(0);

  useEffect(() => {
    if (lockedOutSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setLockedOutSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockedOutSeconds]);

  const isLockedOut = lockedOutSeconds > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLockedOut) return;

    setError("");
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status === 429) {
          setLockedOutSeconds(err.retryAfterSeconds ? Math.ceil(err.retryAfterSeconds) : 60);
        }
      } else {
        setError("Sign in failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell" style={{ maxWidth: 460, margin: "0 auto" }}>
      <div className="login-hero">
        <div className="option-icon login-icon" aria-hidden="true">
          ◎
        </div>
        <h1>Health worker sign in</h1>
        <p>Access the triage queue and manage community reports.</p>
      </div>

      <GlassCard className="login-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="input"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLockedOut}
              required
            />
          </div>

          <div className="field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label className="field-label" htmlFor="password">
                Password
              </label>
            </div>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <ErrorAlert message={error} />

          {isLockedOut && (
            <div className="alert alert-info" role="status" style={{ marginTop: error ? 10 : 0 }}>
              <span aria-hidden="true">{"\u23F1"}</span>
              <span>
                Too many attempts. You can try again in <strong>{formatCountdown(lockedOutSeconds)}</strong>.
              </span>
            </div>
          )}

          <Button type="submit" block loading={isSubmitting} disabled={isLockedOut} style={{ marginTop: 18 }}>
            {isLockedOut ? `Try again in ${formatCountdown(lockedOutSeconds)}` : "Sign in"}
          </Button>
        </form>
      </GlassCard>

      <p className="login-footnote">
        Not a health worker? Go back to <Link to="/">report a concern</Link> or{" "}
        <Link to="/track">track a report</Link>, no account needed for either.
      </p>
    </div>
  );
}