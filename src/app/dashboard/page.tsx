"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/src/components/ui/icon";

interface MeetingItem {
  id: string;
  title: string;
  time: string;
  status: "scheduled" | "past";
  attendees: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeWeeksStreak: 4,
    pullRequestsMerged: 18,
    codeCommits: 142,
    leadsCount: 0,
    customersCount: 0,
    automationsCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [streakPeriod, setStreakPeriod] = useState<"current" | "longest">("current");
  const [prPage, setPrPage] = useState(0);

  // Quick action state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [meetingSubject, setMeetingSubject] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingsList, setMeetingsList] = useState<MeetingItem[]>([]);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const [leadsRes, automationsRes, customersRes] = await Promise.allSettled([
          fetch("/api/leads"),
          fetch("/api/automations"),
          fetch("/api/customers"),
        ]);

        let leads = 0;
        let automations = 0;
        let customers = 0;

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

        setStats({
          activeWeeksStreak: 4,
          pullRequestsMerged: Math.max(12, automations * 3),
          codeCommits: Math.max(48, leads * 8 + automations * 14),
          leadsCount: leads,
          customersCount: customers,
          automationsCount: automations,
        });
      } catch (err) {
        console.error("Failed to load metrics", err);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, []);

  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingSubject.trim()) return;

    const newMeeting: MeetingItem = {
      id: "m-" + Date.now(),
      title: meetingSubject.trim(),
      time: meetingTime || "Today at 3:00 PM UTC",
      status: "scheduled",
      attendees: "2 attendees",
    };

    setMeetingsList([newMeeting, ...meetingsList]);
    setMeetingSubject("");
    setMeetingTime("");
    setShowScheduleModal(false);

    setNotificationMsg("Meeting scheduled successfully");
    setTimeout(() => setNotificationMsg(null), 3000);
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
            padding: "10px 16px",
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
        {/* Page Title & Subtitle */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 600,
              color: "#0f172a",
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#64748b",
              marginTop: "4px",
              marginBottom: 0,
            }}
          >
            Your activity, meetings, and actions across all projects.
          </p>
        </div>

        {/* Section: Meetings */}
        <section style={{ marginBottom: "36px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "15px",
                fontWeight: 600,
                color: "#1e293b",
              }}
            >
              <Icon name="calendar" size={18} style={{ color: "#475569" }} />
              <span>Meetings</span>
            </div>

            <button
              onClick={() => setShowScheduleModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#0284c7",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0369a1")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0284c7")}
            >
              <Icon name="plus" size={14} />
              Schedule Meeting
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Left Card: Past Meetings */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "48px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "20px",
                minHeight: "140px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  border: "2px solid #cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  flexShrink: 0,
                }}
              >
                <Icon name="history" size={26} strokeWidth={1.8} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "3px",
                  }}
                >
                  You haven&apos;t joined a meeting yet
                </div>
                <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                  Your past meetings will appear here.
                </div>
              </div>
            </div>

            {/* Right Card: Scheduled Meetings */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "48px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "20px",
                minHeight: "140px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  border: "2px solid #cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  flexShrink: 0,
                }}
              >
                <Icon name="check-circle" size={26} strokeWidth={1.8} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "3px",
                  }}
                >
                  {meetingsList.length > 0
                    ? `${meetingsList.length} Upcoming Meeting${meetingsList.length > 1 ? "s" : ""}`
                    : "Your calendar is clear"}
                </div>
                <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                  {meetingsList.length > 0
                    ? meetingsList[0].title + " - " + meetingsList[0].time
                    : "Your scheduled meetings will appear here."}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Recent Progress */}
        <section style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "15px",
                fontWeight: 600,
                color: "#1e293b",
              }}
            >
              <Icon name="bar-chart" size={18} style={{ color: "#475569" }} />
              <span>Recent Progress</span>
            </div>

            {/* Slider arrows */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={() => setPrPage(Math.max(0, prPage - 1))}
                disabled={prPage === 0}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: prPage === 0 ? "#cbd5e1" : "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: prPage === 0 ? "default" : "pointer",
                }}
              >
                <Icon name="chevron-left" size={14} />
              </button>
              <button
                onClick={() => setPrPage(prPage + 1)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Icon name="chevron-right" size={14} />
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Card 1: Active Weeks Streak */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "24px",
                minHeight: "180px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)";
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                Active Weeks Streak
              </div>
              <div style={{ marginTop: "32px" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 500,
                    color: "#0f172a",
                    lineHeight: 1,
                  }}
                >
                  {stats.activeWeeksStreak}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    marginTop: "8px",
                  }}
                >
                  Current streak
                </div>
              </div>
            </div>

            {/* Card 2: Pull Requests Merged */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "24px",
                minHeight: "180px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)";
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                Pull Requests Merged
              </div>
              <div style={{ marginTop: "32px" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 500,
                    color: "#0f172a",
                    lineHeight: 1,
                  }}
                >
                  {stats.pullRequestsMerged}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    marginTop: "8px",
                  }}
                >
                  Last 30 days
                </div>
              </div>
            </div>

            {/* Card 3: Code Commits */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "24px",
                minHeight: "180px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)";
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                Code Commits
              </div>
              <div style={{ marginTop: "32px" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 500,
                    color: "#0f172a",
                    lineHeight: 1,
                  }}
                >
                  {stats.codeCommits}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    marginTop: "8px",
                  }}
                >
                  Last 30 days
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Live Pipeline & Connected Operations */}
        <section style={{ marginBottom: "40px" }}>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#1e293b",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Icon name="zap" size={18} style={{ color: "#0284c7" }} />
            <span>Operational Pipeline Telemetry</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            <Link
              href="/dashboard/leads"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "20px",
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "border-color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0284c7")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
            >
              <div>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                  Active Leads Ingested
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "#0f172a",
                    marginTop: "4px",
                  }}
                >
                  {stats.leadsCount}
                </div>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor: "#eff6ff",
                  color: "#0284c7",
                  fontWeight: 600,
                }}
              >
                View Leads
              </span>
            </Link>

            <Link
              href="/dashboard/customers"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "20px",
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "border-color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0284c7")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
            >
              <div>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                  Active Customer Accounts
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "#0f172a",
                    marginTop: "4px",
                  }}
                >
                  {stats.customersCount}
                </div>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor: "#f0fdf4",
                  color: "#16a34a",
                  fontWeight: 600,
                }}
              >
                Directory
              </span>
            </Link>

            <Link
              href="/dashboard/automation"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "20px",
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "border-color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0284c7")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
            >
              <div>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                  Automations Configured
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "#0f172a",
                    marginTop: "4px",
                  }}
                >
                  {stats.automationsCount}
                </div>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor: "#faf5ff",
                  color: "#9333ea",
                  fontWeight: 600,
                }}
              >
                Workflow Engine
              </span>
            </Link>
          </div>
        </section>
      </main>

      {/* Floating Chat / AI Co-pilot trigger (Bottom right blue circle) */}
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
          backgroundColor: "#3b82f6",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
          textDecoration: "none",
          zIndex: 100,
          transition: "transform 0.15s ease, background 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.backgroundColor = "#2563eb";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.backgroundColor = "#3b82f6";
        }}
      >
        <Icon name="chat" size={22} />
      </Link>

      {/* Footer matching reference screenshot copyright text */}
      <footer
        style={{
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
          padding: "24px 32px",
          textAlign: "center",
          fontSize: "12px",
          color: "#94a3b8",
          marginTop: "auto",
        }}
      >
        <div>
          Copyright &copy; 2026 Autozip Operations Foundation. All rights reserved. Registered
          trademarks belong to their respective holders. For more information, please see our{" "}
          <Link href="/dashboard/settings" style={{ color: "#0284c7" }}>
            Platform Usage
          </Link>
          ,{" "}
          <Link href="/dashboard/settings" style={{ color: "#0284c7" }}>
            Privacy Policy
          </Link>
          , and{" "}
          <Link href="/dashboard/settings" style={{ color: "#0284c7" }}>
            Cookie Settings
          </Link>
          .
        </div>
      </footer>

      {/* Interactive Schedule Meeting Modal */}
      {showScheduleModal && (
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
                Schedule New Meeting
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
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

            <form onSubmit={handleScheduleMeeting}>
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
                  Meeting Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Operations Sync"
                  value={meetingSubject}
                  onChange={(e) => setMeetingSubject(e.target.value)}
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
                  Time / Schedule
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow at 10:00 AM UTC"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
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
                  onClick={() => setShowScheduleModal(false)}
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
                  Save Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
