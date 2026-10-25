"use client";

import TopBar from "@/src/components/top-bar";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [userName, setUserName] = useState("");
  const [editingUserName, setEditingUserName] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [editingUserPhone, setEditingUserPhone] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [editingCompany, setEditingCompany] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("ADMIN");
  const [userId, setUserId] = useState("");
  const [activeIntegrations, setActiveIntegrations] = useState(0);

  const [webhookUrl, setWebhookUrl] = useState("/api/webhooks/lead");
  const [copied, setCopied] = useState(false);

  // Test webhook modal state
  const [showTestModal, setShowTestModal] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testName, setTestName] = useState("Sarah Jenkins");
  const [testEmail, setTestEmail] = useState("sarah.jenkins@healthflow.io");
  const [testCompany, setTestCompany] = useState("HealthFlow Systems");
  const [testMessage, setTestMessage] = useState(
    "Looking to deploy automated patient triage and autonomous WhatsApp follow-up across our 3 multi-specialty clinics."
  );

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          setUserName(data.settings.user?.name || session?.user?.name || "Operator");
          setUserEmail(data.settings.user?.email || session?.user?.email || "operator@autozip.dev");
          setUserPhone(data.settings.user?.phone || "");
          setUserRole(data.settings.user?.role || "ADMIN");
          setUserId(data.settings.user?.id || session?.user?.id || "");
          setCompanyName(data.settings.business?.name || "Autoleep Enterprise");
          setActiveIntegrations(data.settings.integrations?.activeCount || 0);

          if (data.settings.webhook?.fullUrl) {
            setWebhookUrl(data.settings.webhook.fullUrl);
          } else if (typeof window !== "undefined") {
            setWebhookUrl(`${window.location.origin}/api/webhooks/lead`);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [session]);

  async function handleSaveCompany() {
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update company name");

      setSuccessMsg("Business profile updated successfully");
      setEditingCompany(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveUserName() {
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update operator name");

      if (updateSession) {
        await updateSession({ name: userName });
      }

      setSuccessMsg("Operator username / display name updated successfully");
      setEditingUserName(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update operator name");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveUserPhone() {
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userPhone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update contact number");

      setSuccessMsg("Contact number updated successfully");
      setEditingUserPhone(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update contact number");
    } finally {
      setSaving(false);
    }
  }

  function handleCopyWebhook() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSendTestWebhook() {
    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/webhooks/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: testName,
          email: testEmail,
          company: testCompany,
          message: testMessage,
          source: "settings-test-tool",
        }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || "Network error sending webhook payload",
      });
    } finally {
      setTestLoading(false);
    }
  }

  return (
    <div className="az-dash-page">
      <TopBar title="Settings" subtitle="Workspace preferences, team access, and ingress telemetry" />

      <div className="az-dash-body">
        {successMsg && (
          <div style={{ marginBottom: "16px", padding: "10px 14px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid var(--az-emerald)", borderRadius: "4px", color: "var(--az-emerald)", fontSize: "12px", fontFamily: "var(--az-font-mono)" }}>
            [SUCCESS] {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ marginBottom: "16px", padding: "10px 14px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--az-rose)", borderRadius: "4px", color: "var(--az-rose)", fontSize: "12px", fontFamily: "var(--az-font-mono)" }}>
            [ERROR] {errorMsg}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Operator Profile & Identity */}
          <div className="az-dash-card">
            <div className="az-dash-card-header">
              <div className="az-dash-card-title">
                <span className="az-status-dot" />
                <span>Operator Profile &amp; Identity</span>
              </div>
              <span className="az-tag az-tag-emerald">Signed In</span>
            </div>
            <div className="az-dash-card-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "12px", color: "var(--az-text-muted)", marginBottom: "4px" }}>
                Active operator credentials, display name, and account access
              </p>

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
                <span style={{ fontSize: "12px", color: "var(--az-text-secondary)" }}>Username / Name</span>
                {editingUserName ? (
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="az-field-input"
                      style={{ padding: "4px 8px", fontSize: "12px", width: "160px" }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveUserName}
                      disabled={saving || !userName.trim()}
                      className="az-btn-primary"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingUserName(false)}
                      className="az-btn-secondary"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#ffffff", fontWeight: 600, fontFamily: "var(--az-font-mono)" }}>
                      {loading ? "Loading..." : userName}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingUserName(true)}
                      className="az-btn-secondary"
                      style={{ fontSize: "10px", padding: "2px 6px" }}
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              <SettingsRow label="Operator Email" value={loading ? "Loading..." : userEmail} />

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
                <span style={{ fontSize: "12px", color: "var(--az-text-secondary)" }}>Contact No.</span>
                {editingUserPhone ? (
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input
                      type="tel"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="az-field-input"
                      style={{ padding: "4px 8px", fontSize: "12px", width: "160px" }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveUserPhone}
                      disabled={saving}
                      className="az-btn-primary"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingUserPhone(false)}
                      className="az-btn-secondary"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: userPhone ? "#ffffff" : "var(--az-text-muted)", fontWeight: 600, fontFamily: "var(--az-font-mono)" }}>
                      {loading ? "Loading..." : userPhone || "Not configured"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingUserPhone(true)}
                      className="az-btn-secondary"
                      style={{ fontSize: "10px", padding: "2px 6px" }}
                    >
                      {userPhone ? "Change" : "Add"}
                    </button>
                  </div>
                )}
              </div>

              <SettingsRow label="Assigned Role" value={userRole} badge="emerald" />
              {userId && <SettingsRow label="Node Identifier" value={`USR-${userId.slice(0, 8).toUpperCase()}`} />}
            </div>
          </div>

          {/* Business Profile */}
          <div className="az-dash-card">
            <div className="az-dash-card-header">
              <div className="az-dash-card-title">
                <span className="az-status-dot" />
                <span>Business Profile</span>
              </div>
              <span className="az-tag az-tag-emerald">Active Node</span>
            </div>
            <div className="az-dash-card-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "12px", color: "var(--az-text-muted)", marginBottom: "4px" }}>
                Company identity and workspace node credentials
              </p>

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
                <span style={{ fontSize: "12px", color: "var(--az-text-secondary)" }}>Company Name</span>
                {editingCompany ? (
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="az-field-input"
                      style={{ padding: "4px 8px", fontSize: "12px", width: "160px" }}
                    />
                    <button
                      type="button"
                      onClick={handleSaveCompany}
                      disabled={saving}
                      className="az-btn-primary"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCompany(false)}
                      className="az-btn-secondary"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#ffffff", fontWeight: 600, fontFamily: "var(--az-font-mono)" }}>
                      {loading ? "Loading..." : companyName}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingCompany(true)}
                      className="az-btn-secondary"
                      style={{ fontSize: "10px", padding: "2px 6px" }}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              <SettingsRow label="Timezone" value="Asia/Kolkata (IST)" />
              <SettingsRow label="Default Language" value="English (US)" />
            </div>
          </div>

          {/* API & Webhooks */}
          <div className="az-dash-card">
            <div className="az-dash-card-header">
              <div className="az-dash-card-title">
                <span className="az-status-dot" />
                <span>API &amp; Inbound Webhooks</span>
              </div>
              <span className="az-tag az-tag-emerald">Ingress Active</span>
            </div>
            <div className="az-dash-card-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "12px", color: "var(--az-text-muted)", marginBottom: "4px" }}>
                Public webhook ingress for receiving leads from forms, websites &amp; integrations
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  padding: "10px 14px",
                  borderRadius: "4px",
                  background: "rgba(22, 26, 32, 0.6)",
                  border: "1px solid var(--az-border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "var(--az-text-secondary)" }}>Webhook Ingress URL</span>
                  <button
                    type="button"
                    onClick={handleCopyWebhook}
                    className="az-btn-secondary"
                    style={{ fontSize: "11px", padding: "3px 8px" }}
                  >
                    {copied ? "Copied!" : "Copy URL"}
                  </button>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--az-cyan)",
                    fontFamily: "var(--az-font-mono)",
                    wordBreak: "break-all",
                    background: "rgba(0, 0, 0, 0.3)",
                    padding: "6px 8px",
                    borderRadius: "3px",
                  }}
                >
                  {webhookUrl}
                </div>
              </div>

              <SettingsRow label="Ingress Status" value="Live & Listening" badge="emerald" />

              <div style={{ marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => setShowTestModal(true)}
                  className="az-btn-primary"
                  style={{ width: "100%", fontSize: "12px", padding: "8px 14px", justifyContent: "center" }}
                >
                  Test Ingress Webhook Tool →
                </button>
              </div>
            </div>
          </div>

          {/* Connected Apps */}
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
                  <SettingsRow label="Active Integrations" value={`${activeIntegrations} Connected`} />
                  <SettingsRow label="Grok / xAI Engine" value="Active" badge="emerald" />
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

          {/* Team & Access */}
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
              <SettingsRow label="Workspace Owner" value={loading ? "Loading..." : userEmail} />
              <SettingsRow label="Your Role" value={userRole} badge="blue" />
              <SettingsRow label="Seats Active" value="1 of 5 seats used" />
            </div>
          </div>

          {/* Notifications & Alerts */}
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

          {/* Account Security */}
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

        {/* Ingress Webhook Test Tool Modal */}
        {showTestModal && (
          <div
            className="az-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTestModal(false);
            }}
          >
            <div className="az-modal-box" style={{ maxWidth: "600px" }}>
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--az-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="az-tag az-tag-emerald" style={{ fontSize: "10px" }}>
                    POST /api/webhooks/lead
                  </span>
                  <h3 style={{ fontFamily: "var(--az-font-mono)", fontSize: "13px", color: "#ffffff", textTransform: "uppercase" }}>
                    Test Inbound Lead Webhook
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="az-btn-secondary"
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                >
                  ✕ Close
                </button>
              </div>

              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <p style={{ fontSize: "12px", color: "var(--az-text-secondary)" }}>
                  Trigger an automated lead ingestion payload to verify that your endpoint and AI qualification pipelines are operating normally.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="az-field">
                    <label className="az-field-label">Lead Name</label>
                    <input
                      type="text"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      className="az-field-input"
                    />
                  </div>
                  <div className="az-field">
                    <label className="az-field-label">Email</label>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="az-field-input"
                    />
                  </div>
                </div>

                <div className="az-field">
                  <label className="az-field-label">Company / Organization</label>
                  <input
                    type="text"
                    value={testCompany}
                    onChange={(e) => setTestCompany(e.target.value)}
                    className="az-field-input"
                  />
                </div>

                <div className="az-field">
                  <label className="az-field-label">Inquiry Message</label>
                  <textarea
                    rows={3}
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="az-field-textarea"
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={handleSendTestWebhook}
                    disabled={testLoading}
                    className="az-btn-primary"
                    style={{ fontSize: "12px", padding: "8px 20px" }}
                  >
                    {testLoading ? "Transmitting & Scoring Lead..." : "Dispatch Inbound Webhook"}
                  </button>
                </div>

                {testResult && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "12px",
                      borderRadius: "4px",
                      background: testResult.success ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                      border: `1px solid ${testResult.success ? "var(--az-emerald)" : "var(--az-rose)"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: testResult.success ? "var(--az-emerald)" : "var(--az-rose)",
                          fontFamily: "var(--az-font-mono)",
                        }}
                      >
                        {testResult.success ? "HTTP 201 CREATED // LEAD INGESTED" : "TRANSMISSION FAILED"}
                      </span>
                      {testResult.lead?.aiScore !== undefined && (
                        <span className="az-tag az-tag-emerald" style={{ fontSize: "11px" }}>
                          AI SCORE: {testResult.lead.aiScore}/100 ({testResult.lead.priority?.toUpperCase()})
                        </span>
                      )}
                    </div>

                    {testResult.lead?.aiSummary && (
                      <div style={{ fontSize: "11px", color: "var(--az-text-secondary)", marginBottom: "6px" }}>
                        <strong>AI Summary:</strong> {testResult.lead.aiSummary}
                      </div>
                    )}

                    {testResult.error && (
                      <div style={{ fontSize: "11px", color: "var(--az-rose)", fontFamily: "var(--az-font-mono)" }}>
                        {testResult.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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