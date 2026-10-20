"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { id: "01", label: "Dashboard", href: "/dashboard", desc: "Overview & Telemetry" },
  { id: "02", label: "Conversations", href: "/dashboard/conversations", desc: "AI Omnichannel Chat" },
  { id: "03", label: "Customers", href: "/dashboard/customers", desc: "Directory & Profiles" },
  { id: "04", label: "Leads", href: "/dashboard/leads", desc: "AI Scoring & Ingress" },
  { id: "05", label: "Automations", href: "/dashboard/automation", desc: "Deterministic Rules" },
  { id: "06", label: "Settings", href: "/dashboard/settings", desc: "Workspace Node Config" },
  { id: "07", label: "Integrations", href: "/dashboard/settings/integrations", desc: "API Gateways & Sync" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "var(--az-surface)",
        borderRight: "1px solid var(--az-border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid var(--az-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          className="az-brand"
          style={{ textDecoration: "none" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontFamily: "var(--az-font-mono)",
                fontSize: "15px",
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: "#ffffff",
              }}
            >
              AUTOZIP
            </span>
            <span className="az-brand-spec" style={{ fontSize: "9px", padding: "1px 5px" }}>
              SYS.VER 2.4
            </span>
          </div>
        </Link>
        <span className="az-status-dot" title="Runtime Active" />
      </div>

      {/* Operational Node Status Banner */}
      <div
        style={{
          padding: "10px 16px",
          background: "rgba(16, 185, 129, 0.05)",
          borderBottom: "1px solid var(--az-border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "10px",
          fontFamily: "var(--az-font-mono)",
          color: "var(--az-text-secondary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "var(--az-emerald)", fontWeight: 700 }}>●</span>
          <span>SYSTEM ONLINE</span>
        </div>
        <span style={{ color: "var(--az-emerald)" }}>READY</span>
      </div>

      {/* Nav Section Label */}
      <div
        style={{
          padding: "16px 20px 8px",
          fontFamily: "var(--az-font-mono)",
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--az-text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>MAIN MENU</span>
        <span style={{ fontSize: "9px", color: "var(--az-emerald)" }}>[7 PAGES]</span>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: "4px 10px", display: "flex", flexDirection: "column", gap: "3px" }}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 12px",
                borderRadius: "4px",
                fontFamily: "var(--az-font-mono)",
                fontSize: "12px",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#ffffff" : "var(--az-text-secondary)",
                background: isActive ? "var(--az-surface-alt)" : "transparent",
                borderLeft: isActive ? "2px solid var(--az-emerald)" : "2px solid transparent",
                borderTop: "1px solid",
                borderRight: "1px solid",
                borderBottom: "1px solid",
                borderColor: isActive ? "var(--az-border-bright)" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.borderColor = "var(--az-border-subtle)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--az-text-secondary)";
                  e.currentTarget.style.borderColor = "transparent";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <span
                  style={{
                    fontSize: "10px",
                    color: isActive ? "var(--az-emerald)" : "var(--az-text-muted)",
                    fontWeight: 700,
                  }}
                >
                  {item.id}
                </span>
                <span>{item.label}</span>
              </div>
              {isActive ? (
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: "var(--az-emerald)",
                    boxShadow: "0 0 8px var(--az-emerald)",
                  }}
                />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* System Status Module Footer */}
      <div
        style={{
          margin: "12px",
          padding: "14px",
          background: "var(--az-surface-alt)",
          border: "1px solid var(--az-border)",
          borderRadius: "4px",
          fontFamily: "var(--az-font-mono)",
          fontSize: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ color: "var(--az-text-muted)", textTransform: "uppercase" }}>SYSTEM STATUS</span>
          <span className="az-tag az-tag-emerald" style={{ padding: "1px 5px", fontSize: "9px" }}>
            ONLINE
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", color: "var(--az-text-secondary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>DATABASE</span>
            <span style={{ color: "var(--az-emerald)" }}>CONNECTED</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>AI ENGINE</span>
            <span style={{ color: "#ffffff" }}>ACTIVE</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
