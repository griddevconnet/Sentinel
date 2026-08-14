import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import Button from "../components/Button";
import { PriorityBadge } from "../components/Badge";
import { LoadingBlock, EmptyState, ErrorAlert, SuccessAlert } from "../components/Feedback";
import { incidentsApi } from "../api/incidents";
import { ApiError } from "../api/client";
import { formatDateTime } from "../utils/formatters";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "monitoring", label: "Monitoring" },
  { value: "resolved", label: "Resolved" },
];

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await incidentsApi.list(status ? { status } : undefined);
      setIncidents(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load incidents.");
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const runClustering = async () => {
    setIsRunning(true);
    setSuccess("");
    setError("");
    try {
      const res = await incidentsApi.runClusteringNow();
      setSuccess(
        `Scan complete. ${res.data.clustersFound} cluster${res.data.clustersFound === 1 ? "" : "s"} found, ${res.data.incidentsCreated} new incident${res.data.incidentsCreated === 1 ? "" : "s"} created.`
      );
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not run the clustering scan.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1>Incidents</h1>
          <p>Clusters of related reports, detected automatically from location and timing.</p>
        </div>
        <Button variant="secondary" loading={isRunning} onClick={runClustering}>
          Scan for new clusters
        </Button>
      </div>

      <div className="page-shell" style={{ padding: 0 }}>
        <div className="chip-group" style={{ marginBottom: 20 }}>
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`chip ${status === option.value ? "active" : ""}`}
              onClick={() => setStatus(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <SuccessAlert message={success} />
        <ErrorAlert message={error} />

        {isLoading && <LoadingBlock label="Loading incidents" />}

        {!isLoading && incidents.length === 0 && (
          <GlassCard>
            <EmptyState
              icon="◎"
              title="No incidents detected"
              description="When several related reports cluster together in time and place, they will appear here."
            />
          </GlassCard>
        )}

        <div className="stack" style={{ gap: 14 }}>
          {incidents.map((incident) => (
            <Link key={incident.id} to={`/incidents/${incident.id}`} style={{ textDecoration: "none" }}>
              <GlassCard tight className="report-row">
                <div className="report-row-main">
                  <div className="report-row-top">
                    <PriorityBadge priority={incident.severity_level} />
                    <span className="badge badge-neutral">
                      <span className="badge-dot" />
                      {incident.status}
                    </span>
                  </div>
                  <p className="report-row-description">{incident.name}</p>
                  <span className="report-row-meta">
                    {incident.report_count} linked reports, last activity {formatDateTime(incident.last_report_at)}
                  </span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
