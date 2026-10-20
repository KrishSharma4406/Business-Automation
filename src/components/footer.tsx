"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Footer() {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [timeString, setTimeString] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toUTCString().slice(17, 25) + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCli = () => {
    navigator.clipboard?.writeText("npx autozip@latest connect");
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setSubscribeStatus("error");
      setTimeout(() => setSubscribeStatus("idle"), 3000);
      return;
    }
    setSubscribeStatus("loading");
    setTimeout(() => {
      setSubscribeStatus("success");
      setEmail("");
      setTimeout(() => setSubscribeStatus("idle"), 5000);
    }, 600);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="az-footer">
      {/* ── Top Telemetry & Health Ribbon ── */}
      <div className="az-footer-ribbon">
        <div className="az-footer-ribbon-inner">
          <div className="az-footer-status">
            <span className="az-status-dot-pulse"></span>
            <span className="az-status-text">
              <strong className="az-status-highlight">ALL NODES OPERATIONAL</strong>
              <span className="az-status-divider">::</span>
              <span className="az-status-metric">99.998% UPTIME</span>
              <span className="az-status-divider">::</span>
              <span className="az-status-metric">LATENCY 21ms</span>
              <span className="az-status-divider">::</span>
              <span className="az-status-metric">REGION: AP-SOUTH-1</span>
            </span>
          </div>

          <div className="az-footer-ribbon-actions">
            {timeString && (
              <div className="az-footer-clock" title="Synchronized Local Node Time">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{timeString}</span>
              </div>
            )}

            <div className="az-footer-cli">
              <span className="az-cli-code">$ npx autozip@latest connect</span>
              <button 
                type="button" 
                onClick={handleCopyCli} 
                className={`az-cli-copy-btn ${copied ? "az-cli-copied" : ""}`}
                aria-label="Copy CLI connect command"
              >
                {copied ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Newsletter / Dispatch Broadcast Bar ── */}
      <div className="az-footer-broadcast-wrap">
        <div className="az-footer-broadcast">
          <div className="az-broadcast-info">
            <div className="az-broadcast-tag">INGRESS DISPATCH // DISCORD & CHANGELOG FEED</div>
            <h3 className="az-broadcast-title">Receive system telemetry, new agent blueprints, and protocol updates.</h3>
            <p className="az-broadcast-desc">Deterministic updates only. Zero spam. Directly piped from core repository releases.</p>
          </div>

          <form onSubmit={handleSubscribe} className="az-broadcast-form">
            <div className="az-broadcast-input-group">
              <div className="az-broadcast-prefix">&gt;</div>
              <input
                type="email"
                placeholder="operator@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="az-broadcast-input"
                aria-label="Operator email for system updates"
                disabled={subscribeStatus === "loading" || subscribeStatus === "success"}
              />
              <button 
                type="submit" 
                className="az-broadcast-submit"
                disabled={subscribeStatus === "loading" || subscribeStatus === "success"}
              >
                {subscribeStatus === "loading" ? "CONNECTING..." : subscribeStatus === "success" ? "CONNECTED ✓" : "DISPATCH INGRESS →"}
              </button>
            </div>
            {subscribeStatus === "success" && (
              <div className="az-broadcast-msg az-msg-success">
                ✓ Node subscription confirmed. Operational changelogs will be piped to your terminal.
              </div>
            )}
            {subscribeStatus === "error" && (
              <div className="az-broadcast-msg az-msg-error">
                ! Invalid ingress target. Provide a valid email address.
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── Main Multi-Column Grid ── */}
      <div className="az-footer-main">
        <div className="az-footer-grid">
          {/* Col 1: Identity & Compliance */}
          <div className="az-footer-col az-col-brand">
            <Link href="/" className="az-brand az-footer-brand-logo">
              <span className="az-brand-name">AUTOZIP</span>
              <span className="az-brand-spec">SYS.VER 2.4.8</span>
            </Link>

            <p className="az-footer-about">
              The autonomous business operating system designed for deterministic lead intake, 
              real-time CRM state reconciliation, and multi-channel revenue execution.
            </p>

            <div className="az-footer-trust-chips">
              <span className="az-trust-chip">
                <span className="az-trust-dot"></span> POSTGRES 16 DURABLE
              </span>
              <span className="az-trust-chip">
                <span className="az-trust-dot"></span> SOC-2 TYPE II READY
              </span>
              <span className="az-trust-chip">
                <span className="az-trust-dot"></span> SUB-400MS LATENCY
              </span>
            </div>

            {/* Social Links */}
            <div className="az-footer-socials">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="az-social-link" 
                aria-label="GitHub Repository"
                title="GitHub"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>

              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer" 
                className="az-social-link" 
                aria-label="X Twitter"
                title="X / Twitter"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noreferrer" 
                className="az-social-link" 
                aria-label="Discord Community"
                title="Discord"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>

              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer" 
                className="az-social-link" 
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="az-footer-col">
            <h4 className="az-footer-col-title">
              <span className="az-col-title-prefix">// 01</span> PLATFORM
            </h4>
            <ul className="az-footer-nav-list">
              <li>
                <a href="/#architecture" className="az-footer-nav-link">
                  System Architecture
                  <span className="az-link-badge">v2.4</span>
                </a>
              </li>
              <li>
                <a href="/#engine" className="az-footer-nav-link">
                  Decision State Engine
                </a>
              </li>
              <li>
                <a href="/#specs" className="az-footer-nav-link">
                  System Specifications
                </a>
              </li>
              <li>
                <Link href="/dashboard/integrations" className="az-footer-nav-link">
                  Integration Matrix
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="az-footer-nav-link">
                  Live Telemetry Ledger
                </Link>
              </li>
              <li>
                <Link href="/dashboard/automations" className="az-footer-nav-link">
                  Automation Pipelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Blueprint Workflows */}
          <div className="az-footer-col">
            <h4 className="az-footer-col-title">
              <span className="az-col-title-prefix">// 02</span> BLUEPRINTS
            </h4>
            <ul className="az-footer-nav-list">
              <li>
                <a href="/#engine" className="az-footer-nav-link">
                  WhatsApp Intake &amp; Qualification
                </a>
              </li>
              <li>
                <a href="/#engine" className="az-footer-nav-link">
                  Stalled Deal Auto-Revival
                </a>
              </li>
              <li>
                <a href="/#engine" className="az-footer-nav-link">
                  Enterprise SLA Escalation
                </a>
              </li>
              <li>
                <span className="az-footer-nav-link az-link-muted">
                  Omnichannel Ingress Routing
                </span>
              </li>
              <li>
                <span className="az-footer-nav-link az-link-muted">
                  Deterministic Invoicing Trigger
                </span>
              </li>
              <li>
                <span className="az-footer-nav-link az-link-muted">
                  Custom Webhook Dispatcher
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Developers */}
          <div className="az-footer-col">
            <h4 className="az-footer-col-title">
              <span className="az-col-title-prefix">// 03</span> DEVELOPERS
            </h4>
            <ul className="az-footer-nav-list">
              <li>
                <a href="#specs" className="az-footer-nav-link">
                  REST &amp; Webhook API
                  <span className="az-link-badge az-badge-emerald">LIVE</span>
                </a>
              </li>
              <li>
                <a href="#specs" className="az-footer-nav-link">
                  Postgres 16 Durable Schema
                </a>
              </li>
              <li>
                <Link href="/auth/login" className="az-footer-nav-link">
                  Node Authentication
                </Link>
              </li>
              <li>
                <a href="#faq" className="az-footer-nav-link">
                  Technical Architecture FAQ
                </a>
              </li>
              <li>
                <span className="az-footer-nav-link az-link-muted">
                  Event Schema Registry
                </span>
              </li>
              <li>
                <span className="az-footer-nav-link az-link-muted">
                  TypeScript SDK Reference
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Node / Commercial */}
          <div className="az-footer-col">
            <h4 className="az-footer-col-title">
              <span className="az-col-title-prefix">// 04</span> COMMERCIAL
            </h4>
            <ul className="az-footer-nav-list">
              <li>
                <Link href="/Marketing/pricing" className="az-footer-nav-link">
                  Node Tier Pricing
                  <span className="az-link-badge az-badge-cyan">ZERO TAX</span>
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="az-footer-nav-link">
                  Provision New Workspace
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="az-footer-nav-link">
                  Operator Login
                </Link>
              </li>
              <li>
                <span className="az-footer-nav-link az-link-muted">
                  SOC-2 Security Center
                </span>
              </li>
              <li>
                <span className="az-footer-nav-link az-link-muted">
                  Enterprise SLA Contract
                </span>
              </li>
              <li>
                <span className="az-footer-nav-link az-link-muted">
                  Privacy &amp; Data Isolation
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Sub-Footer / Copyright & Scroll to Top ── */}
      <div className="az-footer-bottom">
        <div className="az-footer-bottom-inner">
          <div className="az-footer-bottom-left">
            <span className="az-footer-copyright">
              © {new Date().getFullYear()} AUTOZIP SYSTEMS INC. ALL RIGHTS RESERVED.
            </span>
            <span className="az-footer-bottom-pipe">|</span>
            <span className="az-footer-tagline">
              DETERMINISTIC BUSINESS OPERATING SYSTEM
            </span>
            <span className="az-footer-bottom-pipe">|</span>
            <span className="az-footer-hash" title="Release Commit SHA">
              SHA: 7F29B8A
            </span>
          </div>

          <div className="az-footer-bottom-right">
            <div className="az-footer-legal-links">
              <span className="az-legal-link">PRIVACY</span>
              <span className="az-legal-dot">·</span>
              <span className="az-legal-link">TERMS</span>
              <span className="az-legal-dot">·</span>
              <span className="az-legal-link">SECURITY</span>
              <span className="az-legal-dot">·</span>
              <span className="az-legal-link">TELEMETRY</span>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="az-footer-top-btn"
              title="Return to top of page"
            >
              <span>TOP</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Giant Architectural Watermark ── */}
      <div className="az-footer-watermark" aria-hidden="true">
        <span>AUTOZIP</span>
      </div>
    </footer>
  );
}
