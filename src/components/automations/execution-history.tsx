
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

      const response = await fetch(
        "/api/automations/executions",
        { cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to load execution history.",
        );
      }

      setExecutions(data.executions ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load execution history.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  return (
    <section
      style={{
        marginTop: 24,
        padding: 20,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              color: "var(--text-primary)",
            }}
          >
            Execution History
          </h3>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: 12,
              color: "var(--text-secondary)",
            }}
          >
            Review automation runs and their outcomes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadHistory()}
          disabled={loading}
          style={{
            padding: "7px 12px",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            cursor: loading ? "wait" : "pointer",
            fontSize: 12,
          }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          Loading execution history...
        </p>
      ) : error ? (
        <p style={{ color: "var(--red)", fontSize: 13 }}>
          {error}
        </p>
      ) : executions.length === 0 ? (
        <div
          style={{
            padding: "24px 12px",
            textAlign: "center",
            border: "1px dashed var(--border-default)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            No execution records yet
          </p>

          <p
            style={{
              margin: "8px 0 0",
              fontSize: 12,
              color: "var(--text-secondary)",
            }}
          >
            Execution history will appear here when persistent
            history storage is enabled.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
              textAlign: "left",
            }}
          >
            <thead>
              <tr>
                {["Automation", "Trigger", "Status", "Duration", "Started"].map(
                  (heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "10px 12px",
                        borderBottom: "1px solid var(--border-default)",
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                      }}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {executions.map((execution) => {
                const succeeded = execution.status === "success";

                return (
                  <tr key={execution.id}>
                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid var(--border-default)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {execution.automationName ||
                        execution.automationId ||
                        "Automation"}
                      {execution.error && (
                        <p
                          style={{
                            margin: "5px 0 0",
                            color: "var(--red)",
                          }}
                        >
                          {execution.error}
                        </p>
                      )}
                    </td>

                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid var(--border-default)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {execution.trigger}
                    </td>

                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid var(--border-default)",
                      }}
                    >
                      <span
                        style={{
                          color: succeeded
                            ? "var(--green)"
                            : "var(--red)",
                          fontWeight: 600,
                        }}
                      >
                        {execution.status}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid var(--border-default)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {execution.durationMs != null
                        ? `${execution.durationMs} ms`
                        : "—"}
                    </td>

                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid var(--border-default)",
                        color: "var(--text-secondary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(execution.startedAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
