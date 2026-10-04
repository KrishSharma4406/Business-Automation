import Link from "next/link";

export default function MarketingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-app)",
        color: "var(--text-primary)",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 40px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: 700 }}>Autozip</span>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link
            href="/Marketing/pricing"
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            Pricing
          </Link>
          <Link
            href="/auth/login"
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--accent)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          padding: "80px 40px",
          textAlign: "center",
          maxWidth: "720px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "40px",
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: "16px",
            color: "var(--text-primary)",
          }}
        >
          AI-Powered Business Operating System
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: "32px",
          }}
        >
          Manage customers, qualify leads, automate conversations, and connect all your tools
          in one unified platform powered by artificial intelligence.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <Link
            href="/auth/register"
            style={{
              padding: "12px 28px",
              borderRadius: "var(--radius-md)",
              background: "var(--accent)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Start Free
          </Link>
          <Link
            href="/Marketing/pricing"
            style={{
              padding: "12px 28px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          padding: "40px 40px 80px",
          maxWidth: "960px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          <FeatureCard
            title="AI Lead Qualification"
            description="Automatically score and qualify incoming leads using AI analysis."
          />
          <FeatureCard
            title="Smart Conversations"
            description="AI-powered customer conversations across email, WhatsApp, and Slack."
          />
          <FeatureCard
            title="Workflow Automation"
            description="Build automated workflows to handle repetitive business tasks."
          />
          <FeatureCard
            title="Customer Management"
            description="Unified view of all customer data, interactions, and history."
          />
          <FeatureCard
            title="Integrations"
            description="Connect Grok, Gmail, Slack, WhatsApp, Stripe, and more."
          />
          <FeatureCard
            title="Analytics"
            description="Real-time insights into your business performance and metrics."
          />
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "24px 40px",
          borderTop: "1px solid var(--border-subtle)",
          textAlign: "center",
          fontSize: "12px",
          color: "var(--text-muted)",
        }}
      >
        Autozip — AI Business OS
      </footer>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
      }}
    >
      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
        {title}
      </p>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
        {description}
      </p>
    </div>
  );
}
