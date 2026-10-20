"use client";

import { useEffect, useState } from "react";

type Execution = {
  id: string;
  automationName?: string;
  automationId?: string | null;
  trigger: string;
  status: string;
  startedAt: string;
  completedAt?: string | null;
  durationMs?: number | null;
  error?: string | null;
};

export default function ExecutionHistory() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/automations/executions", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load execution history.");
      }

      setExecutions(data.executions ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load execution history."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  return (
    <div className="az-dash-card" style={{ marginTop: "24px" }}>
      <div className="az-dash-card-header">
        <div className="az-dash-card-title">
          <span className="az-status-dot" />
          <span>EXECUTION LEDGER // RUNTIME DISPATCHES</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="az-tag" style={{ fontSize: "10px" }}>
            {executions.length} RECORD{executions.length === 1 ? "" : "S"}
          </span>
          <button
            type="button"
            onClick={() => void loadHistory()}
            disabled={loading}
            className="az-btn-secondary"
            style={{ fontSize: "11px", padding: "4px 8px" }}
          >
            {loading ? "Querying..." : "Refresh"}
          </button>
        </div>
      </div>

      <div style={{ padding: "0" }}>
        {loading ? (
          <div style={{ padding: "32px", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--az-font-mono)", fontSize: "12px", color: "var(--az-text-muted)" }}>
              Polling Neon PostgreSQL execution log...
            </span>
          </div>
        ) : error ? (
          <div style={{ padding: "20px" }}>
            <div className="az-auth-error">
              [TELEMETRY_FETCH_ERROR] {error}
            </div>
          </div>
        ) : executions.length === 0 ? (
          <div style={{ padding: "36px 20px", textAlign: "center" }}>
            <span className="az-tag" style={{ marginBottom: "8px", display: "inline-block" }}>
              LEDGER DORMANT
            </span>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", marginBottom: "4px" }}>
              No execution history recorded yet
            </p>
            <p style={{ fontSize: "12px", color: "var(--az-text-secondary)" }}>
              Execution runs will stream here when triggers fire from incoming events.
            </p>
          </div>
        ) : (
          <div className="az-table-wrapper" style={{ border: "none", borderRadius: "0" }}>
            <table className="az-table">
              <thead>
                <tr>
                  <th>Automation Rule</th>
                  <th>Trigger Ingress</th>
                  <th>Status</th>
                  <th>Execution Latency</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {executions.map((execution) => {
                  const succeeded = execution.status === "success";

                  return (
                    <tr key={execution.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#ffffff" }}>
                          {execution.automationName || execution.automationId || "Autonomous Rule"}
                        </div>
                        {execution.error && (
                          <div style={{ fontSize: "11px", color: "#f87171", fontFamily: "var(--az-font-mono)", marginTop: "2px" }}>
                            [ERROR] {execution.error}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="az-tag" style={{ fontSize: "10px" }}>
                          {execution.trigger}
                        </span>
                      </td>
                      <td>
                        <span
                          className={succeeded ? "az-tag az-tag-emerald" : "az-tag az-tag-amber"}
                          style={{ fontSize: "10px", textTransform: "uppercase" }}
                        >
                          {execution.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--az-font-mono)", fontSize: "12px", color: "var(--az-text-secondary)" }}>
                        {execution.durationMs != null ? `${execution.durationMs} ms` : "—"}
                      </td>
                      <td style={{ fontFamily: "var(--az-font-mono)", fontSize: "11px", color: "var(--az-text-muted)" }}>
                        {new Date(execution.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
