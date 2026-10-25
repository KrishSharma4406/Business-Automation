"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Footer from "@/src/components/footer";
import "./landing.css";

/* ==========================================================================
   FAQ ACCORDION COMPONENT
   ========================================================================== */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="az-faq-item">
      <button
        type="button"
        className="az-faq-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <span className="az-faq-toggle-char">{open ? "[-]" : "[+]"}</span>
      </button>
      {open && <div className="az-faq-answer">{answer}</div>}
    </div>
  );
}

/* ==========================================================================
   ANIMATED NUMBER COUNTER COMPONENT
   ========================================================================== */
function Counter({ target, suffix = "", duration = 1400 }: { target: number; suffix?: string; duration?: number }) {
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

  return <span>{val}{suffix}</span>;
}


/* ==========================================================================
   BLUEPRINTS DATA
   ========================================================================== */
const BLUEPRINTS = [
  {
    id: "rule-1",
    tag: "RULE 01 // INTAKE",
    channel: "Channel: WhatsApp",
    name: "Instant Lead Qualification & Booking",
    desc: "Triggers immediately upon receiving an unsolicited WhatsApp message from a prospective customer. Evaluates commercial viability and issues an instant scheduling link.",
    code: `{
  "trigger": "new_lead",
  "filter": {
    "channel": "whatsapp",
    "minScore": 80,
    "intent": "service_consultation"
  },
  "action": [
    "ai_qualify_lead",
    "send_whatsapp_response",
    "notify_workspace_owner"
  ]
}`
  },
  {
    id: "rule-2",
    tag: "RULE 02 // RE-ENGAGE",
    channel: "Channel: Omnichannel",
    name: "Stalled Deal Automatic Revival",
    desc: "Monitors pipeline records in Neon PostgreSQL. If a qualified lead remains dormant for 48 hours without a closing event, crafts a tailored follow-up based on prior context.",
    code: `{
  "trigger": "lead_stalled",
  "filter": {
    "dormantHours": 48,
    "stage": "quote_sent",
    "status": "pending"
  },
  "action": [
    "generate_contextual_followup",
    "dispatch_preferred_channel",
    "create_owner_reminder_task"
  ]
}`
  },
  {
    id: "rule-3",
    tag: "RULE 03 // ESCALATION",
    channel: "Channel: Emergency Queue",
    name: "High-Value Enterprise Alert & Hand-off",
    desc: "Detects enterprise-tier signals (50+ seats, custom SLA requests, urgent timeline) and immediately locks operator priority with dual SMS and webhook notification.",
    code: `{
  "trigger": "lead_qualified",
  "filter": {
    "aiScore": { "$gte": 92 },
    "tier": "enterprise",
    "budgetVerified": true
  },
  "action": [
    "lock_priority_thread",
    "dispatch_owner_sms",
    "emit_webhook_sales_core"
  ]
}`
  }
];

/* ==========================================================================
   DEFAULT LEDGER ITEMS
   ========================================================================== */
interface LedgerItem {
  id: string;
  source: string;
  time: string;
  body: string;
  scoreText: string;
  actionText: string;
}

const INITIAL_LEDGER: LedgerItem[] = [
  {
    id: "l-1",
    source: "WhatsApp :: +91 98402 11982",
    time: "12:04:18.420",
    body: "Need quotation for 50-seat automation deployment with custom CRM hook.",
    scoreText: "AI Score: 94/100 [High Intent]",
    actionText: "Action: Sent schedule_consultation template"
  },
  {
    id: "l-2",
    source: "Web Ingress :: elena.vance@enterprise.io",
    time: "12:03:52.110",
    body: "Looking to replace fragmented Zapier workflows with unified state machine.",
    scoreText: "AI Score: 89/100 [Enterprise Qualified]",
    actionText: "Action: Dispatched owner SMS & logged Neon DB"
  },
  {
    id: "l-3",
    source: "Email :: contact@apexlogistics.com",
    time: "12:02:14.882",
    body: "Inquiry regarding dispatch tracking API and SLA guarantees.",
    scoreText: "AI Score: 86/100 [Direct Inquiry]",
    actionText: "Action: Generated contextual technical reply"
  }
];

/* ==========================================================================
   TICKER PHRASES (Marquee Stream)
   ========================================================================== */
const TICKER_ITEMS = [
  "SYSTEMS OVER HEADCOUNT",
  "FROM FRICTION TO SCALABLE CODE",
  "DETERMINISTIC WORKFLOWS",
  "REAL-TIME BUSINESS SYNC",
  "HIGH-RELIABILITY ENGINEERING",
  "REPEATABLE REVENUE ARCHITECTURE",
  "CAPTURE EVERY LEAD",
  "ELIMINATE OPERATIONAL FRICTION",
  "ZERO-LOSS EXECUTION",
  "SUB-400MS INTENT INFERENCE",
  "ATOMIC POSTGRES PERSISTENCE"
];


/* ==========================================================================
   MAIN LANDING PAGE
   ========================================================================== */
export default function LandingPage() {
  const { data: session } = useSession();
  const [activeBlueprint, setActiveBlueprint] = useState(0);
  const [ledger, setLedger] = useState<LedgerItem[]>(INITIAL_LEDGER);
  const [requestCount, setRequestCount] = useState(148);

  const userName = session?.user?.name || "Operator";
  const userInitials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("az-revealed");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".az-reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Continuous background telemetry heartbeat
  useEffect(() => {
    const backgroundEvents: LedgerItem[] = [
      {
        id: "bg-1",
        source: "WhatsApp :: +91 94210 88712",
        time: "",
        body: "Checking availability for automated dental clinic reminders and WhatsApp intake.",
        scoreText: "AI Score: 95/100 [High Intent]",
        actionText: "Action: Locked appointment slot in Google Calendar"
      },
      {
        id: "bg-2",
        source: "Inbound Webhook :: billing.event/quote-v2",
        time: "",
        body: "Enterprise lead requested custom SLA and private VPC connection for 50+ staff.",
        scoreText: "AI Score: 98/100 [Enterprise Prime]",
        actionText: "Action: Auto-assigned to Principal Solutions Architect"
      },
      {
        id: "bg-3",
        source: "SMTP Inbound :: procurement@horizontech.in",
        time: "",
        body: "RFP inquiry regarding WhatsApp message volume limits and pricing tier structure.",
        scoreText: "AI Score: 91/100 [Commercial RFP]",
        actionText: "Action: Dispatched volume tier matrix PDF"
      }
    ];

    let index = 0;
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;
      
      const item = {
        ...backgroundEvents[index % backgroundEvents.length],
        id: `auto-${Date.now()}`,
        time: timeStr
      };
      index++;

      setLedger((prev) => [item, ...prev.slice(0, 4)]);
      setRequestCount((prev) => prev + 1);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  // Event simulator
  const handleSimulate = (type: "whatsapp" | "webhook" | "email") => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;
    
    let newItem: LedgerItem;

    if (type === "whatsapp") {
      newItem = {
        id: `sim-${Date.now()}`,
        source: `WhatsApp :: +91 99${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
        time: timeStr,
        body: "Can we connect our existing clinic database to WhatsApp automated booking?",
        scoreText: "AI Score: 92/100 [Viable Prospect]",
        actionText: "Action: Issued calendar link & saved contact"
      };
    } else if (type === "webhook") {
      newItem = {
        id: `sim-${Date.now()}`,
        source: "REST Webhook :: api.inbound/lead-v1",
        time: timeStr,
        body: "Inbound form submission: $2,500/mo budget, immediate implementation window.",
        scoreText: "AI Score: 97/100 [High Value]",
        actionText: "Action: Direct routed to senior technical lead"
      };
    } else {
      newItem = {
        id: `sim-${Date.now()}`,
        source: "SMTP Ingress :: operations@northstar.co",
        time: timeStr,
        body: "Request for information regarding multi-tenant data segregation.",
        scoreText: "AI Score: 84/100 [Technical Inquiry]",
        actionText: "Action: Auto-sent Architecture Whitepaper PDF"
      };
    }

    setLedger((prev) => [newItem, ...prev.slice(0, 4)]);
    setRequestCount((prev) => prev + 1);
  };

  return (
    <main className="az-page">

      {/* ── NAVBAR ── */}
      <nav className="az-navbar">
        <div className="az-nav-container">
          <Link href="/" className="az-brand">
            <span className="az-brand-name">AUTOZIP</span>
            <span className="az-brand-spec">SYS.VER 2.4</span>
          </Link>
          
          <ul className="az-nav-menu">
            <li><a href="#architecture" className="az-nav-link">Architecture</a></li>
            <li><a href="#engine" className="az-nav-link">Engine</a></li>
            <li><a href="#specs" className="az-nav-link">Specifications</a></li>
            <li><a href="#faq" className="az-nav-link">FAQ</a></li>
          </ul>

          <div className="az-nav-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "4px 10px 4px 6px",
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid var(--az-border-bright)",
                    borderRadius: "6px",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                  title="Signed In Operator"
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "4px",
                      background: "linear-gradient(135deg, var(--az-emerald), #059669)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--az-font-mono)",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#ffffff",
                    }}
                  >
                    {userInitials}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                    <span
                      style={{
                        fontFamily: "var(--az-font-mono)",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#ffffff",
                        lineHeight: 1.2,
                      }}
                    >
                      {userName}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--az-font-mono)",
                        fontSize: "9px",
                        color: "var(--az-emerald)",
                        lineHeight: 1.2,
                        letterSpacing: "0.05em",
                      }}
                    >
                      ● ACTIVE
                    </span>
                  </div>
                </Link>

                <Link
                  href="/dashboard"
                  className="az-btn-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    fontSize: "12px",
                  }}
                >
                  <span>Dashboard Console</span>
                  <span style={{ color: "var(--az-emerald)" }}>→</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="az-btn-secondary">
                  Sign in
                </Link>
                <Link href="/auth/register" className="az-btn-primary">
                  Launch Node
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="az-hero">
        <div className="az-hero-container">
          <div className="az-hero-meta az-reveal">
            <span className="az-tag az-tag-emerald">
              <span className="az-status-dot" />
              Runtime Active
              <span className="az-cursor-blink">_</span>
            </span>
            <span className="az-tag">Autonomous Business OS</span>
          </div>

          <h1 className="az-hero-title az-reveal">
            Deterministic business operations. Powered by real-time AI.
          </h1>

          <p className="az-hero-lead az-reveal">
            Autozip connects inbound customer channels to event-driven AI pipelines.
            Capture leads, score intent in under 400ms, and execute automated actions
            across WhatsApp, email, and internal workflows.
          </p>

          <div className="az-hero-cta az-reveal">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="az-btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>Open Dashboard Console</span>
                <span style={{ color: "var(--az-emerald)" }}>→</span>
              </Link>
            ) : (
              <Link href="/auth/register" className="az-btn-primary">
                Launch Your Node
              </Link>
            )}
            <a href="#architecture" className="az-btn-secondary">
              Inspect Architecture
            </a>
          </div>

          {/* ── LIVE OPERATIONAL CONSOLE ── */}
          <div className="az-console az-reveal">
            <div className="az-console-topbar">
              <div className="az-scanline-bar" />
              <div className="az-console-status">
                <span className="az-status-dot" />
                <span>NODE: US-EAST-CORE // STATUS: ACTIVE</span>
              </div>
              <div className="az-console-telemetry">
                <span>INGRESS RATE: <strong>{(requestCount / 10).toFixed(1)} req/s</strong></span>
                <span>INFERENCE ENGINE: <strong>GROQ LP-70B</strong></span>
                <span>STORAGE: <strong>NEON POSTGRES</strong></span>
              </div>
            </div>

            <div className="az-console-grid">
              {/* Column 1: Active Ingestion Streams */}
              <div className="az-console-col">
                <div className="az-col-title">
                  <span>Ingress Channels</span>
                  <span>[4 ONLINE]</span>
                </div>
                <div className="az-stream-list">
                  <div className="az-stream-item">
                    <div className="az-stream-head">
                      <span>WhatsApp Cloud API</span>
                      <span className="az-tag az-tag-emerald">200 OK</span>
                    </div>
                    <div className="az-stream-detail">Session Sync: Sub-second webhook</div>
                  </div>
                  <div className="az-stream-item">
                    <div className="az-stream-head">
                      <span>Resend Inbound SMTP</span>
                      <span className="az-tag az-tag-emerald">Active</span>
                    </div>
                    <div className="az-stream-detail">Parser: Multi-part MIME extractor</div>
                  </div>
                  <div className="az-stream-item">
                    <div className="az-stream-head">
                      <span>REST Lead Endpoint</span>
                      <span className="az-tag az-tag-emerald">Listening</span>
                    </div>
                    <div className="az-stream-detail">Schema: Zod-validated payload</div>
                  </div>
                  <div className="az-stream-item">
                    <div className="az-stream-head">
                      <span>Neon Transaction Bus</span>
                      <span className="az-tag az-tag-emerald">Pooled</span>
                    </div>
                    <div className="az-stream-detail">Latency: 12ms round-trip</div>
                  </div>
                </div>
              </div>

              {/* Column 2: Live Activity Ledger with Interactive Test Buttons */}
              <div className="az-console-col">
                <div className="az-col-title">
                  <span>Runtime Activity Ledger</span>
                  <span>[LIVE STREAM]</span>
                </div>

                {/* Interactive Simulator Bar */}
                <div className="az-sim-controls">
                  <button
                    type="button"
                    className="az-sim-btn"
                    onClick={() => handleSimulate("whatsapp")}
                  >
                    + Test WhatsApp
                  </button>
                  <button
                    type="button"
                    className="az-sim-btn"
                    onClick={() => handleSimulate("webhook")}
                  >
                    + Test Webhook
                  </button>
                  <button
                    type="button"
                    className="az-sim-btn"
                    onClick={() => handleSimulate("email")}
                  >
                    + Test Email
                  </button>
                </div>

                <div className="az-ledger-rows">
                  {ledger.map((item) => (
                    <div key={item.id} className="az-ledger-row">
                      <div className="az-ledger-meta">
                        <span className="az-ledger-source">{item.source}</span>
                        <span className="az-ledger-time">{item.time}</span>
                      </div>
                      <div className="az-ledger-body">
                        &quot;{item.body}&quot;
                      </div>
                      <div className="az-ledger-dispatch">
                        <span>{item.scoreText}</span>
                        <span>{item.actionText}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Realtime Engine Parameters */}
              <div className="az-console-col">
                <div className="az-col-title">
                  <span>Engine Telemetry</span>
                  <span>[GLOBAL]</span>
                </div>
                <div className="az-stat-stack">
                  <div className="az-param-box">
                    <div className="az-param-label">Inference Latency</div>
                    <div className="az-param-value">340ms</div>
                    <div className="az-param-sub">Zero-queue edge processing</div>
                  </div>

                  <div className="az-param-box">
                    <div className="az-param-label">Execution Reliability</div>
                    <div className="az-param-value">99.98%</div>
                    <div className="az-param-sub">Deterministic state transitions</div>
                  </div>

                  <div className="az-param-box">
                    <div className="az-param-label">Processed Inquiries</div>
                    <div className="az-param-value">{requestCount * 8}</div>
                    <div className="az-param-sub">Durable PostgreSQL write-ahead</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── METRIC STRIP ── */}
      <div className="az-metric-strip az-reveal">
        <div className="az-metric-grid">
          <div className="az-metric-cell">
            <div className="az-metric-val"><Counter target={340} suffix="ms" /></div>
            <div className="az-metric-label">Average AI Classification &amp; Intent Latency</div>
          </div>
          <div className="az-metric-cell">
            <div className="az-metric-val"><Counter target={100} suffix="%" /></div>
            <div className="az-metric-label">Audit Trail &amp; Database State Persistence</div>
          </div>
          <div className="az-metric-cell">
            <div className="az-metric-val"><Counter target={4} suffix=" Channels" /></div>
            <div className="az-metric-label">Unified Synchronous Ingestion Protocols</div>
          </div>
          <div className="az-metric-cell">
            <div className="az-metric-val">Zero</div>
            <div className="az-metric-label">Manual Data Entry or Spreadsheets Required</div>
          </div>
        </div>
      </div>

      {/* ── CONTINUOUS MARQUEE TICKER (Right-to-Left Sliding Bar) ── */}
      <div className="az-ticker" aria-hidden="true">
        <div className="az-ticker-fade-l" />
        <div className="az-ticker-fade-r" />
        <div className="az-ticker-track">
          {[1, 2].map((setIndex) => (
            <div key={`ticker-set-${setIndex}`} className="az-ticker-group">
              {TICKER_ITEMS.map((item, idx) => (
                <span
                  key={`item-${setIndex}-${idx}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: "36px" }}
                >
                  <span className="az-ticker-item">{item}</span>
                  <span className="az-ticker-dot" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── ARCHITECTURE SECTION ── */}
      <section id="architecture" className="az-section">
        <div className="az-container">
          <div className="az-section-header az-reveal">
            <span className="az-tag">System Topology</span>
            <h2 className="az-section-title">Engineered as an operating system. Not a marketing toy.</h2>
            <p className="az-section-desc">
              Autozip operates as an infrastructure layer directly above your database and communication channels,
              enforcing predictable state machines across every business touchpoint.
            </p>
          </div>

          <div className="az-arch-grid">
            {/* Left: 4 Primitives */}
            <div className="az-arch-list az-reveal">
              <div className="az-arch-card">
                <div className="az-arch-number">PRIMITIVE 01</div>
                <h3 className="az-arch-heading">Omnichannel Ingress Layer</h3>
                <p className="az-arch-body">
                  Normalizes payloads from WhatsApp Business Cloud API, inbound email servers, and custom
                  REST hooks into a single typed Lead Event object within milliseconds.
                </p>
              </div>

              <div className="az-arch-card">
                <div className="az-arch-number">PRIMITIVE 02</div>
                <h3 className="az-arch-heading">Heuristic &amp; LLM Scoring Engine</h3>
                <p className="az-arch-body">
                  Evaluates budget, commercial intent, decision authority, and timeframe using low-latency
                  inference models, generating an objective numerical score from 0 to 100.
                </p>
              </div>

              <div className="az-arch-card">
                <div className="az-arch-number">PRIMITIVE 03</div>
                <h3 className="az-arch-heading">Deterministic Automation Pipeline</h3>
                <p className="az-arch-body">
                  Executes condition-based actions: instant personalized WhatsApp replies, routing to sales
                  specialists, appointment calendar locks, and owner notifications.
                </p>
              </div>

              <div className="az-arch-card">
                <div className="az-arch-number">PRIMITIVE 04</div>
                <h3 className="az-arch-heading">Relational Ledger &amp; Audit Trail</h3>
                <p className="az-arch-body">
                  Every inbound message, generated summary, score, and outbound response is permanently recorded
                  to Neon Serverless PostgreSQL with complete workspace isolation.
                </p>
              </div>
            </div>

            {/* Right: Execution Flow Tree with Signal Animation */}
            <div className="az-flow-box az-reveal">
              <div className="az-flow-title">
                <span>Deterministic Event Pipeline</span>
                <span className="az-tag az-tag-emerald">STREAM ACTIVE</span>
              </div>
              
              <div className="az-flow-step az-flow-step-1">
                <div className="az-flow-step-tag">STAGE 1 // INTAKE</div>
                <div className="az-flow-step-title">Customer Inquiry Ingress</div>
                <div className="az-flow-step-desc">
                  Incoming message captured across WhatsApp or Webhook. Raw message payload parsed into unified schema.
                </div>
              </div>

              <div className="az-flow-connector">|</div>
              <div className="az-flow-connector">v</div>

              <div className="az-flow-step az-flow-step-2">
                <div className="az-flow-step-tag">STAGE 2 // EVALUATION</div>
                <div className="az-flow-step-title">AI Intent &amp; Qualification Inference</div>
                <div className="az-flow-step-desc">
                  Groq LLM extracts commercial intent, urgency rating, and generates numerical score (0-100).
                </div>
              </div>

              <div className="az-flow-connector">|</div>
              <div className="az-flow-connector">v</div>

              <div className="az-flow-step az-flow-step-3">
                <div className="az-flow-step-tag">STAGE 3 // DISPATCH</div>
                <div className="az-flow-step-title">Trigger Execution &amp; Dispatch</div>
                <div className="az-flow-step-desc">
                  Fires automated contextual WhatsApp reply, books calendar slot, and alerts owner on critical deals.
                </div>
              </div>

              <div className="az-flow-connector">|</div>
              <div className="az-flow-connector">v</div>

              <div className="az-flow-step az-flow-step-4">
                <div className="az-flow-step-tag">STAGE 4 // PERSISTENCE</div>
                <div className="az-flow-step-title">Relational State Commit</div>
                <div className="az-flow-step-desc">
                  Atomic write to Neon PostgreSQL tables with full conversation transcript and lead timeline.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ENGINE SECTION (Interactive Blueprint Switcher) ── */}
      <section id="engine" className="az-section">
        <div className="az-container">
          <div className="az-section-header az-reveal">
            <span className="az-tag">Runtime Rules</span>
            <h2 className="az-section-title">Production automation blueprints.</h2>
            <p className="az-section-desc">
              Select an operational rule below to inspect its live trigger, filter condition, and execution actions.
            </p>
          </div>

          <div className="az-blueprint-tabs az-reveal">
            {BLUEPRINTS.map((bp, index) => (
              <button
                key={bp.id}
                type="button"
                className={`az-blueprint-tab-btn ${activeBlueprint === index ? "active" : ""}`}
                onClick={() => setActiveBlueprint(index)}
              >
                {bp.tag}
              </button>
            ))}
          </div>

          <div className="az-blueprint-card az-reveal">
            <div className="az-blueprint-head">
              <span className="az-tag az-tag-emerald">{BLUEPRINTS[activeBlueprint].tag}</span>
              <span className="az-tag">{BLUEPRINTS[activeBlueprint].channel}</span>
            </div>
            <h3 className="az-blueprint-name">{BLUEPRINTS[activeBlueprint].name}</h3>
            <p className="az-blueprint-desc">{BLUEPRINTS[activeBlueprint].desc}</p>

            <pre key={activeBlueprint} className="az-blueprint-code">
              <code>{BLUEPRINTS[activeBlueprint].code}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* ── SPECIFICATIONS SECTION ── */}
      <section id="specs" className="az-section">
        <div className="az-container">
          <div className="az-section-header az-reveal">
            <span className="az-tag">Performance Baseline</span>
            <h2 className="az-section-title">Technical specifications.</h2>
            <p className="az-section-desc">
              Compare standard manual business operations against the Autozip deterministic runtime.
            </p>
          </div>

          <div className="az-specs-table-wrapper az-reveal">
            <table className="az-specs-table">
              <thead>
                <tr>
                  <th>Operational Vector</th>
                  <th>Legacy Manual Operations</th>
                  <th>Autozip Autonomous OS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="spec-name">First Response Latency</td>
                  <td className="spec-legacy">2 to 6 hours (staff schedule dependent)</td>
                  <td className="spec-autozip">&lt; 30 seconds (autonomous edge execution)</td>
                </tr>
                <tr>
                  <td className="spec-name">Inquiry Intake Coverage</td>
                  <td className="spec-legacy">Business hours only (leads lost overnight)</td>
                  <td className="spec-autozip">24/7/365 continuous multi-channel listener</td>
                </tr>
                <tr>
                  <td className="spec-name">Lead Intent &amp; Qualification</td>
                  <td className="spec-legacy">Manual reading, subjective human scoring</td>
                  <td className="spec-autozip">Sub-400ms LLM scoring (0-100 numerical index)</td>
                </tr>
                <tr>
                  <td className="spec-name">Data Persistence Layer</td>
                  <td className="spec-legacy">Ad-hoc spreadsheets, scattered WhatsApp chats</td>
                  <td className="spec-autozip">Neon Serverless PostgreSQL relational database</td>
                </tr>
                <tr>
                  <td className="spec-name">System Integrations</td>
                  <td className="spec-legacy">Fragile third-party webhooks with high failure rates</td>
                  <td className="spec-autozip">Direct native API connections with retry telemetry</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" className="az-section">
        <div className="az-container">
          <div className="az-section-header az-reveal">
            <span className="az-tag">Inquiries</span>
            <h2 className="az-section-title">Frequently asked questions.</h2>
            <p className="az-section-desc">
              Direct answers regarding system architecture, deployment, and data isolation.
            </p>
          </div>

          <div className="az-faq-list az-reveal">
            <FAQItem
              question="What is Autozip and what core problem does it solve?"
              answer="Autozip is an autonomous business operating system that connects your inbound communication channels (WhatsApp, email, web forms) directly to event-driven AI pipelines. It eliminates manual lead copy-pasting, scores inquiries in real time, and automatically triggers customer responses, booking workflows, and internal tasks."
            />
            <FAQItem
              question="How does the WhatsApp integration function?"
              answer="Autozip interfaces directly with the official WhatsApp Business Cloud API. When a prospective customer sends a message to your business number, Autozip ingests the webhook, analyzes intent with low-latency LLMs, drafts a context-aware response, and dispatches it in seconds."
            />
            <FAQItem
              question="Can we configure custom qualification rules and prompt parameters?"
              answer="Yes. Each workspace defines its own automation triggers, threshold scores, qualification parameters, and response templates. You maintain complete control over the criteria that mark an inquiry as qualified or trigger team escalation."
            />
            <FAQItem
              question="What happens when an inquiry requires human intervention?"
              answer="Autozip is designed with deterministic fallback thresholds. If an inquiry has ambiguous intent or explicitly requests human assistance, the system flags the lead as 'Needs Review', notifies the workspace owner via email or Slack, and locks the thread for manual operator takeover."
            />
            <FAQItem
              question="How is database data separated and secured?"
              answer="All business records, leads, conversations, and automation configurations are strictly segregated using multi-tenant workspace identifiers in our Neon Serverless PostgreSQL instance with encrypted connection pooling."
            />
          </div>
        </div>
      </section>

      {/* ── DEPLOYMENT TERMINAL / FINAL ACCESSION ── */}
      <section className="az-section az-reveal" style={{ borderBottom: "none" }}>
        <div className="az-container">
          <div className="az-cta-box">
            <span className="az-tag az-tag-emerald">Deployment Ready</span>
            <h2 className="az-cta-title">Initialize your autonomous business runtime.</h2>
            <p className="az-cta-desc">
              Cut manual coordination. Capture every opportunity with deterministic,
              real-time AI workflows built directly on production-grade infrastructure.
            </p>
            <div className="az-cta-actions">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="az-btn-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>Open Dashboard Console</span>
                  <span style={{ color: "var(--az-emerald)" }}>→</span>
                </Link>
              ) : (
                <>
                  <Link href="/auth/register" className="az-btn-primary">
                    Create Workspace
                  </Link>
                  <Link href="/auth/login" className="az-btn-secondary">
                    Sign in to Existing Node
                  </Link>
                </>
              )}
            </div>
            <div className="az-cta-badges">
              <span className="az-cta-badge">Postgres 16 Durable Storage</span>
              <span className="az-cta-badge">::</span>
              <span className="az-cta-badge">Zero Dependency Ingress</span>
              <span className="az-cta-badge">::</span>
              <span className="az-cta-badge">Instant Workspace Provisioning</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />

    </main>
  );
}
