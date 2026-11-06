"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/src/components/ui/icon";

interface EventLog {
  id: string;
  source: string;
  time: string;
  body: string;
  badge: string;
}

const INITIAL_EVENTS: EventLog[] = [
  {
    id: "e-1",
    source: "WhatsApp Cloud API",
    time: "Just now",
    body: "Lead qualified with high intent (Score: 94/100). Auto-dispatched consultation scheduler.",
    badge: "Auto-Qualified",
  },
  {
    id: "e-2",
    source: "Inbound REST Webhook",
    time: "4 mins ago",
    body: "Commercial inquiry received from enterprise prospect. Emitted to pipeline & database.",
    badge: "Sync Complete",
  },
  {
    id: "e-3",
    source: "Automation Engine",
    time: "18 mins ago",
    body: "Follow-up workflow triggered for stalled lead after 48h idle period.",
    badge: "Dispatched",
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    leadsCount: 0,
    customersCount: 0,
    automationsCount: 0,
    conversationsCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "automated">("all");
  const [eventsList, setEventsList] = useState<EventLog[]>(INITIAL_EVENTS);

  // Interactive Quick Lead Dispatch
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const [leadsRes, automationsRes, customersRes, convRes] = await Promise.allSettled([
          fetch("/api/leads"),
          fetch("/api/automations"),
          fetch("/api/customers"),
          fetch("/api/ai/conversations"),
        ]);

        let leads = 0;
        let automations = 0;
        let customers = 0;
        let convs = 0;

        if (leadsRes.status === "fulfilled" && leadsRes.value.ok) {
          const data = await leadsRes.value.json();
          leads = data.leads?.length || 0;
        }

        if (automationsRes.status === "fulfilled" && automationsRes.value.ok) {
          const data = await automationsRes.value.json();
          automations = data.automations?.length || 0;
        }

        if (customersRes.status === "fulfilled" && customersRes.value.ok) {
          const data = await customersRes.value.json();
          customers = data.customers?.length || 0;
        }

        if (convRes.status === "fulfilled" && convRes.value.ok) {
          const data = await convRes.value.json();
          convs = data.conversations?.length || 0;
        }

        setStats({
          leadsCount: leads,
          customersCount: customers,
          automationsCount: automations,
          conversationsCount: convs,
        });
      } catch (err) {
        console.error("Failed to load metrics", err);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadEmail.trim()) return;

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName.trim(),
          email: leadEmail.trim(),
          company: leadCompany.trim() || "Enterprise Node",
          source: "Dashboard Manual",
        }),
      });

      if (res.ok) {
        setStats((prev) => ({ ...prev, leadsCount: prev.leadsCount + 1 }));
        setEventsList([
          {
            id: "e-" + Date.now(),
            source: "Manual Intake",
            time: "Just now",
            body: `New lead added: ${leadName.trim()} (${leadCompany.trim() || "Direct Ingress"})`,
            badge: "Ingested",
          },
          ...eventsList,
        ]);
        setLeadName("");
        setLeadEmail("");
        setLeadCompany("");
        setShowLeadModal(false);
        setNotificationMsg("Lead ingested successfully into autonomous pipeline");
        setTimeout(() => setNotificationMsg(null), 3500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        color: "#0f172a",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
      }}
    >
      {/* Toast Notification */}
      {notificationMsg && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "24px",
            backgroundColor: "#0284c7",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500,
            boxShadow: "0 10px 25px rgba(2, 132, 199, 0.3)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Icon name="check-circle" size={16} />
          {notificationMsg}
        </div>
      )}

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          padding: "36px 40px 60px",
        }}
      >
        {/* Top Header bar */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Business Operations
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginTop: "4px",
                marginBottom: 0,
              }}
            >
              Unified telemetry across automated pipelines, customers, and active conversations.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              href="/dashboard/conversations"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                color: "#334155",
                borderRadius: "6px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
                transition: "border-color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#94a3b8")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
            >
              <Icon name="chat" size={14} style={{ color: "#0284c7" }} />
              Open AI Co-Pilot
            </Link>

            <button
              onClick={() => setShowLeadModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#0284c7",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0369a1")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0284c7")}
            >
              <Icon name="plus" size={14} strokeWidth={2.5} />
              Ingest Lead
            </button>
          </div>
        </div>

        {/* 4 Primary Operational Metric Cards */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginBottom: "36px",
          }}
        >
          {/* Card 1: Leads */}
          <Link
            href="/dashboard/leads"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "24px",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
              e.currentTarget.style.borderColor = "#38bdf8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.02)";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>
                Total Leads Ingested
              </span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(56, 189, 248, 0.12)",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="events" size={16} />
              </div>
            </div>
            <div style={{ marginTop: "24px" }}>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>
                {stats.leadsCount}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
                Automated scoring & prioritization
              </div>
            </div>
          </Link>

          {/* Card 2: Customers */}
          <Link
            href="/dashboard/customers"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "24px",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
              e.currentTarget.style.borderColor = "#10b981";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.02)";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>
                Active Customers
              </span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="groups" size={16} />
              </div>
            </div>
            <div style={{ marginTop: "24px" }}>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>
                {stats.customersCount}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
                Directory & account profiles
              </div>
            </div>
          </Link>

          {/* Card 3: Automations */}
          <Link
            href="/dashboard/automation"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "24px",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
              e.currentTarget.style.borderColor = "#8b5cf6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.02)";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>
                Active Automations
              </span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(139, 92, 246, 0.12)",
                  color: "#7c3aed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="automation" size={16} />
              </div>
            </div>
            <div style={{ marginTop: "24px" }}>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>
                {stats.automationsCount}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
                Deterministic workflow triggers
              </div>
            </div>
          </Link>

          {/* Card 4: Conversations */}
          <Link
            href="/dashboard/conversations"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "24px",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
              e.currentTarget.style.borderColor = "#f59e0b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.02)";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>
                AI Conversations
              </span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="chat" size={16} />
              </div>
            </div>
            <div style={{ marginTop: "24px" }}>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>
                {stats.conversationsCount}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
                Context-aware business assistance
              </div>
            </div>
          </Link>
        </section>

        {/* Live Operational Events & Ingress Feed */}
        <section style={{ marginBottom: "36px" }}>
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "24px 28px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Icon name="activity" size={18} style={{ color: "#0284c7" }} />
                <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", margin: 0 }}>
                  Real-time Operational Feed
                </h2>
              </div>

              {/* Filter Tabs */}
              <div
                style={{
                  display: "flex",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "6px",
                  padding: "3px",
                  gap: "2px",
                }}
              >
                {(["all", "active", "automated"] as const).map((filter) => {
                  const isSel = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      style={{
                        border: "none",
                        backgroundColor: isSel ? "#ffffff" : "transparent",
                        color: isSel ? "#0f172a" : "#64748b",
                        fontSize: "12px",
                        fontWeight: isSel ? 600 : 500,
                        padding: "4px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        textTransform: "capitalize",
                        boxShadow: isSel ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                      }}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Event rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {eventsList.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#0284c7",
                        marginTop: "6px",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>
                          {ev.source}
                        </span>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>{ev.time}</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#475569", margin: "4px 0 0" }}>
                        {ev.body}
                      </p>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#0369a1",
                      backgroundColor: "rgba(56, 189, 248, 0.15)",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {ev.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Nav Shortcut Bar */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <Link
            href="/dashboard/settings/integrations"
            style={{
              padding: "16px 20px",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textDecoration: "none",
              color: "#334155",
              fontSize: "13px",
              fontWeight: 500,
              transition: "border-color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0284c7")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="code" size={16} style={{ color: "#0284c7" }} />
              Connected Gateways
            </span>
            <Icon name="external-link" size={12} style={{ color: "#94a3b8" }} />
          </Link>

          <Link
            href="/dashboard/settings"
            style={{
              padding: "16px 20px",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textDecoration: "none",
              color: "#334155",
              fontSize: "13px",
              fontWeight: 500,
              transition: "border-color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0284c7")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="settings" size={16} style={{ color: "#0284c7" }} />
              Workspace Configuration
            </span>
            <Icon name="external-link" size={12} style={{ color: "#94a3b8" }} />
          </Link>

          <Link
            href="/"
            style={{
              padding: "16px 20px",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textDecoration: "none",
              color: "#334155",
              fontSize: "13px",
              fontWeight: 500,
              transition: "border-color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0284c7")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="home" size={16} style={{ color: "#0284c7" }} />
              Main Landing Page
            </span>
            <Icon name="external-link" size={12} style={{ color: "#94a3b8" }} />
          </Link>
        </section>
      </main>

      {/* Floating Chat Trigger */}
      <Link
        href="/dashboard/conversations"
        title="Open AI Omnichannel Assistant"
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "#0284c7",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(2, 132, 199, 0.4)",
          textDecoration: "none",
          zIndex: 100,
          transition: "transform 0.15s ease, background 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.backgroundColor = "#0369a1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.backgroundColor = "#0284c7";
        }}
      >
        <Icon name="chat" size={20} />
      </Link>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          padding: "20px 32px",
          textAlign: "center",
          fontSize: "12px",
          color: "#94a3b8",
          marginTop: "auto",
        }}
      >
        <div>
          Copyright &copy; 2026 Autozip Operations Platform. All rights reserved. Registered
          trademarks belong to their respective holders.
        </div>
      </footer>

      {/* Modal: Ingest Lead */}
      {showLeadModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "24px 28px",
              width: "100%",
              maxWidth: "420px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>
                Ingest New Lead
              </h3>
              <button
                onClick={() => setShowLeadModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateLead}>
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "6px",
                  }}
                >
                  Contact Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "6px",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. john@enterprise.io"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "6px",
                  }}
                >
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={leadCompany}
                  onChange={(e) => setLeadCompany(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  style={{
                    padding: "8px 14px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#64748b",
                    backgroundColor: "#f1f5f9",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ffffff",
                    backgroundColor: "#0284c7",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Ingest & Qualify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
