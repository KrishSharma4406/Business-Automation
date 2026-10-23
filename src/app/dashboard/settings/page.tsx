"use client";

import TopBar from "@/src/components/top-bar";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="az-dash-page">
      <TopBar title="Settings" subtitle="Workspace preferences, team access, and integrations" />

      <div className="az-dash-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "16px",
          }}
        >
          <div className="az-dash-card">
            <div className="az-dash-card-header">
              <div className="az-dash-card-title">
                <span className="az-status-dot" />
                <span>Business Profile</span>
              </div>
              <span className="az-tag az-tag-emerald">Active</span>
            </div>
            <div className="az-dash-card-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "12px", color: "var(--az-text-muted)", marginBottom: "4px" }}>
                Basic company details and regional timezone
              </p>
              <SettingsRow label="Company Name" value="Autozip Enterprise" />
              <SettingsRow label="Timezone" value="Asia/Kolkata (IST)" />
              <SettingsRow label="Default Language" value="English (US)" />
            </div>
          </div>

          <div className="az-dash-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="az-dash-card-header">
              <div className="az-dash-card-title">
                <span className="az-status-dot" />
                <span>Connected Apps</span>
              </div>
              <span className="az-tag az-tag-blue">Services</span>
            </div>
            <div className="az-dash-card-body" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "12px", color: "var(--az-text-muted)", marginBottom: "10px" }}>
                  Connect WhatsApp, AI engines, Slack, and payment gateways
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <SettingsRow label="WhatsApp Cloud API" value="Ready to connect" />
                  <SettingsRow label="Grok / OpenAI" value="Active" badge="emerald" />
                </div>
              </div>
              <Link
                href="/dashboard/settings/integrations"
                className="az-btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  marginTop: "8px",
                  fontSize: "12px",
                  padding: "8px 16px",
                }}
              >
                Manage Integrations →
              </Link>
            </div>
          </div>

          <div className="az-dash-card">
            <div className="az-dash-card-header">
              <div className="az-dash-card-title">
                <span className="az-status-dot" />
                <span>Notifications &amp; Alerts</span>
              </div>
            </div>
            <div className="az-dash-card-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "12px", color: "var(--az-text-muted)", marginBottom: "4px" }}>
                Configure email and instant alerts for new leads
              </p>
              <SettingsRow label="New Lead Alerts" value="Instant Email" />
              <SettingsRow label="Daily Digest" value="Every morning at 9 AM" />
              <SettingsRow label="Critical Errors" value="Enabled" badge="emerald" />
            </div>
          </div>

          <div className="az-dash-card">
            <div className="az-dash-card-header">
              <div className="az-dash-card-title">
                <span className="az-status-dot" />
                <span>Team &amp; Access</span>
              </div>
            </div>
            <div className="az-dash-card-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "12px", color: "var(--az-text-muted)", marginBottom: "4px" }}>
                Team member accounts and administrative permissions
              </p>
              <SettingsRow label="Workspace Owner" value="krish@autozip.dev" />
              <SettingsRow label="Your Role" value="Administrator" badge="blue" />
              <SettingsRow label="Seats Active" value="1 of 5 seats used" />
            </div>
          </div>

          <div className="az-dash-card">
            <div className="az-dash-card-header">
              <div className="az-dash-card-title">
                <span className="az-status-dot" />
                <span>API &amp; Webhooks</span>
              </div>
            </div>
            <div className="az-dash-card-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "12px", color: "var(--az-text-muted)", marginBottom: "4px" }}>
                Inbound webhooks for receiving leads from websites &amp; forms
              </p>
              <SettingsRow label="Webhook Ingress URL" value="/api/webhooks/lead" />
              <SettingsRow label="API Secret Key" value="••••••••••••••••" />
              <SettingsRow label="Status" value="Live & Listening" badge="emerald" />
            </div>
          </div>

          <div className="az-dash-card">
            <div className="az-dash-card-header">
              <div className="az-dash-card-title">
                <span className="az-status-dot" />
                <span>Account Security</span>
              </div>
            </div>
            <div className="az-dash-card-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "12px", color: "var(--az-text-muted)", marginBottom: "4px" }}>
                Session authentication and security settings
              </p>
              <SettingsRow label="Password" value="Set & protected" />
              <SettingsRow label="Active Session" value="Current Browser" badge="emerald" />
              <SettingsRow label="Two-Factor Auth" value="Optional" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsRow({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: "emerald" | "blue" | "red";
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderRadius: "4px",
        background: "rgba(22, 26, 32, 0.6)",
        border: "1px solid var(--az-border)",
      }}
    >
      <span style={{ fontSize: "12px", color: "var(--az-text-secondary)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "12px", color: "#ffffff", fontWeight: 500, fontFamily: "var(--az-font-mono)" }}>
          {value}
        </span>
        {badge && (
          <span className={`az-tag az-tag-${badge}`} style={{ fontSize: "10px", padding: "1px 6px" }}>
            {badge === "emerald" ? "OK" : "ADMIN"}
          </span>
        )}
      </div>
    </div>
  );
}