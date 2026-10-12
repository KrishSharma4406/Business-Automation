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

const TRIGGER_META: Record<string, { label: string; icon?: string }> = {

  new_lead: { label: "When a new lead arrives" },

  new_customer: { label: "When a new customer is created" },

  new_message: { label: "When a new message arrives" },

  lead_qualified: { label: "When a lead is qualified" },

  conversation_received: { label: "When a conversation is received" },

};

const ACTION_META: Record<string, { label: string; icon?: string }> = {

  ai_qualify_lead: { label: "Qualify lead with AI" },

  generate_response: { label: "Generate an AI response" },

  send_email: { label: "Send email" },

  send_whatsapp: { label: "Send WhatsApp message" },

  notify_owner: { label: "Notify business owner" },

  create_task: { label: "Create a task" },

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

  const [showFilters, setShowFilters] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");

  const [triggerFilter, setTriggerFilter] = useState("all");

  const [actionFilter, setActionFilter] = useState("all");

  const [sortBy, setSortBy] = useState<"date" | "name" | "status">("date");

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

      setError(

        err instanceof Error ? err.message : "Failed to load automations"

      );

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

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          enabled: !automation.enabled,

        }),

      });

      const result = await response.json();

      if (!response.ok || !result.success) {

        throw new Error(result.error || "Failed to update automation.");

      }

      setRefreshKey((current) => current + 1);

    } catch (error) {

      setError(

        error instanceof Error

          ? error.message

          : "Failed to update automation."

      );

    } finally {

      setUpdatingId(null);

    }

  }

  async function deleteAutomation(automation: Automation) {

    const confirmed = window.confirm(

      `Are you sure you want to delete "${automation.name}"?`

    );

    if (!confirmed) return;

    setDeletingId(automation.id);

    try {

      const response = await fetch(`/api/automations/${automation.id}`, {

        method: "DELETE",

      });

      const result = await response.json();

      if (!response.ok || !result.success) {

        throw new Error(result.error || "Failed to delete automation.");

      }

      setRefreshKey((current) => current + 1);

    } catch (error) {

      setError(

        error instanceof Error

          ? error.message

          : "Failed to delete automation."

      );

    } finally {

      setDeletingId(null);

    }

  }

  async function testAutomation(automation: Automation) {
    if (testingId || updatingId || deletingId) return;

    setTestingId(automation.id);
    setTestFeedback(null);

    try {
      const response = await fetch(
        `/api/automations/${automation.id}/test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              name: "Test Lead",
              email: "test@example.com",
              source: "manual_test",
            },
          }),
        }
      );

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
        message: `Test completed in ${result.execution?.durationMs ?? 0} ms.`,
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

    return automations

      .filter((item) => {

        if (statusFilter === "active" && !item.enabled) return false;

        if (statusFilter === "paused" && item.enabled) return false;

        if (triggerFilter !== "all" && item.trigger !== triggerFilter)

          return false;

        if (actionFilter !== "all" && item.action !== actionFilter) return false;

        if (searchQuery.trim()) {

          const q = searchQuery.toLowerCase().trim();

          const matchName = item.name.toLowerCase().includes(q);

          const matchDesc = item.description?.toLowerCase().includes(q);

          const matchTrigger = TRIGGER_META[item.trigger]?.label

            .toLowerCase()

            .includes(q);

          const matchAction = ACTION_META[item.action]?.label

            .toLowerCase()

            .includes(q);

          if (!matchName && !matchDesc && !matchTrigger && !matchAction) {

            return false;

          }

        }

        return true;

      })

      .sort((a, b) => {

        if (sortBy === "name") {

          return a.name.localeCompare(b.name);

        }

        if (sortBy === "status") {

          if (a.enabled === b.enabled) return 0;

          return a.enabled ? -1 : 1;

        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

      });

  }, [automations, statusFilter, triggerFilter, actionFilter, searchQuery, sortBy]);

  function resetFilters() {

    setStatusFilter("all");

    setTriggerFilter("all");

    setActionFilter("all");

    setSearchQuery("");

  }

  return (

    <>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}></div>

      <TopBar

        title="Automations"

        subtitle="Automate repetitive business tasks with AI"

      />

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Main content */}

        <div

          style={{

            flex: 1,

            padding: "24px",

            overflowY: "auto",

          }}

        >

          {/* Stats Row */}

          <div

            style={{

              display: "grid",

              gridTemplateColumns: "repeat(3, 1fr)",

              gap: "16px",

              marginBottom: "24px",

            }}

          >

            <StatCard

              label="Total Automations"

              value={stats.total.toString()}

              helper="Configured workflows"

            />

            <StatCard

              label="Active Workflows"

              value={stats.active.toString()}

              helper="Running in production"

              highlight={stats.active > 0}

            />

            <StatCard

              label="Paused"

              value={stats.paused.toString()}

              helper="Inactive automations"

            />

          </div>

          {/* Toolbar */}

          <div

            style={{

              display: "flex",

              alignItems: "center",

              justifyContent: "space-between",

              flexWrap: "wrap",

              gap: "12px",

              marginBottom: "16px",

            }}

          >

            <div

              style={{

                display: "flex",

                alignItems: "center",

                gap: "10px",

                flexWrap: "wrap",

              }}

            >

              {/* Search bar */}

              <div style={{ position: "relative" }}>

                <input

                  type="text"

                  placeholder="Search automations..."

                  value={searchQuery}

                  onChange={(e) => setSearchQuery(e.target.value)}

                  style={{

                    padding: "7px 12px 7px 30px",

                    borderRadius: "var(--radius-md)",

                    border: "1px solid var(--border-default)",

                    background: "var(--bg-input)",

                    color: "var(--text-primary)",

                    fontSize: "12px",

                    outline: "none",

                    minWidth: "200px",

                  }}

                />

                <span

                  style={{

                    position: "absolute",

                    left: "10px",

                    top: "50%",

                    transform: "translateY(-50%)",

                    color: "var(--text-muted)",

                    fontSize: "12px",

                    pointerEvents: "none",

                  }}

                >

                </span>

              </div>

              {/* Sort by */}

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>

                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>

                  Sort:

                </span>

                <select

                  value={sortBy}

                  onChange={(e) => setSortBy(e.target.value as any)}

                  style={{

                    padding: "6px 10px",

                    borderRadius: "var(--radius-sm)",

                    border: "1px solid var(--border-default)",

                    background: "var(--bg-input)",

                    color: "var(--text-primary)",

                    fontSize: "12px",

                    outline: "none",

                    cursor: "pointer",

                  }}

                >

                  <option value="date">Date created (newest)</option>

                  <option value="name">Name (A-Z)</option>

                  <option value="status">Status (Active first)</option>

                </select>

              </div>

              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>

                ({filteredAutomations.length}{" "}

                {filteredAutomations.length === 1 ? "workflow" : "workflows"})

              </span>

            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

              <button

                type="button"

                onClick={() => setShowCreateForm(true)}

                style={{

                  padding: "7px 16px",

                  borderRadius: "var(--radius-md)",

                  border: "none",

                  background: "var(--accent)",

                  color: "#fff",

                  fontSize: "13px",

                  fontWeight: 600,

                  cursor: "pointer",

                  display: "flex",

                  alignItems: "center",

                  gap: "6px",

                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",

                }}

              >

                <span>+</span> Create Automation

              </button>

              <button

                type="button"

                onClick={() => setShowFilters((current) => !current)}

                style={{

                  padding: "7px 14px",

                  borderRadius: "var(--radius-md)",

                  border: `1px solid ${showFilters || statusFilter !== "all" || triggerFilter !== "all" || actionFilter !== "all"

                      ? "var(--accent)"

                      : "var(--border-default)"

                    }`,

                  background:

                    showFilters || statusFilter !== "all" || triggerFilter !== "all" || actionFilter !== "all"

                      ? "var(--accent-subtle)"

                      : "var(--bg-surface)",

                  color:

                    showFilters || statusFilter !== "all" || triggerFilter !== "all" || actionFilter !== "all"

                      ? "var(--accent)"

                      : "var(--text-secondary)",

                  fontSize: "12px",

                  fontWeight: 500,

                  cursor: "pointer",

                  display: "flex",

                  alignItems: "center",

                  gap: "6px",

                }}

              >

                <span>⚙</span> Filters

                {(statusFilter !== "all" || triggerFilter !== "all" || actionFilter !== "all") && (

                  <span

                    style={{

                      width: "6px",

                      height: "6px",

                      borderRadius: "50%",

                      background: "var(--accent)",

                    }}

                  />

                )}

              </button>

            </div>

          </div>

          {/* Automations List Container */}

          <div

            style={{

              background: "var(--bg-surface)",

              border: "1px solid var(--border-default)",

              borderRadius: "var(--radius-lg)",

              overflow: "hidden",

            }}

          >

            <div

              style={{

                padding: "14px 20px",

                borderBottom: "1px solid var(--border-default)",

                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

              }}

            >

              <span

                style={{

                  fontSize: "13px",

                  fontWeight: 600,

                  color: "var(--text-primary)",

                }}

              >

                Configured Workflows

              </span>

              {automations.length > 0 && (

                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>

                  {stats.active} of {stats.total} active

                </span>

              )}

            </div>

            {/* Loading state */}

            {loading && automations.length === 0 ? (

              <div style={{ padding: "60px 20px", textAlign: "center" }}>

                <div

                  style={{

                    display: "inline-block",

                    width: "28px",

                    height: "28px",

                    border: "3px solid var(--border-default)",

                    borderTopColor: "var(--accent)",

                    borderRadius: "50%",

                    animation: "spin 0.8s linear infinite",

                  }}

                />

                <p

                  style={{

                    marginTop: "12px",

                    fontSize: "13px",

                    color: "var(--text-secondary)",

                  }}

                >

                  Loading automations...

                </p>

                <style>{`

                  @keyframes spin {

                    to { transform: rotate(360deg); }

                  }

                `}</style>

              </div>

            ) : error ? (

              /* Error state */

              <div style={{ padding: "40px 20px", textAlign: "center" }}>

                <p style={{ fontSize: "14px", color: "var(--red)", fontWeight: 500 }}>

                  {error}

                </p>

                <button

                  type="button"

                  onClick={() => loadAutomations()}

                  style={{

                    marginTop: "14px",

                    padding: "6px 16px",

                    borderRadius: "var(--radius-md)",

                    border: "1px solid var(--border-default)",

                    background: "var(--bg-input)",

                    color: "var(--text-primary)",

                    fontSize: "12px",

                    cursor: "pointer",

                  }}

                >

                  Retry

                </button>

              </div>

            ) : automations.length === 0 ? (

              /* Empty state: No automations created yet */

              <div style={{ padding: "50px 20px", textAlign: "center" }}>

                <div

                  style={{

                    fontSize: "36px",

                    marginBottom: "12px",

                    opacity: 0.8,

                  }}

                >

                </div>

                <h3

                  style={{

                    fontSize: "15px",

                    fontWeight: 600,

                    color: "var(--text-primary)",

                    marginBottom: "6px",

                  }}

                >

                  No automations created yet

                </h3>

                <p

                  style={{

                    fontSize: "13px",

                    color: "var(--text-secondary)",

                    maxWidth: "420px",

                    margin: "0 auto",

                  }}

                >

                  Automate repetitive business tasks such as AI lead qualification,

                  generating customer responses, sending emails, and dispatching notifications.

                </p>

                <button

                  type="button"

                  onClick={() => setShowCreateForm(true)}

                  style={{

                    marginTop: "20px",

                    padding: "9px 20px",

                    borderRadius: "var(--radius-md)",

                    border: "none",

                    background: "var(--accent)",

                    color: "#fff",

                    fontSize: "13px",

                    fontWeight: 600,

                    cursor: "pointer",

                    boxShadow: "0 2px 6px rgba(74, 108, 247, 0.3)",

                  }}

                >

                  + Create your first automation

                </button>

              </div>

            ) : filteredAutomations.length === 0 ? (

              /* Filtered empty state */

              <div style={{ padding: "50px 20px", textAlign: "center" }}>

                <p

                  style={{

                    fontSize: "14px",

                    color: "var(--text-secondary)",

                    marginBottom: "8px",

                  }}

                >

                  No automations match your search or active filters.

                </p>

                <button

                  type="button"

                  onClick={resetFilters}

                  style={{

                    padding: "6px 16px",

                    borderRadius: "var(--radius-md)",

                    border: "1px solid var(--border-default)",

                    background: "var(--bg-input)",

                    color: "var(--accent)",

                    fontSize: "12px",

                    fontWeight: 500,

                    cursor: "pointer",

                  }}

                >

                  Reset filters

                </button>

              </div>

            ) : (

              /* List of automations */

              <div style={{ display: "flex", flexDirection: "column" }}>

                {filteredAutomations.map((item, idx) => {

                  const triggerInfo = TRIGGER_META[item.trigger] || {

                    label: item.trigger,

                  };

                  const actionInfo = ACTION_META[item.action] || {

                    label: item.action,

                  };

                  const isUpdating = updatingId === item.id;

                  const isDeleting = deletingId === item.id;

                  const formattedDate = new Date(item.createdAt).toLocaleDateString(

                    undefined,

                    {

                      month: "short",

                      day: "numeric",

                      year: "numeric",

                    }

                  );

                  return (

                    <div

                      key={item.id}

                      style={{

                        padding: "18px 20px",

                        borderBottom:

                          idx === filteredAutomations.length - 1

                            ? "none"

                            : "1px solid var(--border-default)",

                        display: "flex",

                        alignItems: "flex-start",

                        justifyContent: "space-between",

                        gap: "16px",

                        transition: "background 0.15s ease",

                      }}

                      onMouseEnter={(e) => {

                        e.currentTarget.style.background =

                          "var(--bg-surface-hover)";

                      }}

                      onMouseLeave={(e) => {

                        e.currentTarget.style.background = "transparent";

                      }}

                    >

                      {/* Left: Info & Workflow Flow */}

                      <div style={{ flex: 1, minWidth: 0 }}>

                        <div

                          style={{

                            display: "flex",

                            alignItems: "center",

                            gap: "10px",

                            flexWrap: "wrap",

                            marginBottom: "6px",

                          }}

                        >

                          <h4

                            style={{

                              fontSize: "14px",

                              fontWeight: 600,

                              color: "var(--text-primary)",

                              margin: 0,

                            }}

                          >

                            {item.name}

                          </h4>

                          {/* Status Pill */}

                          <span

                            style={{

                              fontSize: "11px",

                              fontWeight: 600,

                              padding: "2px 8px",

                              borderRadius: "12px",

                              display: "inline-flex",

                              alignItems: "center",

                              gap: "5px",

                              background: item.enabled

                                ? "var(--green-subtle)"

                                : "rgba(158, 158, 168, 0.12)",

                              color: item.enabled

                                ? "var(--green)"

                                : "var(--text-secondary)",

                              border: item.enabled

                                ? "1px solid rgba(46, 204, 113, 0.3)"

                                : "1px solid var(--border-default)",

                            }}

                          >

                            <span

                              style={{

                                width: "6px",

                                height: "6px",

                                borderRadius: "50%",

                                background: item.enabled

                                  ? "var(--green)"

                                  : "var(--text-muted)",

                              }}

                            />

                            {item.enabled ? "Active" : "Paused"}

                          </span>

                          <span

                            style={{

                              fontSize: "11px",

                              color: "var(--text-muted)",

                            }}

                          >

                            Created {formattedDate}

                          </span>

                        </div>

                        {/* Description */}

                        {item.description && (

                          <p

                            style={{

                              fontSize: "12px",

                              color: "var(--text-secondary)",

                              marginBottom: "12px",

                              maxWidth: "680px",

                              lineHeight: 1.4,

                            }}

                          >

                            {item.description}

                          </p>

                        )}

                        {/* Workflow pipeline visually */}

                        <div

                          style={{

                            display: "inline-flex",

                            alignItems: "center",

                            gap: "8px",

                            background: "var(--bg-app)",

                            padding: "6px 12px",

                            borderRadius: "var(--radius-md)",

                            border: "1px solid var(--border-subtle)",

                            marginTop: item.description ? "0px" : "6px",

                          }}

                        >

                          {/* Trigger box */}

                          <div

                            style={{

                              display: "flex",

                              alignItems: "center",

                              gap: "6px",

                            }}

                          >

                            {triggerInfo.icon && (

                              <span style={{ fontSize: "13px" }}>

                                {triggerInfo.icon}

                              </span>

                            )}

                            <span

                              style={{

                                fontSize: "11px",

                                fontWeight: 600,

                                color: "var(--text-muted)",

                                textTransform: "uppercase",

                                letterSpacing: "0.5px",

                              }}

                            >

                              Trigger:

                            </span>

                            <span

                              style={{

                                fontSize: "12px",

                                color: "var(--text-primary)",

                                fontWeight: 500,

                              }}

                            >

                              {triggerInfo.label}

                            </span>

                          </div>

                          {/* Arrow */}

                          <span

                            style={{

                              color: "var(--accent)",

                              fontSize: "12px",

                              fontWeight: 700,

                              padding: "0 2px",

                            }}

                          >

                            ➔

                          </span>

                          {/* Action box */}

                          <div

                            style={{

                              display: "flex",

                              alignItems: "center",

                              gap: "6px",

                            }}

                          >

                            {actionInfo.icon && (

                              <span style={{ fontSize: "13px" }}>

                                {actionInfo.icon}

                              </span>

                            )}

                            <span

                              style={{

                                fontSize: "11px",

                                fontWeight: 600,

                                color: "var(--text-muted)",

                                textTransform: "uppercase",

                                letterSpacing: "0.5px",

                              }}

                            >

                              Action:

                            </span>

                            <span

                              style={{

                                fontSize: "12px",

                                color: "var(--text-primary)",

                                fontWeight: 500,

                              }}

                            >

                              {actionInfo.label}

                            </span>

                          </div>

                        </div>

                      </div>

                      {/* Right: Actions */}

                      <div

                        style={{

                          display: "flex",

                          alignItems: "center",

                          gap: "8px",

                          flexShrink: 0,

                        }}

                      >

                        
                        {testFeedback?.id === item.id && (
                          <span
                            role="status"
                            style={{
                              fontSize: "11px",
                              color: testFeedback.success ? "var(--green)" : "var(--red)",
                              maxWidth: "180px",
                            }}
                          >
                            {testFeedback.message}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => testAutomation(item)}
                          disabled={testingId !== null || updatingId !== null || deletingId !== null}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-default)",
                            background: "var(--bg-input)",
                            color: "var(--text-primary)",
                            fontSize: "12px",
                            fontWeight: 500,
                            cursor: testingId !== null ? "wait" : "pointer",
                            opacity: testingId !== null ? 0.6 : 1,
                          }}
                        >
                          {testingId === item.id ? "Testing..." : "Test"}
                        </button>

                        {/* Toggle active / paused button */}

                        <button

                          type="button"

                          onClick={() => toggleAutomation(item)}

                          disabled={updatingId === item.id}

                          title={item.enabled ? "Pause automation" : "Activate automation"}

                          style={{

                            padding: "6px 12px",

                            borderRadius: "var(--radius-md)",

                            border: `1px solid ${item.enabled ? "var(--border-default)" : "var(--green)"

                              }`,

                            background: item.enabled

                              ? "var(--bg-input)"

                              : "var(--green-subtle)",

                            color: item.enabled

                              ? "var(--text-secondary)"

                              : "var(--green)",

                            fontSize: "12px",

                            fontWeight: 500,

                            cursor: updatingId === item.id ? "wait" : "pointer",

                            opacity: updatingId === item.id ? 0.6 : 1,

                            transition: "all 0.15s ease",

                          }}

                        >

                          {updatingId === item.id

                            ? "Updating..."

                            : item.enabled

                              ? "Pause"

                              : "Activate"}

                        </button>

                        {/* Delete button */}

                        <button

                          type="button"

                          onClick={() => deleteAutomation(item)}

                          disabled={deletingId === item.id}

                          title="Delete automation"

                          style={{

                            padding: "6px 10px",

                            borderRadius: "var(--radius-md)",

                            border: "1px solid var(--border-default)",

                            background: "transparent",

                            color: "var(--text-muted)",

                            fontSize: "12px",

                            cursor: deletingId === item.id ? "wait" : "pointer",

                            opacity: deletingId === item.id ? 0.5 : 1,

                            transition: "all 0.15s ease",

                          }}

                          onMouseEnter={(e) => {

                            e.currentTarget.style.color = "var(--red)";

                            e.currentTarget.style.borderColor = "var(--red)";

                            e.currentTarget.style.background = "var(--red-subtle)";

                          }}

                          onMouseLeave={(e) => {

                            e.currentTarget.style.color = "var(--text-muted)";

                            e.currentTarget.style.borderColor =

                              "var(--border-default)";

                            e.currentTarget.style.background = "transparent";

                          }}

                        >

                          {deletingId === item.id ? "..." : "Delete"}

                        </button>

                      </div>

                    </div>

                  );

                })}

              </div>

            )}

          </div>

          {/* Automation Execution History */}

          <ExecutionHistory />

        </div>

        {/* Right Filter Panel */}

        {showFilters && (

          <aside

            style={{

              width: "280px",

              borderLeft: "1px solid var(--border-subtle)",

              padding: "20px",

              background: "var(--bg-sidebar)",

              flexShrink: 0,

              display: "flex",

              flexDirection: "column",

              gap: "16px",

            }}

          >

            <div

              style={{

                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

                marginBottom: "4px",

              }}

            >

              <h3

                style={{

                  fontSize: "13px",

                  fontWeight: 600,

                  color: "var(--text-primary)",

                }}

              >

                Filter Workflows

              </h3>

              <button

                type="button"

                onClick={() => setShowFilters(false)}

                style={{

                  background: "transparent",

                  border: "none",

                  color: "var(--text-muted)",

                  fontSize: "14px",

                  cursor: "pointer",

                }}

              >

                ✕

              </button>

            </div>

            <FilterDropdown

              label="Status"

              value={statusFilter}

              onChange={setStatusFilter}

              options={[

                { value: "all", label: "All Statuses" },

                { value: "active", label: "Active" },

                { value: "paused", label: "Paused" },

              ]}

            />

            <FilterDropdown

              label="Trigger Event"

              value={triggerFilter}

              onChange={setTriggerFilter}

              options={[

                { value: "all", label: "All Triggers" },

                ...Object.entries(TRIGGER_META).map(([val, info]) => ({

                  value: val,

                  label: info.label,

                })),

              ]}

            />

            <FilterDropdown

              label="Action"

              value={actionFilter}

              onChange={setActionFilter}

              options={[

                { value: "all", label: "All Actions" },

                ...Object.entries(ACTION_META).map(([val, info]) => ({

                  value: val,

                  label: info.label,

                })),

              ]}

            />

            <div style={{ marginTop: "auto", display: "flex", gap: "8px" }}>

              <button

                type="button"

                onClick={resetFilters}

                style={{

                  flex: 1,

                  padding: "8px",

                  borderRadius: "var(--radius-md)",

                  border: "1px solid var(--border-default)",

                  background: "transparent",

                  color: "var(--text-secondary)",

                  fontSize: "12px",

                  cursor: "pointer",

                }}

              >

                Reset

              </button>

              <button

                type="button"

                onClick={() => setShowFilters(false)}

                style={{

                  flex: 1,

                  padding: "8px",

                  borderRadius: "var(--radius-md)",

                  border: "none",

                  background: "var(--accent)",

                  color: "#fff",

                  fontSize: "12px",

                  fontWeight: 600,

                  cursor: "pointer",

                }}

              >

                Done

              </button>

            </div>

          </aside>

        )}

      </div>

      {/* Create Automation Modal */}

      {showCreateForm && (

        <CreateAutomationForm

          onClose={() => setShowCreateForm(false)}

          onCreated={() => {

            setRefreshKey((current) => current + 1);

          }}

        />

      )}

    </>

  );

}

function StatCard({

  label,

  value,

  helper,

  highlight = false,

}: {

  label: string;

  value: string;

  helper?: string;

  highlight?: boolean;

}) {

  return (

    <div

      style={{

        background: "var(--bg-surface)",

        border: "1px solid var(--border-default)",

        borderRadius: "var(--radius-lg)",

        padding: "18px 20px",

        position: "relative",

        overflow: "hidden",

      }}

    >

      {highlight && (

        <div

          style={{

            position: "absolute",

            top: 0,

            left: 0,

            right: 0,

            height: "2px",

            background: "var(--accent)",

          }}

        />

      )}

      <p

        style={{

          fontSize: "12px",

          color: "var(--text-muted)",

          marginBottom: "6px",

          fontWeight: 500,

        }}

      >

        {label}

      </p>

      <p

        style={{

          fontSize: "26px",

          fontWeight: 700,

          color: "var(--text-primary)",

          lineHeight: 1.1,

        }}

      >

        {value}

      </p>

      {helper && (

        <p

          style={{

            fontSize: "11px",

            color: "var(--text-secondary)",

            marginTop: "6px",

          }}

        >

          {helper}

        </p>

      )}

    </div>

  );

}

function FilterDropdown({

  label,

  value,

  onChange,

  options,

}: {

  label: string;

  value: string;

  onChange: (value: string) => void;

  options: { value: string; label: string }[];

}) {

  return (

    <div>

      <label

        style={{

          display: "block",

          fontSize: "11px",

          fontWeight: 600,

          textTransform: "uppercase",

          letterSpacing: "0.5px",

          color: "var(--text-muted)",

          marginBottom: "6px",

        }}

      >

        {label}

      </label>

      <select

        value={value}

        onChange={(event) => onChange(event.target.value)}

        style={{

          width: "100%",

          padding: "8px 10px",

          borderRadius: "var(--radius-md)",

          border: "1px solid var(--border-default)",

          background: "var(--bg-input)",

          color: "var(--text-primary)",

          fontSize: "12px",

          outline: "none",

          cursor: "pointer",

        }}

      >

        {options.map((option) => (

          <option key={option.value} value={option.value}>

            {option.label}

          </option>

        ))}

      </select>

    </div>

  );

}
