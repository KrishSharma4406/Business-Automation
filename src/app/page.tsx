"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Icon } from "@/src/components/ui/icon";

function Counter({
  target,
  suffix = "",
  duration = 1400,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setVal(Math.floor(eased * target));
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [target, duration]);

  return (
    <span>
      {val}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"crm" | "automations" | "ai">("crm");

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#081b2d",
        color: "#f8fafc",
        fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "rgba(8, 27, 45, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "16px 32px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Brand */}
          <Link
            href="/"
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
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                border: "1.5px solid #38bdf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(56, 189, 248, 0.15)",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#38bdf8",
                  borderRadius: "2px",
                }}
              />
            </div>
            <span style={{ fontWeight: 700, fontSize: "17px", letterSpacing: "-0.01em" }}>
              Autozip
            </span>
          </Link>

          {/* Nav Links */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#94a3b8",
            }}
          >
            <a
              href="#features"
              style={{ color: "#cbd5e1", textDecoration: "none", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#cbd5e1")}
            >
              Platform
            </a>
            <a
              href="#telemetry"
              style={{ color: "#cbd5e1", textDecoration: "none", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#cbd5e1")}
            >
              Telemetry
            </a>
            <a
              href="#architecture"
              style={{ color: "#cbd5e1", textDecoration: "none", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#cbd5e1")}
            >
              Architecture
            </a>
            <Link
              href="/Marketing/pricing"
              style={{ color: "#cbd5e1", textDecoration: "none", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#cbd5e1")}
            >
              Pricing
            </Link>
          </nav>

          {/* Action CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {session ? (
              <Link
                href="/dashboard"
                style={{
                  padding: "8px 18px",
                  borderRadius: "6px",
                  backgroundColor: "#0284c7",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0369a1")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0284c7")}
              >
                Go to Dashboard
                <Icon name="chevron-right" size={14} />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  style={{
                    padding: "8px 14px",
                    color: "#cbd5e1",
                    fontSize: "13px",
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#cbd5e1")}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0369a1")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0284c7")}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: "90px 32px 80px",
          textAlign: "center",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 14px",
            borderRadius: "20px",
            backgroundColor: "rgba(56, 189, 248, 0.1)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            color: "#38bdf8",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#38bdf8",
            }}
          />
          Autonomous Business Operations Platform
        </div>

        <h1
          style={{
            fontSize: "52px",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            margin: "0 auto 20px",
            maxWidth: "850px",
          }}
        >
          Operate your entire business on an intelligent autonomous pipeline.
        </h1>

        <p
          style={{
            fontSize: "18px",
            lineHeight: 1.6,
            color: "#94a3b8",
            maxWidth: "680px",
            margin: "0 auto 36px",
          }}
        >
          Autozip coordinates inbound lead ingress, multi-model AI evaluation, deterministic
          workflow dispatch, and context-aware CRM operations in real time.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
          <Link
            href="/auth/register"
            style={{
              padding: "12px 28px",
              borderRadius: "8px",
              backgroundColor: "#0284c7",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 10px 25px rgba(2, 132, 199, 0.35)",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0369a1")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0284c7")}
          >
            Launch Free Workspace
            <Icon name="chevron-right" size={16} />
          </Link>

          <Link
            href="/dashboard"
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#e2e8f0",
              fontSize: "15px",
              fontWeight: 500,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)")
            }
          >
            <Icon name="dashboard" size={16} />
            Live Console
          </Link>
        </div>
      </section>

      {/* Interactive App Preview Banner */}
      <section
        id="features"
        style={{
          maxWidth: "1160px",
          margin: "0 auto 80px",
          padding: "0 32px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            backgroundColor: "#0e2439",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Tab Navigation header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#071726",
              padding: "12px 20px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ display: "flex", gap: "6px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#f59e0b",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {(["crm", "automations", "ai"] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      border: "none",
                      backgroundColor: isActive ? "#0284c7" : "transparent",
                      color: isActive ? "#ffffff" : "#94a3b8",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "5px 14px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab === "crm"
                      ? "Lead Ingress & CRM"
                      : tab === "automations"
                      ? "Workflow Engine"
                      : "AI Business Co-Pilot"}
                  </button>
                );
              })}
            </div>

            <span style={{ fontSize: "11px", color: "#64748b" }}>Live Node Telemetry</span>
          </div>

          {/* Interactive Screen Preview */}
          <div style={{ padding: "40px" }}>
            {activeTab === "crm" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "24px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    padding: "24px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon name="events" size={20} style={{ color: "#38bdf8" }} />
                    <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                      Automated Lead Intake
                    </h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "12px" }}>
                    Capture leads via WhatsApp API, custom webhook endpoints, or in-app forms with
                    zero drop-off.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    padding: "24px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon name="award" size={20} style={{ color: "#10b981" }} />
                    <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                      AI Lead Scoring (0-100)
                    </h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "12px" }}>
                    Every submission is analyzed against your commercial criteria, categorizing
                    priority tiers instantly.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    padding: "24px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon name="groups" size={20} style={{ color: "#a855f7" }} />
                    <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                      Directory & Profiles
                    </h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "12px" }}>
                    Centralized records with full interaction timelines, contact channels, and
                    account status.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "automations" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "24px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    padding: "24px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon name="automation" size={20} style={{ color: "#38bdf8" }} />
                    <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                      Event-Driven Triggers
                    </h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "12px" }}>
                    Trigger rules automatically on events like <code>new_lead</code>,{" "}
                    <code>lead_qualified</code>, or <code>stalled_deal</code>.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    padding: "24px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon name="mail" size={20} style={{ color: "#10b981" }} />
                    <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                      Transactional Mail & Alerts
                    </h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "12px" }}>
                    Generate personalized emails with dynamic context variables via Resend API
                    seamlessly.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    padding: "24px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon name="history" size={20} style={{ color: "#a855f7" }} />
                    <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                      Deterministic History
                    </h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "12px" }}>
                    Every trigger execution is recorded with millisecond duration, payload, and
                    exit status in PostgreSQL.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "24px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    padding: "24px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon name="chat" size={20} style={{ color: "#38bdf8" }} />
                    <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                      Live Business Context
                    </h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "12px" }}>
                    Autozip AI reads your active leads, customer profiles, and automation metrics to
                    give grounded advice.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    padding: "24px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon name="zap" size={20} style={{ color: "#10b981" }} />
                    <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                      Sub-Second Inference
                    </h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "12px" }}>
                    Powered by high-throughput Groq LPU inference with automatic Neon AI Gateway
                    fallbacks.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    padding: "24px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon name="code" size={20} style={{ color: "#a855f7" }} />
                    <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                      Zero Configuration Required
                    </h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "12px" }}>
                    Out-of-the-box knowledge prompts already understand SaaS operations and lead
                    qualification best practices.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Telemetry Metrics ribbon */}
      <section
        id="telemetry"
        style={{
          backgroundColor: "#071726",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "50px 32px",
        }}
      >
        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "32px",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "#38bdf8" }}>
              <Counter target={99} suffix=".99%" />
            </div>
            <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "6px" }}>
              Platform Uptime SLA
            </div>
          </div>

          <div>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "#10b981" }}>
              <Counter target={380} suffix="ms" />
            </div>
            <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "6px" }}>
              Average Pipeline Latency
            </div>
          </div>

          <div>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "#a855f7" }}>
              <Counter target={100} suffix="k+" />
            </div>
            <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "6px" }}>
              Dispatched Actions
            </div>
          </div>

          <div>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "#f59e0b" }}>
              <Counter target={0} suffix=" Config" />
            </div>
            <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "6px" }}>
              Instant Workspace Setup
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "40px 32px 30px",
          maxWidth: "1280px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "4px",
                border: "1.5px solid #38bdf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(56, 189, 248, 0.15)",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  backgroundColor: "#38bdf8",
                  borderRadius: "1px",
                }}
              />
            </div>
            <span style={{ fontWeight: 600, fontSize: "14px", color: "#ffffff" }}>Autozip OS</span>
          </div>

          <div style={{ display: "flex", gap: "24px", fontSize: "13px", color: "#94a3b8" }}>
            <Link
              href="/dashboard"
              style={{ color: "#94a3b8", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
            >
              Dashboard
            </Link>
            <Link
              href="/auth/login"
              style={{ color: "#94a3b8", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
            >
              Sign In
            </Link>
            <Link
              href="/Marketing/pricing"
              style={{ color: "#94a3b8", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
            >
              Pricing
            </Link>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "12px",
            color: "#64748b",
          }}
        >
          <span>Copyright &copy; 2026 Autozip Operations Platform. All rights reserved.</span>
          <span>Designed with zero emojis and clean, accessible telemetry styling.</span>
        </div>
      </footer>
    </div>
  );
}
