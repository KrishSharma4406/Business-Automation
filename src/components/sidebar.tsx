"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Icon } from "@/src/components/ui/icon";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"Home" | "Projects" | "Organization">("Home");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userName = session?.user?.name || "Krish Kumar";
  const userInitial = userName.trim().charAt(0).toUpperCase() || "K";

  // Context-aware groups depending on activeTab
  const getNavGroups = (): NavGroup[] => {
    if (activeTab === "Projects") {
      return [
        {
          title: "PROJECT WORKFLOWS",
          items: [
            { label: "Active Automations", href: "/dashboard/automation", icon: "automation" },
            { label: "Pipeline Telemetry", href: "/dashboard", icon: "bar-chart" },
            { label: "Inbound Leads", href: "/dashboard/leads", icon: "events" },
          ],
        },
        {
          title: "CONNECTED STACK",
          items: [
            { label: "Integrations & APIs", href: "/dashboard/settings/integrations", icon: "code" },
            { label: "Repository Sync", href: "/dashboard/settings", icon: "git-commit" },
          ],
        },
      ];
    }

    if (activeTab === "Organization") {
      return [
        {
          title: "MEMBERS & DIRECTORY",
          items: [
            { label: "Customer Accounts", href: "/dashboard/customers", icon: "groups" },
            { label: "Conversations & Chat", href: "/dashboard/conversations", icon: "chat" },
          ],
        },
        {
          title: "ADMINISTRATION",
          items: [
            { label: "Workspace Settings", href: "/dashboard/settings", icon: "settings" },
            { label: "API Credentials", href: "/dashboard/settings/integrations", icon: "code" },
          ],
        },
      ];
    }

    // Default: Home
    return [
      {
        title: "OPERATIONS",
        items: [
          { label: "Overview", href: "/dashboard", icon: "dashboard" },
          { label: "Conversations", href: "/dashboard/conversations", icon: "chat" },
          { label: "Leads Pipeline", href: "/dashboard/leads", icon: "events" },
          { label: "Customers", href: "/dashboard/customers", icon: "groups" },
          { label: "Automations", href: "/dashboard/automation", icon: "automation" },
        ],
      },
      {
        title: "CONFIGURATION",
        items: [
          { label: "Integrations", href: "/dashboard/settings/integrations", icon: "code" },
          { label: "Settings", href: "/dashboard/settings", icon: "settings" },
        ],
      },
    ];
  };

  const navGroups = getNavGroups();

  return (
    <aside
      style={{
        width: "250px",
        minWidth: "250px",
        maxWidth: "250px",
        height: "100vh",
        position: "sticky",
        top: 0,
        backgroundColor: "#081b2d",
        color: "#d0dbe5",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        userSelect: "none",
        zIndex: 50,
      }}
    >
      {/* Brand & Actions Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px 12px",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              border: "1.5px solid #38bdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(56, 189, 248, 0.12)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: "#38bdf8",
                borderRadius: "2px",
              }}
            />
          </div>
          <span style={{ fontWeight: 700, fontSize: "14px", letterSpacing: "-0.01em" }}>
            Autozip OS
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Link
            href="/dashboard/conversations"
            title="Open AI Chat"
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              borderRadius: "4px",
              textDecoration: "none",
            }}
          >
            <Icon name="chat" size={15} />
          </Link>
          <Link
            href="/dashboard/leads"
            title="Ingest Lead / New Action"
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#0284c7",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0369a1")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0284c7")}
          >
            <Icon name="plus" size={13} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      {/* Pill Mode Switcher (Home / Projects / Organization) */}
      <div style={{ padding: "0 14px 12px" }}>
        <div
          style={{
            display: "flex",
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            borderRadius: "20px",
            padding: "2px",
            gap: "2px",
          }}
        >
          {(["Home", "Projects", "Organization"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  fontSize: "11px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#081b2d" : "#94a3b8",
                  backgroundColor: isActive ? "#ffffff" : "transparent",
                  border: "none",
                  borderRadius: "16px",
                  padding: "5px 4px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon
                  name={
                    tab === "Home" ? "home" : tab === "Projects" ? "folder" : "building"
                  }
                  size={12}
                />
                <span>{tab}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Profile Card */}
      <div style={{ padding: "0 14px 10px" }}>
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "8px",
            padding: "10px 12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  backgroundColor: "#38bdf8",
                  color: "#081b2d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {userInitial}
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#ffffff",
                  maxWidth: "135px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userName}
              </span>
            </div>
            <span style={{ color: "#64748b" }}>
              <Icon name="code" size={13} />
            </span>
          </div>

          <Link
            href="/dashboard/settings"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "8px",
              paddingTop: "7px",
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              fontSize: "11px",
              color: "#94a3b8",
              textDecoration: "none",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Icon name="folder" size={11} />
              Profile & Account
            </span>
            <Icon name="external-link" size={10} />
          </Link>
        </div>
      </div>

      {/* Primary Dashboard Link */}
      <div style={{ padding: "0 14px 6px" }}>
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#ffffff",
            backgroundColor:
              pathname === "/dashboard"
                ? "rgba(56, 189, 248, 0.22)"
                : "rgba(255, 255, 255, 0.04)",
            border:
              pathname === "/dashboard"
                ? "1px solid rgba(56, 189, 248, 0.35)"
                : "1px solid transparent",
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
        >
          <Icon name="dashboard" size={15} style={{ color: "#38bdf8" }} />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Nav List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {navGroups.map((group) => (
          <div key={group.title}>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#64748b",
                marginBottom: "5px",
                paddingLeft: "6px",
              }}
            >
              {group.title}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: isActive ? "#ffffff" : "#cbd5e1",
                      backgroundColor: isActive
                        ? "rgba(56, 189, 248, 0.15)"
                        : "transparent",
                      textDecoration: "none",
                      transition: "all 0.12s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                        e.currentTarget.style.color = "#ffffff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#cbd5e1";
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: isActive ? "#38bdf8" : "#94a3b8" }}>
                        <Icon name={item.icon} size={15} />
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "1px 6px",
                          borderRadius: "10px",
                          backgroundColor: "#0284c7",
                          color: "#ffffff",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Profile Controls */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#071726",
          position: "relative",
        }}
      >
        <div
          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            flex: 1,
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#e2e8f0",
              color: "#081b2d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            {userInitial}
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "#e2e8f0",
              maxWidth: "120px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {userName}
          </span>
          <Icon name="chevron-down" size={13} style={{ color: "#64748b" }} />
        </div>

        {userDropdownOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "48px",
              left: "14px",
              width: "200px",
              backgroundColor: "#0f2338",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "8px",
              padding: "6px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <Link
              href="/dashboard/settings"
              onClick={() => setUserDropdownOpen(false)}
              style={{
                padding: "8px 10px",
                fontSize: "12px",
                color: "#e2e8f0",
                textDecoration: "none",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Icon name="settings" size={14} />
              Workspace Settings
            </Link>
            <Link
              href="/"
              onClick={() => setUserDropdownOpen(false)}
              style={{
                padding: "8px 10px",
                fontSize: "12px",
                color: "#e2e8f0",
                textDecoration: "none",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Icon name="home" size={14} />
              Landing Page
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{
                padding: "8px 10px",
                fontSize: "12px",
                color: "#f87171",
                background: "transparent",
                border: "none",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Icon name="external-link" size={14} />
              Sign Out
            </button>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b" }}>
          <Link
            href="/"
            title="Visit Public Site"
            style={{ color: "#64748b", textDecoration: "none", display: "flex" }}
          >
            <Icon name="external-link" size={14} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
