import Link from "next/link";

export default function PricingPage() {
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
        <Link href="/Marketing" style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", textDecoration: "none" }}>
          Autozip
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
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

      {/* Header */}
      <section
        style={{
          padding: "60px 40px 40px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 800,
            marginBottom: "10px",
          }}
        >
          Pricing
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Simple, transparent pricing for teams of all sizes.
        </p>
      </section>

      {/* Plans */}
      <section
        style={{
          padding: "0 40px 80px",
          maxWidth: "960px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        <PlanCard
          name="Starter"
          price="Free"
          description="For individuals getting started"
          features={[
            "Up to 100 customers",
            "50 AI lead qualifications/mo",
            "Email conversations",
            "2 integrations",
          ]}
          cta="Get Started"
          highlighted={false}
        />
        <PlanCard
          name="Pro"
          price="$49/mo"
          description="For growing businesses"
          features={[
            "Unlimited customers",
            "500 AI lead qualifications/mo",
            "All conversation channels",
            "All integrations",
            "Workflow automation",
            "Priority support",
          ]}
          cta="Start Free Trial"
          highlighted={true}
        />
        <PlanCard
          name="Enterprise"
          price="Custom"
          description="For large organizations"
          features={[
            "Everything in Pro",
            "Unlimited AI qualifications",
            "Custom integrations",
            "Dedicated account manager",
            "SLA guarantee",
            "On-premise option",
          ]}
          cta="Contact Sales"
          highlighted={false}
        />
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

function PlanCard({
  name,
  price,
  description,
  features,
  cta,
  highlighted,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${highlighted ? "var(--accent)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
        {name}
      </p>
      <p style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
        {price}
      </p>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>
        {description}
      </p>

      <div style={{ flex: 1, marginBottom: "20px" }}>
        {features.map((feature) => (
          <div
            key={feature}
            style={{
              padding: "6px 0",
              fontSize: "13px",
              color: "var(--text-secondary)",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            {feature}
          </div>
        ))}
      </div>

      <Link
        href="/auth/register"
        style={{
          display: "block",
          textAlign: "center",
          padding: "10px",
          borderRadius: "var(--radius-md)",
          background: highlighted ? "var(--accent)" : "transparent",
          border: highlighted ? "none" : "1px solid var(--border-default)",
          color: highlighted ? "#fff" : "var(--text-secondary)",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        {cta}
      </Link>
    </div>
  );
}
