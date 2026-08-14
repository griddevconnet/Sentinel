import { useState } from "react";
import { Link } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import Button from "../components/Button";
import { ErrorAlert } from "../components/Feedback";
import { reportsApi } from "../api/reports";
import { ApiError } from "../api/client";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  LANGUAGE_OPTIONS,
  SYMPTOM_OPTIONS,
} from "../utils/constants";

const CATEGORIES = Object.keys(CATEGORY_LABELS);

const initialForm = {
  category: "individual_symptom",
  description: "",
  symptoms: [],
  affectedCount: 1,
  addressText: "",
  isAnonymous: false,
  reporterContact: "",
  reporterLanguage: "en",
};

export default function ReportForm() {
  const [form, setForm] = useState(initialForm);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedReport, setSubmittedReport] = useState(null);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleSymptom = (value) => {
    setForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(value)
        ? prev.symptoms.filter((s) => s !== value)
        : [...prev.symptoms, value],
    }));
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }
    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocationStatus("captured");
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.description.trim().length < 5) {
      setError("Please add a little more detail so a health worker understands the situation.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        isAnonymous: form.isAnonymous,
        reporterLanguage: form.reporterLanguage,
        category: form.category,
        description: form.description.trim(),
        symptoms: form.symptoms,
        affectedCount: Number(form.affectedCount) || 1,
        addressText: form.addressText.trim() || undefined,
        location: location || undefined,
      };
      if (!form.isAnonymous && form.reporterContact.trim()) {
        payload.reporterContact = form.reporterContact.trim();
      }

      const res = await reportsApi.submit(payload);
      setSubmittedReport(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We could not submit your report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedReport) {
    return (
      <div className="page-shell" style={{ maxWidth: 620, margin: "0 auto" }}>
        <GlassCard style={{ marginTop: 48, textAlign: "center" }}>
          <div className="option-icon" style={{ margin: "0 auto 18px" }} aria-hidden="true">
            ✓
          </div>
          <h2 style={{ marginBottom: 10 }}>Your report has been received</h2>
          <p style={{ color: "#5c6b85", marginBottom: 26 }}>
            A health worker will review this shortly. Save your reference code below to check on progress
            at any time.
          </p>
          <div
            className="glass"
            style={{
              padding: "18px 24px",
              fontFamily: "var(--font-display)",
              fontSize: "1.6rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "var(--blue-700)",
              marginBottom: 26,
            }}
          >
            {submittedReport.report_token}
          </div>
          <div className="hero-actions">
            <Link to={`/track?token=${submittedReport.report_token}`} className="btn btn-primary">
              Track this report
            </Link>
            <Link to="/" className="btn btn-secondary">
              Return home
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1>Report a health concern</h1>
          <p>Share what you are seeing. You can stay anonymous, and every field marked optional can be skipped.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-layout">
        <GlassCard>
          <div className="field">
            <span className="field-label">What kind of concern is this</span>
            <div className="chip-group">
              {CATEGORIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`chip ${form.category === value ? "active" : ""}`}
                  onClick={() => update("category", value)}
                >
                  {CATEGORY_LABELS[value]}
                </button>
              ))}
            </div>
            <span className="field-hint">{CATEGORY_DESCRIPTIONS[form.category]}</span>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="description">
              Tell us what is happening
            </label>
            <textarea
              id="description"
              className="textarea"
              placeholder="Describe what you are seeing, when it started, and anything else that could help"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
            />
          </div>

          <div className="field">
            <span className="field-label">Symptoms you have noticed (optional)</span>
            <div className="chip-group">
              {SYMPTOM_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`chip ${form.symptoms.includes(option.value) ? "active" : ""}`}
                  onClick={() => toggleSymptom(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field">
              <label className="field-label" htmlFor="affectedCount">
                How many people are affected
              </label>
              <input
                id="affectedCount"
                type="number"
                min="1"
                className="input"
                value={form.affectedCount}
                onChange={(e) => update("affectedCount", e.target.value)}
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="reporterLanguage">
                Preferred language for updates
              </label>
              <select
                id="reporterLanguage"
                className="select"
                value={form.reporterLanguage}
                onChange={(e) => update("reporterLanguage", e.target.value)}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="addressText">
              Location or landmark (optional)
            </label>
            <input
              id="addressText"
              type="text"
              className="input"
              placeholder="For example, near the central market water point"
              value={form.addressText}
              onChange={(e) => update("addressText", e.target.value)}
            />
            <div style={{ marginTop: 10 }}>
              <Button type="button" variant="secondary" size="sm" onClick={captureLocation}>
                {locationStatus === "locating" ? "Locating" : "Share my current location"}
              </Button>
              {locationStatus === "captured" && (
                <span className="field-hint" style={{ marginLeft: 10, color: "#1f7a4d" }}>
                  Location captured
                </span>
              )}
              {locationStatus === "denied" && (
                <span className="field-hint" style={{ marginLeft: 10 }}>
                  Location was not shared. You can still submit without it.
                </span>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="sticky-panel">
          <h3 style={{ marginBottom: 6 }}>Your contact details</h3>
          <p style={{ color: "#5c6b85", fontSize: "0.88rem", marginBottom: 18 }}>
            Sharing contact info lets a health worker send you status updates. Fully optional.
          </p>

          <div className="checkbox-row" style={{ marginBottom: 18 }}>
            <input
              id="isAnonymous"
              type="checkbox"
              checked={form.isAnonymous}
              onChange={(e) => update("isAnonymous", e.target.checked)}
            />
            <label htmlFor="isAnonymous" style={{ fontSize: "0.92rem" }}>
              Submit this report anonymously
            </label>
          </div>

          {!form.isAnonymous && (
            <div className="field">
              <label className="field-label" htmlFor="reporterContact">
                Phone number or email (optional)
              </label>
              <input
                id="reporterContact"
                type="text"
                className="input"
                placeholder="So we can reach you with updates"
                value={form.reporterContact}
                onChange={(e) => update("reporterContact", e.target.value)}
              />
            </div>
          )}

          <ErrorAlert message={error} />

          <Button type="submit" block loading={isSubmitting} style={{ marginTop: 8 }}>
            Submit report
          </Button>

          <p style={{ fontSize: "0.78rem", color: "#7c8aa5", marginTop: 14, textAlign: "center" }}>
            You will receive a reference code you can use to check status at any time.
          </p>
        </GlassCard>
      </form>
    </div>
  );
}
