"use client";

import TopBar from "@/src/components/top-bar";

export default function DashboardPage() {
  return (
    <>
      <TopBar title="Dashboard" subtitle="Overview" />

      <div style={{ padding: "24px", flex: 1 }}>
        {/* Stats Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <StatCard label="Total Customers" value="0" />
          <StatCard label="Active Leads" value="0" />
          <StatCard label="Conversations" value="0" />
          <StatCard label="Automations" value="0" />
        </div>

        {/* Recent Activity */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
              Recent Activity
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Last 7 days
            </span>
          </div>

          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              No recent activity yet.
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
              Activity from customers, leads, and conversations will show up here.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            marginTop: "16px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          <QuickAction title="Create Lead" description="Add and qualify a new lead with AI" href="/dashboard/leads" />
          <QuickAction title="View Conversations" description="Manage customer conversations" href="/dashboard/conversations" />
          <QuickAction title="Setup Integrations" description="Connect external tools and services" href="/dashboard/settings/integrations" />
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "18px 20px",
      }}
    >
      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
        {label}
      </p>
      <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
        {value}
      </p>
    </div>
  );
}

function QuickAction({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <a
      href={href}
      style={{
        display: "block",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "18px 20px",
        textDecoration: "none",
        transition: "border-color 0.15s ease",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
        e.currentTarget.style.borderColor = "var(--border-active)";
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
        e.currentTarget.style.borderColor = "var(--border-default)";
      }}
    >
      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
        {title}
      </p>
      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
        {description}
      </p>
    </a>
  );
}