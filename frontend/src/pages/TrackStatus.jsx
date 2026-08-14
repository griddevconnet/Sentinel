import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import Button from "../components/Button";
import { StatusBadge, PriorityBadge } from "../components/Badge";
import { ErrorAlert } from "../components/Feedback";
import { reportsApi } from "../api/reports";
import { ApiError } from "../api/client";
import { formatDateTime } from "../utils/formatters";
import { CATEGORY_LABELS } from "../utils/constants";

export default function TrackStatus() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const lookup = async (value) => {
    if (!value || value.trim().length < 4) {
      setError("Enter the reference code you received when you submitted your report.");
      return;
    }
    setError("");
    setIsLoading(true);
    setReport(null);
    try {
      const res = await reportsApi.getByToken(value.trim().toUpperCase());
      setReport(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We could not find that report.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initial = searchParams.get("token");
    if (initial) lookup(initial);
    // eslint disable next line react hooks exhaustive deps
    // Runs once on mount to honor a pre filled reference code.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    lookup(token);
  };

  return (
    <div className="page-shell" style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="page-header" style={{ padding: "44px 0 24px" }}>
        <div>
          <h1>Track your report</h1>
          <p>Enter the reference code you received to see the latest status.</p>
        </div>
      </div>

      <GlassCard>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            type="text"
            className="input"
            style={{ flex: 1, minWidth: 200, textTransform: "uppercase" }}
            placeholder="Reference code, for example AB3KX9QZ2M"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Button type="submit" loading={isLoading}>
            Check status
          </Button>
        </form>
        <ErrorAlert message={error} />
      </GlassCard>

      {report && (
        <GlassCard style={{ marginTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: "0.8rem", color: "#7c8aa5", marginBottom: 4 }}>Reference code</p>
              <h3 style={{ fontFamily: "var(--font-display)", letterSpacing: "0.08em" }}>{report.report_token}</h3>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <StatusBadge status={report.status} />
              <PriorityBadge priority={report.priority_level} />
            </div>
          </div>

          <div style={{ marginTop: 24, display: "grid", gap: 14 }}>
            <DetailRow label="Category" value={CATEGORY_LABELS[report.category] || report.category} />
            <DetailRow label="Reported" value={formatDateTime(report.created_at)} />
            {report.triaged_at && <DetailRow label="Reviewed" value={formatDateTime(report.triaged_at)} />}
            {report.resolved_at && <DetailRow label="Resolved" value={formatDateTime(report.resolved_at)} />}
          </div>

          <div className="alert alert-info" style={{ marginTop: 22 }}>
            <span aria-hidden="true">{"\u2139"}</span>
            <span>
              {report.status === "resolved" || report.status === "closed"
                ? "This report has been addressed. Thank you for letting us know."
                : "A health worker is on this. You will see this status update as things progress."}
            </span>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: "0.92rem" }}>
      <span style={{ color: "#7c8aa5" }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
