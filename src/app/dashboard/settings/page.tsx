"use client";

import TopBar from "@/src/components/top-bar";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Settings" subtitle="Manage your business settings" />

      <div style={{ flex: 1, padding: "24px" }}>
        {/* Settings Sections */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
          <SettingsCard
            title="General"
            description="Business name, timezone, and preferences"
            items={[
              { label: "Business Name", value: "Autozip" },
              { label: "Timezone", value: "Asia/Kolkata (IST)" },
              { label: "Language", value: "English" },
            ]}
          />

          <SettingsCard
            title="Notifications"
            description="Email and push notification preferences"
            items={[
              { label: "Email Alerts", value: "Enabled" },
              { label: "Lead Notifications", value: "Enabled" },
              { label: "Weekly Reports", value: "Disabled" },
            ]}
          />

          <SettingsCard
            title="Team"
            description="Team members and roles"
            items={[
              { label: "Members", value: "1" },
              { label: "Roles", value: "Admin" },
            ]}
          />

          <Link
            href="/dashboard/settings/integrations"
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                height: "100%",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "20px",
                transition: "border-color 0.15s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-active)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-default)";
              }}
            >
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                Integrations
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                Connect external tools and services
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <SettingsRow label="Connected" value="View all" />
              </div>

              <div
                style={{
                  marginTop: "16px",
                  padding: "8px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--accent-subtle)",
                  color: "var(--accent)",
                  fontSize: "12px",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                Manage Integrations
              </div>
            </div>
          </Link>

          <SettingsCard
            title="API"
            description="API keys and webhooks"
            items={[
              { label: "API Key", value: "Not generated" },
              { label: "Webhooks", value: "0 active" },
            ]}
          />

          <SettingsCard
            title="Security"
            description="Password, 2FA, and session management"
            items={[
              { label: "Password", value: "Set" },
              { label: "Two-Factor Auth", value: "Disabled" },
              { label: "Active Sessions", value: "1" },
            ]}
          />
        </div>
      </div>
    </>
  );
}

function SettingsCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: { label: string; value: string }[];
}) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
      }}
    >
      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
        {title}
      </p>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
        {description}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((item) => (
          <SettingsRow key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </div>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-input)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}