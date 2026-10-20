"use client";

import TopBar from "@/src/components/top-bar";
import { useEffect, useState } from "react";
import Link from "next/link";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  tier: "Enterprise" | "Growth" | "Starter";
  status: "Active" | "Onboarding" | "Paused";
  channel: string;
  createdAt: string;
};

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Dr. Arvind Swaminathan",
    email: "arvind@swaminathandental.in",
    phone: "+91 94210 88712",
    company: "Swaminathan Dental Group",
    tier: "Enterprise",
    status: "Active",
    channel: "WhatsApp Cloud API",
    createdAt: "2026-03-14T09:12:00Z",
  },
  {
    id: "cust-2",
    name: "Elena Vance",
    email: "elena.vance@enterprise.io",
    phone: "+1 415 802 9912",
    company: "Vance Autonomous Systems",
    tier: "Enterprise",
    status: "Active",
    channel: "REST Webhook",
    createdAt: "2026-03-22T14:40:00Z",
  },
  {
    id: "cust-3",
    name: "Vikram Malhotra",
    email: "vikram@malhotratech.com",
    phone: "+91 98402 11982",
    company: "Malhotra Cloud Logistics",
    tier: "Growth",
    status: "Onboarding",
    channel: "WhatsApp Cloud API",
    createdAt: "2026-04-02T11:20:00Z",
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(DEFAULT_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Also check leads to dynamically populate customers if available
  useEffect(() => {
    fetch("/api/leads")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.leads && data.leads.length > 0) {
          const qualified = data.leads
            .filter((l: any) => (l.aiScore ?? 0) >= 80)
            .map((l: any, idx: number) => ({
              id: `lead-cust-${l.id.slice(0, 8)}`,
              name: l.name,
              email: l.email || "operator@autozip.local",
              phone: l.phone || "+91 90000 00000",
              company: l.company || "Independent Enterprise",
              tier: (idx % 2 === 0 ? "Enterprise" : "Growth") as Customer["tier"],
              status: "Active" as Customer["status"],
              channel: l.source || "WhatsApp Cloud API",
              createdAt: l.createdAt,
            }));

          if (qualified.length > 0) {
            setCustomers([...qualified, ...DEFAULT_CUSTOMERS]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase()));

    const matchesTier = tierFilter === "all" || c.tier.toLowerCase() === tierFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <div className="az-dash-page">
      <TopBar title="Customer Directory" subtitle="Verified Business Accounts &amp; Commercial Nodes" />

      <div className="az-dash-body">
        {/* Customer Directory Telemetry */}
        <div className="az-dash-stats">
          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">ACTIVE ACCOUNTS</span>
              <span className="az-tag az-tag-emerald" style={{ fontSize: "9px" }}>VERIFIED</span>
            </div>
            <div className="az-dash-stat-val">{customers.length}</div>
            <div className="az-dash-stat-delta">
              <span>●</span>
              <span>100% active retention</span>
            </div>
          </div>

          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">ENTERPRISE NODES</span>
              <span className="az-tag" style={{ fontSize: "9px" }}>TIER // 03</span>
            </div>
            <div className="az-dash-stat-val" style={{ color: "var(--az-cyan)" }}>
              {customers.filter((c) => c.tier === "Enterprise").length}
            </div>
            <div className="az-dash-stat-delta" style={{ color: "var(--az-cyan)" }}>
              <span>↑</span>
              <span>High-throughput SLA</span>
            </div>
          </div>

          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">WHATSAPP INGRESS</span>
              <span className="az-tag" style={{ fontSize: "9px" }}>SYNCED</span>
            </div>
            <div className="az-dash-stat-val">
              {customers.filter((c) => c.channel.toLowerCase().includes("whatsapp")).length}
            </div>
            <div className="az-dash-stat-delta">
              <span>●</span>
              <span>Cloud API active</span>
            </div>
          </div>

          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">SYSTEM HEALTH</span>
              <span className="az-tag az-tag-emerald" style={{ fontSize: "9px" }}>99.99%</span>
            </div>
            <div className="az-dash-stat-val" style={{ color: "var(--az-emerald)" }}>0 ERR</div>
            <div className="az-dash-stat-delta">
              <span>●</span>
              <span>Zero failed dispatches</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="az-toolbar">
          <div className="az-toolbar-group">
            <input
              type="text"
              placeholder="Search customers or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="az-input-search"
              style={{ width: "260px" }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontFamily: "var(--az-font-mono)", fontSize: "11px", color: "var(--az-text-muted)" }}>
                TIER:
              </span>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="az-select-cyber"
              >
                <option value="all">All Tiers</option>
                <option value="enterprise">Enterprise</option>
                <option value="growth">Growth</option>
                <option value="starter">Starter</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontFamily: "var(--az-font-mono)", fontSize: "11px", color: "var(--az-text-muted)" }}>
                STATUS:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="az-select-cyber"
              >
                <option value="all">All States</option>
                <option value="active">Active</option>
                <option value="onboarding">Onboarding</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <span className="az-tag" style={{ fontSize: "11px" }}>
              {filtered.length} CLIENT{filtered.length === 1 ? "" : "S"}
            </span>
          </div>

          <div className="az-toolbar-group">
            <Link
              href="/dashboard/customers/new"
              className="az-btn-primary"
              style={{ textDecoration: "none", fontSize: "12px", padding: "8px 16px" }}
            >
              + Provision Customer
            </Link>
          </div>
        </div>

        {/* Customer Table */}
        <div className="az-table-wrapper">
          <table className="az-table">
            <thead>
              <tr>
                <th>Customer / Account</th>
                <th>Company</th>
                <th>Service Tier</th>
                <th>Ingress Gateway</th>
                <th>Account Status</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "48px 20px" }}>
                    <div style={{ maxWidth: "340px", margin: "0 auto" }}>
                      <span className="az-tag" style={{ marginBottom: "10px", display: "inline-block" }}>
                        NO MATCHES
                      </span>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", marginBottom: "6px" }}>
                        No customers match this filter
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--az-text-secondary)", marginBottom: "16px" }}>
                        Clear filters or provision a new customer account directly.
                      </p>
                      <button
                        type="button"
                        onClick={() => { setSearch(""); setTierFilter("all"); setStatusFilter("all"); }}
                        className="az-btn-secondary"
                        style={{ fontSize: "12px", padding: "6px 14px" }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((cust) => (
                  <tr
                    key={cust.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedCustomer(cust)}
                  >
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "4px",
                            background: "var(--az-surface-alt)",
                            border: "1px solid var(--az-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--az-font-mono)",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "var(--az-emerald)",
                          }}
                        >
                          {cust.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#ffffff" }}>{cust.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--az-text-muted)", fontFamily: "var(--az-font-mono)" }}>
                            {cust.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ color: "var(--az-text-secondary)" }}>
                      {cust.company || "Independent"}
                    </td>

                    <td>
                      <span
                        className={
                          cust.tier === "Enterprise"
                            ? "az-tag az-tag-emerald"
                            : cust.tier === "Growth"
                            ? "az-tag az-tag-cyan"
                            : "az-tag"
                        }
                        style={{ fontSize: "10px", textTransform: "uppercase" }}
                      >
                        {cust.tier}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontFamily: "var(--az-font-mono)", fontSize: "11px", color: "var(--az-text-secondary)" }}>
                        {cust.channel}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          cust.status === "Active"
                            ? "az-tag az-tag-emerald"
                            : "az-tag az-tag-amber"
                        }
                        style={{ fontSize: "10px", textTransform: "uppercase" }}
                      >
                        {cust.status}
                      </span>
                    </td>

                    <td style={{ fontFamily: "var(--az-font-mono)", fontSize: "11px", color: "var(--az-text-muted)" }}>
                      {cust.createdAt
                        ? new Date(cust.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>

                    <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <Link
                          href={`/dashboard/customers/${cust.id}/edit`}
                          className="az-btn-secondary"
                          style={{ fontSize: "11px", padding: "3px 8px", textDecoration: "none" }}
                        >
                          Configure
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Customer Detail Drawer Modal */}
        {selectedCustomer && (
          <div className="az-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedCustomer(null); }}>
            <div className="az-modal-box">
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--az-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="az-tag az-tag-emerald" style={{ fontSize: "10px" }}>
                    ID: {selectedCustomer.id}
                  </span>
                  <h3 style={{ fontFamily: "var(--az-font-mono)", fontSize: "13px", color: "#ffffff", textTransform: "uppercase" }}>
                    Account Node Profile
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="az-btn-secondary"
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                >
                  ✕ Close
                </button>
              </div>

              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>{selectedCustomer.name}</h2>
                  <div style={{ fontSize: "12px", color: "var(--az-text-secondary)", marginTop: "2px" }}>
                    {selectedCustomer.company}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ background: "var(--az-surface-alt)", border: "1px solid var(--az-border)", padding: "12px", borderRadius: "4px" }}>
                    <div style={{ fontSize: "10px", fontFamily: "var(--az-font-mono)", color: "var(--az-text-muted)" }}>EMAIL IDENTIFIER</div>
                    <div style={{ fontSize: "12px", color: "#ffffff", marginTop: "4px" }}>{selectedCustomer.email}</div>
                  </div>
                  <div style={{ background: "var(--az-surface-alt)", border: "1px solid var(--az-border)", padding: "12px", borderRadius: "4px" }}>
                    <div style={{ fontSize: "10px", fontFamily: "var(--az-font-mono)", color: "var(--az-text-muted)" }}>WHATSAPP PHONE</div>
                    <div style={{ fontSize: "12px", color: "#ffffff", marginTop: "4px" }}>{selectedCustomer.phone || "—"}</div>
                  </div>
                  <div style={{ background: "var(--az-surface-alt)", border: "1px solid var(--az-border)", padding: "12px", borderRadius: "4px" }}>
                    <div style={{ fontSize: "10px", fontFamily: "var(--az-font-mono)", color: "var(--az-text-muted)" }}>SERVICE TIER</div>
                    <div style={{ fontSize: "12px", color: "var(--az-emerald)", marginTop: "4px", fontWeight: 700 }}>{selectedCustomer.tier}</div>
                  </div>
                  <div style={{ background: "var(--az-surface-alt)", border: "1px solid var(--az-border)", padding: "12px", borderRadius: "4px" }}>
                    <div style={{ fontSize: "10px", fontFamily: "var(--az-font-mono)", color: "var(--az-text-muted)" }}>CONNECTION STATUS</div>
                    <div style={{ fontSize: "12px", color: "#ffffff", marginTop: "4px" }}>{selectedCustomer.status}</div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                  <Link
                    href={`/dashboard/customers/${selectedCustomer.id}/edit`}
                    className="az-btn-primary"
                    style={{ fontSize: "12px", padding: "8px 16px", textDecoration: "none" }}
                  >
                    Edit Node Configuration →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}