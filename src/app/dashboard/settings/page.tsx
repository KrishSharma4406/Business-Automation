"use client";

import { useEffect, useState } from "react";
import TopBar from "@/src/components/top-bar";
import { useSession } from "next-auth/react";
import { Icon } from "@/src/components/ui/icon";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          setUserName(data.settings.user?.name || session?.user?.name || "Operator");
          setUserEmail(data.settings.user?.email || session?.user?.email || "operator@autozip.dev");
          setCompanyName(data.settings.business?.name || "Autozip Enterprise");
        }
      })
      .catch(() => {});
  }, [session]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: userName.trim(),
          businessName: companyName.trim(),
        }),
      });

      if (res.ok) {
        if (updateSession) await updateSession({ name: userName.trim() });
        setNotificationMsg("Workspace settings updated successfully");
        setTimeout(() => setNotificationMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyWebhook = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard?.writeText(`${origin}/api/webhooks/lead`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBar
        title="Workspace Settings"
        subtitle="Manage business credentials, team roles, and public webhook endpoints."
      />

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

      <div style={{ padding: "32px 36px 60px", maxWidth: "900px", width: "100%", margin: "0 auto" }}>
        {/* Profile Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "28px",
            marginBottom: "28px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", margin: "0 0 18px" }}>
            Profile & Organization
          </h2>

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Operator Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Business Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                Primary Account Email
              </label>
              <input
                type="email"
                value={userEmail}
                disabled
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "13px", backgroundColor: "#f8fafc", color: "#64748b", boxSizing: "border-box" }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor: "#0284c7",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Public Inbound Webhook Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "28px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", margin: "0 0 6px" }}>
            Inbound Lead Webhook URL
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>
            Post JSON payloads directly to this endpoint from Webflow, Typeform, or custom scripts to trigger automated scoring.
          </p>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              readOnly
              value="/api/webhooks/lead"
              style={{
                flex: 1,
                padding: "9px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "13px",
                backgroundColor: "#f8fafc",
                color: "#334155",
                fontFamily: "var(--font-mono, monospace)",
              }}
            />
            <button
              onClick={handleCopyWebhook}
              style={{
                padding: "9px 16px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                backgroundColor: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              {copied ? "Copied" : "Copy Path"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
