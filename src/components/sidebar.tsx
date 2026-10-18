"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Conversations", href: "/dashboard/conversations" },
  { label: "Customers", href: "/dashboard/customers" },
  { label: "Leads", href: "/dashboard/leads" },
  { label: "Automations", href: "/dashboard/automation" },
  { label: "Settings", href: "/dashboard/settings" },
  { label: "Integrations", href: "/dashboard/settings/integrations" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "230px",
        minHeight: "100vh",
        background: "#0c0e12",
        borderRight: "1px solid #1f242c",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #1f242c",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-mono, monospace)",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#ffffff",
            }}
          >
            AUTOZIP
          </span>
          <span
            style={{
              fontFamily: "var(--font-geist-mono, monospace)",
              fontSize: "9px",
              color: "#6b7280",
              border: "1px solid #282f3a",
              padding: "1px 5px",
              borderRadius: "2px",
            }}
          >
            V2.4
          </span>
        </Link>
      </div>

      {/* Nav Section Label */}
      <div
        style={{
          padding: "16px 20px 6px",
          fontFamily: "var(--font-geist-mono, monospace)",
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#525966",
        }}
      >
        OPERATIONAL NODES
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 8px" }}>
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
                padding: "8px 12px",
                marginBottom: "3px",
                borderRadius: "2px",
                fontSize: "12px",
                fontFamily: "var(--font-geist-mono, monospace)",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#ffffff" : "#8c96a5",
                background: isActive ? "#181d24" : "transparent",
                borderLeft: isActive ? "2px solid #10b981" : "2px solid transparent",
                borderTop: "1px solid transparent",
                borderRight: "1px solid transparent",
                borderBottom: "1px solid transparent",
                borderColor: isActive ? "#262e3a" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#14171d";
                  e.currentTarget.style.color = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#8c96a5";
                }
              }}
            >
              <span>{item.label}</span>
              {isActive && (
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status Node */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid #1f242c",
          fontFamily: "var(--font-geist-mono, monospace)",
          fontSize: "10px",
          color: "#6b7280",
          background: "#090a0d",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
            }}
          />
          <span style={{ color: "#d1d5db", fontWeight: 600 }}>US-EAST-CORE</span>
        </div>
        <div>POSTGRES // POOLED &amp; ACTIVE</div>
      </div>
    </aside>
  );
}
