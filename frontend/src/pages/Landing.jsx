import { Link } from "react-router-dom";
import GlassCard from "../components/GlassCard";

export default function Landing() {
  return (
    <div className="page-shell">
      <section className="hero">
        <span className="hero-eyebrow">Community health, watched over</span>
        <h1>Report a health concern. Get it seen by the right people, fast.</h1>
        <p>
          CareLink connects community members with local health workers, so symptoms, outbreaks, and
          hazards get noticed, prioritized, and followed up on, even in areas with limited resources.
        </p>
        <div className="hero-actions">
          <Link to="/report" className="btn btn-primary">
            Report a concern
          </Link>
          <Link to="/track" className="btn btn-secondary">
            Track an existing report
          </Link>
        </div>
      </section>

      <div className="option-grid">
        <Link to="/report" style={{ textDecoration: "none" }}>
          <GlassCard className="option-card">
            <div className="option-icon" aria-hidden="true">
              ✚
            </div>
            <h3>Submit a report</h3>
            <p>Tell us what you are seeing: a symptom, a cluster of illness, or a hazard nearby. Takes about two minutes.</p>
          </GlassCard>
        </Link>

        <Link to="/track" style={{ textDecoration: "none" }}>
          <GlassCard className="option-card">
            <div className="option-icon" aria-hidden="true">
              ⟳
            </div>
            <h3>Track a report</h3>
            <p>Already reported something? Enter your reference code to see where things stand.</p>
          </GlassCard>
        </Link>

        <Link to="/login" style={{ textDecoration: "none" }}>
          <GlassCard className="option-card">
            <div className="option-icon" aria-hidden="true">
              ◎
            </div>
            <h3>Health worker sign in</h3>
            <p>Review the triage queue, assign reports, and track incidents forming across your district.</p>
          </GlassCard>
        </Link>
      </div>
    </div>
  );
}
