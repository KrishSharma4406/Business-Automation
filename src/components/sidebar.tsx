"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Icon } from "@/src/components/ui/icon";

type NavSection = {
  header: string;
  items: {
    label: string;
    href: string;
    icon: string;
    badge?: string;
  }[];
};

const navigationSections: NavSection[] = [
  {
    header: "ENGAGEMENT",
    items: [
      { label: "Meetings", href: "/dashboard", icon: "meetings" },
      { label: "Conversations", href: "/dashboard/conversations", icon: "chat" },
      { label: "Leads", href: "/dashboard/leads", icon: "events" },
      { label: "Customers", href: "/dashboard/customers", icon: "groups" },
      { label: "Automations", href: "/dashboard/automation", icon: "automation" },
      { label: "Mailing Lists", href: "/dashboard/leads?tab=mailing", icon: "mailing-lists" },
      { label: "Newsletters", href: "/dashboard/leads?tab=newsletters", icon: "newsletters" },
      { label: "Surveys & Votes", href: "/dashboard/settings?tab=surveys", icon: "surveys" },
    ],
  },
  {
    header: "INFRASTRUCTURE",
    items: [
      { label: "Integrations", href: "/dashboard/settings/integrations", icon: "code" },
      { label: "Workspace Settings", href: "/dashboard/settings", icon: "settings" },
    ],
  },
  {
    header: "ORGANIZATION",
    items: [
      { label: "Initiatives", href: "/dashboard/settings?tab=initiatives", icon: "initiatives" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"Home" | "Projects" | "Organization">("Home");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userName = session?.user?.name || "Krish Kumar";
  const userInitial = userName.trim().charAt(0).toUpperCase() || "K";

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
      {/* Top Bar with brand icon, toggle, plus */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px 10px",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "4px",
              border: "2px solid #38bdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(56, 189, 248, 0.1)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: "#38bdf8",
                borderRadius: "1px",
              }}
            />
          </div>
          <span style={{ fontWeight: 600, fontSize: "14px", letterSpacing: "0.02em" }}>
            Autozip
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            title="Toggle Sidebar"
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              borderRadius: "4px",
            }}
          >
            <Icon name="grid" size={16} />
          </button>
          <button
            title="Create New Action"
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#0284c7",
              color: "#ffffff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0369a1")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0284c7")}
          >
            <Icon name="plus" size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Pill Switcher (Home / Projects / Organization) */}
      <div style={{ padding: "4px 14px 12px" }}>
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
                  padding: "5px 6px",
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

      {/* User profile card */}
      <div style={{ padding: "0 14px 12px" }}>
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "8px",
            padding: "10px 12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "#cbd5e1",
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
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#ffffff",
                  maxWidth: "130px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userName}
              </span>
            </div>
            <span style={{ color: "#64748b" }}>
              <Icon name="code" size={14} />
            </span>
          </div>

          <Link
            href="/dashboard/settings"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              fontSize: "11px",
              color: "#94a3b8",
              textDecoration: "none",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Icon name="folder" size={12} />
              Profile & Account
            </span>
            <Icon name="external-link" size={11} />
          </Link>
        </div>
      </div>

      {/* Primary Dashboard pill */}
      <div style={{ padding: "0 14px 8px" }}>
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

      {/* Nav List grouped by category */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {navigationSections.map((section) => (
          <div key={section.header}>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#64748b",
                marginBottom: "6px",
                paddingLeft: "8px",
              }}
            >
              {section.header}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {section.items.map((item) => {
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

      {/* Footer User & Bottom action */}
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

        {/* User Dropdown */}
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
              Settings
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
          <button
            title="System Status"
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              padding: "3px",
            }}
          >
            <Icon name="award" size={14} />
          </button>
          <button
            title="Expand View"
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              padding: "3px",
            }}
          >
            <Icon name="external-link" size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
