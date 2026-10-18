import Link from "next/link";
import "@/src/app/landing.css";

export default function PricingPage() {
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
            <li><Link href="/#architecture" className="az-nav-link">Architecture</Link></li>
            <li><Link href="/#engine" className="az-nav-link">Engine</Link></li>
            <li><Link href="/#specs" className="az-nav-link">Specifications</Link></li>
            <li><Link href="/#faq" className="az-nav-link">FAQ</Link></li>
          </ul>

          <div className="az-nav-actions">
            <Link href="/auth/login" className="az-btn-secondary">
              Sign in
            </Link>
            <Link href="/auth/register" className="az-btn-primary">
              Launch Node
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HEADER ── */}
      <section className="az-hero" style={{ paddingBottom: "48px" }}>
        <div className="az-hero-container">
          <div className="az-hero-meta">
            <span className="az-tag az-tag-emerald">
              <span className="az-status-dot" />
              INFRASTRUCTURE PRICING
            </span>
            <span className="az-tag">TRANSPARENT SPECIFICATIONS</span>
          </div>

          <h1 className="az-hero-title" style={{ maxWidth: "840px" }}>
            Predictable node pricing. Zero per-seat taxation.
          </h1>

          <p className="az-hero-lead" style={{ maxWidth: "680px" }}>
            We charge based on system throughput and database capacity, not by how many
            operators you have on your team. Scale leads without ballooning software costs.
          </p>
        </div>
      </section>

      {/* ── PRICING NODES SECTION ── */}
      <section className="az-section">
        <div className="az-container">
          <div className="az-pricing-nodes-grid">
            
            {/* Tier 1: Developer Node */}
            <div className="az-node-card">
              <div>
                <div className="az-node-head">
                  <span className="az-tag">NODE TIER // 01</span>
                  <h2 className="az-node-name">Starter Node</h2>
                  <p className="az-node-desc">
                    For boutique businesses, early ventures, and technical validation.
                  </p>
                </div>

                <div className="az-node-price">
                  ₹0 <span>/ forever free</span>
                </div>

                <ul className="az-node-specs">
                  <li className="az-node-spec-item">
                    <span className="az-node-spec-dot" />
                    <span>Up to 150 leads captured / month</span>
                  </li>
                  <li className="az-node-spec-item">
                    <span className="az-node-spec-dot" />
                    <span>WhatsApp Cloud API webhook sync</span>
                  </li>
                  <li className="az-node-spec-item">
                    <span className="az-node-spec-dot" />
                    <span>Sub-400ms AI lead qualification</span>
                  </li>
                  <li className="az-node-spec-item">
                    <span className="az-node-spec-dot" />
                    <span>Shared Neon PostgreSQL cluster</span>
                  </li>
                  <li className="az-node-spec-item">
                    <span className="az-node-spec-dot" />
                    <span>3 active automation pipelines</span>
                  </li>
                </ul>
              </div>

              <div>
                <Link href="/auth/register" className="az-btn-secondary" style={{ display: "block", textAlign: "center", padding: "12px" }}>
                  Deploy Free Node
                </Link>
              </div>
            </div>

            {/* Tier 2: Production Node */}
            <div className="az-node-card highlighted">
              <div>
                <div className="az-node-head">
                  <span className="az-tag az-tag-emerald">NODE TIER // 02 [RECOMMENDED]</span>
                  <h2 className="az-node-name">Production Cluster</h2>
                  <p className="az-node-desc">
                    For high-volume operations, established medical/aesthetic clinics, and scaling B2B agencies.
                  </p>
                </div>

                <div className="az-node-price">
                  ₹1,999 <span>/ month (unlimited seats)</span>
                </div>

                <ul className="az-node-specs">
                  <li className="az-node-spec-item">
                    <span className="az-node-spec-dot" />
                    <span>Unlimited lead ingestion &amp; routing</span>
                  </li>
                  <li className="az-node-spec-item">
                    <span className="az-node-spec-dot" />
                    <span>Priority Groq low-latency inference model</span>
                  </li>
                  <li className="az-node-spec-item">
                    <span className="az-node-spec-dot" />
                    <span>WhatsApp, Email, Web, and Slack channels</span>
                  </li>
                  <li className="az-node-spec-item">
                    <span className="az-node-spec-dot" />
                    <span>Stalled deal automated re-engagement engine</span>
                  </li>
                  <li className="az-node-spec-item">
                    <span className="az-node-spec-dot" />
                    <span>Dedicated Neon connection pool &amp; backup</span>
                  </li>
                  <li className="az-node-spec-item">
                    <span className="az-node-spec-dot" />
                    <span>Direct engineering SLA &amp; setup assistance</span>
                  </li>
                </ul>
              </div>

              <div>
                <Link href="/auth/register" className="az-btn-primary" style={{ display: "block", textAlign: "center", padding: "12px" }}>
                  Deploy Production Cluster
                </Link>
              </div>
            </div>

          </div>

          {/* ── TECHNICAL COMPARISON TABLE ── */}
          <div className="az-section-header" style={{ marginTop: "40px" }}>
            <span className="az-tag">Feature Audit</span>
            <h2 className="az-section-title">Complete technical feature breakdown.</h2>
          </div>

          <div className="az-specs-table-wrapper">
            <table className="az-specs-table">
              <thead>
                <tr>
                  <th>Platform Capability</th>
                  <th>Starter Node</th>
                  <th>Production Cluster</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="spec-name">Inbound Channel Webhooks</td>
                  <td className="spec-legacy">WhatsApp + Web</td>
                  <td className="spec-autozip">WhatsApp + Email + Webhooks + Slack</td>
                </tr>
                <tr>
                  <td className="spec-name">AI Scoring &amp; Summary Model</td>
                  <td className="spec-legacy">Standard Groq Llama-3</td>
                  <td className="spec-autozip">Dedicated Low-Latency Engine</td>
                </tr>
                <tr>
                  <td className="spec-name">Concurrent Pipeline Triggers</td>
                  <td className="spec-legacy">3 Active Rules</td>
                  <td className="spec-autozip">Unlimited Deterministic Pipelines</td>
                </tr>
                <tr>
                  <td className="spec-name">Database Storage &amp; Isolation</td>
                  <td className="spec-legacy">Neon Shared Partition</td>
                  <td className="spec-autozip">Neon High-Availability Dedicated Pool</td>
                </tr>
                <tr>
                  <td className="spec-name">Team Seat Allowance</td>
                  <td className="spec-legacy">Unlimited Operators</td>
                  <td className="spec-autozip">Unlimited Operators (Zero Seat Tax)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="az-footer">
        <div className="az-footer-inner">
          <div className="az-footer-brand">
            <span className="az-brand-name">AUTOZIP</span>
            <span className="az-footer-copy">Autonomous Business OS. All systems nominal.</span>
          </div>

          <div className="az-footer-links">
            <Link href="/" className="az-footer-link">Home</Link>
            <Link href="/#architecture" className="az-footer-link">Architecture</Link>
            <Link href="/#engine" className="az-footer-link">Engine</Link>
            <Link href="/auth/login" className="az-footer-link">Node Login</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
