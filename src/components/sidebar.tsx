"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

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
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [businessName, setBusinessName] = useState("Autozip Enterprise");
  const [userRole, setUserRole] = useState("ADMIN");
  const [userPhone, setUserPhone] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          if (data.settings.business?.name) setBusinessName(data.settings.business.name);
          if (data.settings.user?.role) setUserRole(data.settings.user.role);
          if (data.settings.user?.phone) setUserPhone(data.settings.user.phone);
        }
      })
      .catch(() => {});
  }, []);

  const userName = session?.user?.name || "Operator";
  const userEmail = session?.user?.email || "operator@autozip.dev";
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSaveName() {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: newName.trim() }),
      });
      if (res.ok) {
        if (updateSession) {
          await updateSession({ name: newName.trim() });
        }
        setEditingName(false);
        setNewName("");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update name:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut({ callbackUrl: "/" });
  }

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
              AUTOLEEP
            </span>
            <span className="az-brand-spec" style={{ fontSize: "9px", padding: "1px 5px" }}>
              SYS.VER 2.4
            </span>
          </div>
        </Link>
        <span className="az-status-dot" title="Runtime Active" />
      </div>

      {/* User Profile Section — below the logo */}
      <div
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid var(--az-border-subtle)",
          position: "relative",
          background: showProfileMenu ? "rgba(22, 26, 32, 0.85)" : "transparent",
          transition: "background 0.15s ease",
        }}
      >
        <div
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            padding: "6px 8px",
            borderRadius: "6px",
            transition: "all 0.15s ease",
            background: showProfileMenu ? "var(--az-surface-alt)" : "transparent",
            border: showProfileMenu ? "1px solid var(--az-border-bright)" : "1px solid transparent",
          }}
          onMouseEnter={(e) => {
            if (!showProfileMenu) e.currentTarget.style.background = "var(--az-surface-alt)";
          }}
          onMouseLeave={(e) => {
            if (!showProfileMenu) e.currentTarget.style.background = "transparent";
          }}
        >
          {/* Avatar Initials */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "6px",
                background: "linear-gradient(135deg, var(--az-emerald), #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--az-font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "0.04em",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
              }}
            >
              {initials}
            </div>
            <span
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--az-emerald)",
                border: "2px solid var(--az-surface)",
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--az-font-mono)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#ffffff",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userName}
              </span>
              <span
                style={{
                  fontFamily: "var(--az-font-mono)",
                  fontSize: "8px",
                  padding: "1px 4px",
                  borderRadius: "2px",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "var(--az-emerald)",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                {userRole}
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--az-font-mono)",
                fontSize: "10px",
                color: "var(--az-text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginTop: "1px",
              }}
            >
              {userEmail}
            </div>
          </div>

          <span
            style={{
              fontSize: "10px",
              color: showProfileMenu ? "var(--az-emerald)" : "var(--az-text-muted)",
              transition: "transform 0.2s ease",
              transform: showProfileMenu ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▼
          </span>
        </div>

        {/* Profile Dropdown / Card */}
        {showProfileMenu && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: "8px",
              right: "8px",
              background: "var(--az-surface-elevated)",
              border: "1px solid var(--az-border-bright)",
              borderRadius: "8px",
              padding: "12px",
              zIndex: 1000,
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.65), 0 0 1px 1px rgba(255, 255, 255, 0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--az-border-subtle)",
                paddingBottom: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "var(--az-emerald)", fontSize: "9px" }}>●</span>
                <span
                  style={{
                    fontFamily: "var(--az-font-mono)",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--az-text-secondary)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Operator Profile
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileMenu(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--az-text-muted)",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "2px 4px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Change Display Name / Username */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "var(--az-font-mono)",
                    fontSize: "10px",
                    color: "var(--az-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Username / Name
                </span>
                {!editingName && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingName(true);
                      setNewName(userName);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--az-emerald)",
                      fontFamily: "var(--az-font-mono)",
                      fontSize: "10px",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    Change
                  </button>
                )}
              </div>

              {editingName ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={userName}
                    className="az-field-input"
                    style={{ fontSize: "12px", padding: "6px 8px" }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") {
                        setEditingName(false);
                        setNewName("");
                      }
                    }}
                  />
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={handleSaveName}
                      disabled={saving || !newName.trim()}
                      className="az-btn-primary"
                      style={{ fontSize: "10px", padding: "4px 10px", flex: 1, justifyContent: "center" }}
                    >
                      {saving ? "Saving..." : "Save Name"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingName(false);
                        setNewName("");
                      }}
                      className="az-btn-secondary"
                      style={{ fontSize: "10px", padding: "4px 8px" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontFamily: "var(--az-font-mono)",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#ffffff",
                    padding: "4px 0",
                  }}
                >
                  {userName}
                </div>
              )}

              {saveSuccess && (
                <span
                  style={{
                    fontFamily: "var(--az-font-mono)",
                    fontSize: "10px",
                    color: "var(--az-emerald)",
                  }}
                >
                  ✓ Name updated successfully
                </span>
              )}
            </div>

            {/* Email Address */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span
                style={{
                  fontFamily: "var(--az-font-mono)",
                  fontSize: "10px",
                  color: "var(--az-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Operator Email
              </span>
              <div
                style={{
                  fontFamily: "var(--az-font-mono)",
                  fontSize: "11px",
                  color: "var(--az-text-secondary)",
                  wordBreak: "break-all",
                }}
              >
                {userEmail}
              </div>
            </div>

            {/* Contact Number */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span
                style={{
                  fontFamily: "var(--az-font-mono)",
                  fontSize: "10px",
                  color: "var(--az-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Contact No.
              </span>
              <div
                style={{
                  fontFamily: "var(--az-font-mono)",
                  fontSize: "11px",
                  color: userPhone ? "#ffffff" : "var(--az-text-muted)",
                  fontWeight: userPhone ? 500 : 400,
                }}
              >
                {userPhone || "Not configured"}
              </div>
            </div>

            {/* Workspace & Role Info */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                padding: "8px",
                background: "rgba(0, 0, 0, 0.25)",
                borderRadius: "4px",
                border: "1px solid var(--az-border-subtle)",
              }}
            >
              <div>
                <div style={{ fontFamily: "var(--az-font-mono)", fontSize: "9px", color: "var(--az-text-muted)", textTransform: "uppercase" }}>
                  Role
                </div>
                <div style={{ fontFamily: "var(--az-font-mono)", fontSize: "11px", color: "var(--az-emerald)", fontWeight: 600 }}>
                  {userRole}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--az-font-mono)", fontSize: "9px", color: "var(--az-text-muted)", textTransform: "uppercase" }}>
                  Workspace
                </div>
                <div
                  style={{
                    fontFamily: "var(--az-font-mono)",
                    fontSize: "11px",
                    color: "#ffffff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={businessName}
                >
                  {businessName}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--az-border)", margin: "2px 0" }} />

            {/* Action Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {/* Account Settings */}
              <ProfileMenuBtn
                label="Account Settings"
                onClick={() => {
                  setShowProfileMenu(false);
                  router.push("/dashboard/settings");
                }}
              />

              {/* Sign Out */}
              <ProfileMenuBtn
                label="Sign Out"
                danger
                onClick={handleSignOut}
              />
            </div>
          </div>
        )}
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

function ProfileMenuBtn({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "7px 10px",
        background: "transparent",
        border: "none",
        borderRadius: "4px",
        fontFamily: "var(--az-font-mono)",
        fontSize: "11px",
        color: danger ? "#ef4444" : "var(--az-text-secondary)",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? "rgba(239, 68, 68, 0.1)"
          : "rgba(255, 255, 255, 0.04)";
        e.currentTarget.style.color = danger ? "#f87171" : "#ffffff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = danger ? "#ef4444" : "var(--az-text-secondary)";
      }}
    >
      {label}
    </button>
  );
}
