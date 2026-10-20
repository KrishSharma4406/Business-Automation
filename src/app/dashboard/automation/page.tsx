"use client";

import TopBar from "@/src/components/top-bar";
import CreateAutomationForm from "@/src/components/automations/create-automation-form";
import ExecutionHistory from "@/src/components/automations/execution-history";
import { useCallback, useEffect, useMemo, useState } from "react";

type Automation = {
  id: string;
  businessId: string;
  name: string;
  trigger: string;
  action: string;
  config: Record<string, unknown> | null;
  enabled: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type AutomationStats = {
  total: number;
  active: number;
  paused: number;
  executions: number;
};

const TRIGGER_META: Record<string, { label: string; tag: string }> = {
  new_lead: { label: "When a new lead arrives", tag: "TRIGGER: NEW_LEAD" },
  new_customer: { label: "When a new customer is created", tag: "TRIGGER: NEW_CUSTOMER" },
  new_message: { label: "When a new message arrives", tag: "TRIGGER: INBOUND_MSG" },
  lead_qualified: { label: "When a lead is qualified", tag: "TRIGGER: LEAD_QUALIFIED" },
  conversation_received: { label: "When a conversation is received", tag: "TRIGGER: CONV_INGRESS" },
};

const ACTION_META: Record<string, { label: string; tag: string }> = {
  ai_qualify_lead: { label: "Qualify lead with AI", tag: "ACTION: AI_QUALIFY" },
  generate_response: { label: "Generate AI response", tag: "ACTION: AI_SYNTHESIZE" },
  send_email: { label: "Send email", tag: "ACTION: SMTP_DISPATCH" },
  send_whatsapp: { label: "Send WhatsApp message", tag: "ACTION: WHATSAPP_API" },
  notify_owner: { label: "Notify business owner", tag: "ACTION: NOTIFY_OPERATOR" },
  create_task: { label: "Create a task", tag: "ACTION: NEON_CRM_TASK" },
};

export default function AutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [stats, setStats] = useState<AutomationStats>({
    total: 0,
    active: 0,
    paused: 0,
    executions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [triggerFilter, setTriggerFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testFeedback, setTestFeedback] = useState<{
    id: string;
    success: boolean;
    message: string;
  } | null>(null);

  const loadAutomations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/automations");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load automations");
      }

      const list: Automation[] = data.automations || [];
      setAutomations(list);
      setStats(
        data.stats || {
          total: list.length,
          active: list.filter((a) => a.enabled).length,
          paused: list.filter((a) => !a.enabled).length,
          executions: 0,
        }
      );
    } catch (err) {
      console.error("Failed to load automations:", err);
      setError(err instanceof Error ? err.message : "Failed to load automations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAutomations();
  }, [loadAutomations, refreshKey]);

  async function toggleAutomation(automation: Automation) {
    setUpdatingId(automation.id);
    try {
      const response = await fetch(`/api/automations/${automation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !automation.enabled }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update automation.");
      }

      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update automation.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteAutomation(automation: Automation) {
    if (!window.confirm(`Delete automation "${automation.name}"?`)) return;

    setDeletingId(automation.id);
    try {
      const response = await fetch(`/api/automations/${automation.id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete automation.");
      }

      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete automation.");
    } finally {
      setDeletingId(null);
    }
  }

  async function testAutomation(automation: Automation) {
    if (testingId || updatingId || deletingId) return;

    setTestingId(automation.id);
    setTestFeedback(null);

    try {
      const response = await fetch(`/api/automations/${automation.id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            name: "Test Lead",
            email: "test@example.com",
            source: "manual_test",
          },
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            result.execution?.error ||
            result.execution?.result?.message ||
            "Automation test failed."
        );
      }

      setTestFeedback({
        id: automation.id,
        success: true,
        message: `Execution completed in ${result.execution?.durationMs ?? 0} ms.`,
      });
    } catch (err) {
      setTestFeedback({
        id: automation.id,
        success: false,
        message: err instanceof Error ? err.message : "Automation test failed.",
      });
    } finally {
      setTestingId(null);
    }
  }

  const filteredAutomations = useMemo(() => {
    return automations.filter((item) => {
      if (statusFilter === "active" && !item.enabled) return false;
      if (statusFilter === "paused" && item.enabled) return false;
      if (triggerFilter !== "all" && item.trigger !== triggerFilter) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.trigger.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q)
      );
    });
  }, [automations, statusFilter, triggerFilter, searchQuery]);

  return (
    <div className="az-dash-page">
      <TopBar title="Automation Pipelines" subtitle="Deterministic State Machines &amp; Event-Driven Rules" />

      <div className="az-dash-body">
        {/* Statistics Telemetry */}
        <div className="az-dash-stats">
          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">TOTAL RULES</span>
              <span className="az-tag" style={{ fontSize: "9px" }}>STATE MACHINE</span>
            </div>
            <div className="az-dash-stat-val">{stats.total}</div>
            <div className="az-dash-stat-delta">
              <span>●</span>
              <span>Event-driven triggers</span>
            </div>
          </div>

          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">ACTIVE NODES</span>
              <span className="az-tag az-tag-emerald" style={{ fontSize: "9px" }}>LISTENING</span>
            </div>
            <div className="az-dash-stat-val" style={{ color: "var(--az-emerald)" }}>{stats.active}</div>
            <div className="az-dash-stat-delta">
              <span>●</span>
              <span>Continuous webhook evaluation</span>
            </div>
          </div>

          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">PAUSED RULES</span>
              <span className="az-tag" style={{ fontSize: "9px" }}>STANDBY</span>
            </div>
            <div className="az-dash-stat-val" style={{ color: "var(--az-amber)" }}>{stats.paused}</div>
            <div className="az-dash-stat-delta" style={{ color: "var(--az-text-muted)" }}>
              <span>○</span>
              <span>Inactive execution states</span>
            </div>
          </div>

          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">TOTAL EXECUTIONS</span>
              <span className="az-tag az-tag-cyan" style={{ fontSize: "9px" }}>DISPATCHED</span>
            </div>
            <div className="az-dash-stat-val" style={{ color: "var(--az-cyan)" }}>{stats.executions}</div>
            <div className="az-dash-stat-delta" style={{ color: "var(--az-cyan)" }}>
              <span>↑</span>
              <span>Sub-400ms latency</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="az-toolbar">
          <div className="az-toolbar-group">
            <input
              type="text"
              placeholder="Search automation rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="az-input-search"
              style={{ width: "260px" }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontFamily: "var(--az-font-mono)", fontSize: "11px", color: "var(--az-text-muted)" }}>
                STATE:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="az-select-cyber"
              >
                <option value="all">All States</option>
                <option value="active">Active Only</option>
                <option value="paused">Paused Only</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontFamily: "var(--az-font-mono)", fontSize: "11px", color: "var(--az-text-muted)" }}>
                TRIGGER:
              </span>
              <select
                value={triggerFilter}
                onChange={(e) => setTriggerFilter(e.target.value)}
                className="az-select-cyber"
              >
                <option value="all">All Ingress Triggers</option>
                {Object.entries(TRIGGER_META).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <span className="az-tag" style={{ fontSize: "11px" }}>
              {filteredAutomations.length} PIPELINE{filteredAutomations.length === 1 ? "" : "S"}
            </span>
          </div>

          <div className="az-toolbar-group">
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="az-btn-primary"
              style={{ fontSize: "12px", padding: "8px 18px" }}
            >
              + Create Automation Node
            </button>
          </div>
        </div>

        {error && (
          <div className="az-auth-error">
            [SYSTEM_ERROR] {error}
          </div>
        )}

        {/* Automations Blueprints Grid */}
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--az-font-mono)", fontSize: "12px", color: "var(--az-text-muted)" }}>
              Querying Neon PostgreSQL automation blueprints...
            </span>
          </div>
        ) : filteredAutomations.length === 0 ? (
          <div className="az-dash-card" style={{ padding: "48px 20px", textAlign: "center" }}>
            <div style={{ maxWidth: "380px", margin: "0 auto" }}>
              <span className="az-tag" style={{ marginBottom: "10px", display: "inline-block" }}>
                PIPELINES DORMANT
              </span>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>
                No active automation rules
              </h3>
              <p style={{ fontSize: "12px", color: "var(--az-text-secondary)", marginBottom: "16px", lineHeight: 1.5 }}>
                Deploy autonomous workflows to automatically qualify leads, dispatch WhatsApp templates, and sync Neon DB records.
              </p>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="az-btn-primary"
                style={{ fontSize: "12px", padding: "8px 18px" }}
              >
                + Deploy First Automation Rule
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "18px",
            }}
          >
            {filteredAutomations.map((item, idx) => {
              const triggerInfo = TRIGGER_META[item.trigger] || { label: item.trigger, tag: `TRIGGER: ${item.trigger}` };
              const actionInfo = ACTION_META[item.action] || { label: item.action, tag: `ACTION: ${item.action}` };
              const isUpdating = updatingId === item.id;
              const isDeleting = deletingId === item.id;
              const isTesting = testingId === item.id;
              const feedback = testFeedback?.id === item.id ? testFeedback : null;

              return (
                <div
                  key={item.id}
                  style={{
                    background: "var(--az-surface)",
                    border: `1px solid ${item.enabled ? "var(--az-border)" : "var(--az-border-subtle)"}`,
                    borderRadius: "4px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "20px",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--az-border-bright)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = item.enabled ? "var(--az-border)" : "var(--az-border-subtle)";
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "3px",
                      height: "100%",
                      background: item.enabled ? "var(--az-emerald)" : "var(--az-text-muted)",
                    }}
                  />

                  <div>
                    {/* Head */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="az-tag" style={{ fontSize: "10px" }}>
                          RULE {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className={item.enabled ? "az-tag az-tag-emerald" : "az-tag"} style={{ fontSize: "10px" }}>
                          {item.enabled ? "● RUNTIME ACTIVE" : "○ PAUSED"}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => toggleAutomation(item)}
                          disabled={isUpdating}
                          className="az-btn-secondary"
                          style={{ fontSize: "10px", padding: "3px 8px" }}
                        >
                          {isUpdating ? "..." : item.enabled ? "Pause" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAutomation(item)}
                          disabled={isDeleting}
                          className="az-btn-secondary"
                          style={{ fontSize: "10px", padding: "3px 8px", color: "#f87171", borderColor: "rgba(239, 68, 68, 0.3)" }}
                        >
                          {isDeleting ? "..." : "✕"}
                        </button>
                      </div>
                    </div>

                    <h4 style={{ fontFamily: "var(--az-font-mono)", fontSize: "15px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                      {item.name}
                    </h4>

                    {item.description && (
                      <p style={{ fontSize: "12px", color: "var(--az-text-secondary)", lineHeight: 1.5, marginBottom: "14px" }}>
                        {item.description}
                      </p>
                    )}

                    {/* Pipeline Flow Visualization */}
                    <div
                      style={{
                        background: "var(--az-surface-alt)",
                        border: "1px solid var(--az-border)",
                        borderRadius: "4px",
                        padding: "10px 12px",
                        marginBottom: "14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "var(--az-font-mono)", fontSize: "10px", color: "var(--az-text-muted)" }}>
                          IF:
                        </span>
                        <span className="az-tag" style={{ fontSize: "10px", color: "var(--az-text-primary)" }}>
                          {triggerInfo.tag}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "var(--az-font-mono)", fontSize: "10px", color: "var(--az-text-muted)" }}>
                          THEN:
                        </span>
                        <span className="az-tag az-tag-emerald" style={{ fontSize: "10px" }}>
                          {actionInfo.tag}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Test Feedback & Action */}
                  <div style={{ borderTop: "1px solid var(--az-border-subtle)", paddingTop: "12px" }}>
                    {feedback && (
                      <div
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--az-font-mono)",
                          padding: "6px 8px",
                          borderRadius: "3px",
                          marginBottom: "8px",
                          background: feedback.success ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                          color: feedback.success ? "var(--az-emerald)" : "#f87171",
                          border: `1px solid ${feedback.success ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                        }}
                      >
                        {feedback.message}
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--az-font-mono)", fontSize: "10px", color: "var(--az-text-muted)" }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }) : ""}
                      </span>

                      <button
                        type="button"
                        onClick={() => testAutomation(item)}
                        disabled={isTesting}
                        className="az-btn-secondary"
                        style={{ fontSize: "11px", padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <span>{isTesting ? "Executing..." : "Simulate Run"}</span>
                        <span style={{ color: "var(--az-emerald)" }}>⚡</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Execution History Ledger */}
        <ExecutionHistory />

        {/* Create Automation Form Drawer/Modal */}
        {showCreateForm && (
          <CreateAutomationForm
            onClose={() => setShowCreateForm(false)}
            onCreated={() => {
              setRefreshKey((k) => k + 1);
            }}
          />
        )}
      </div>
    </div>
  );
}
