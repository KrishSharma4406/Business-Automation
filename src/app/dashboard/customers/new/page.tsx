"use client";

import TopBar from "@/src/components/top-bar";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard/customers");
    }, 600);
  }

  return (
    <div className="az-dash-page">
      <TopBar title="Provision Customer" subtitle="Initialize New Commercial Account Node" />

      <div className="az-dash-body" style={{ maxWidth: "760px" }}>
        <div className="az-dash-card">
          <div className="az-dash-card-header">
            <div className="az-dash-card-title">
              <span className="az-status-dot" />
              <span>OPERATOR ACTION // PROVISION ACCOUNT</span>
            </div>
            <Link
              href="/dashboard/customers"
              className="az-btn-secondary"
              style={{ fontSize: "11px", padding: "4px 8px", textDecoration: "none" }}
            >
              ← Back to Directory
            </Link>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="az-field">
                <label className="az-field-label">Customer Legal / Full Name</label>
                <input name="name" placeholder="Dr. Vikram Sen" required className="az-field-input" />
              </div>
              <div className="az-field">
                <label className="az-field-label">Commercial Identity // Email</label>
                <input name="email" type="email" placeholder="vikram@cliniccorp.in" required className="az-field-input" />
              </div>
              <div className="az-field">
                <label className="az-field-label">WhatsApp Channel // Phone</label>
                <input name="phone" placeholder="+91 98402 00000" className="az-field-input" />
              </div>
              <div className="az-field">
                <label className="az-field-label">Organization // Entity</label>
                <input name="company" placeholder="Sen Healthcare Systems" className="az-field-input" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="az-field">
                <label className="az-field-label">Deployment Tier</label>
                <select name="tier" className="az-field-select" defaultValue="Enterprise">
                  <option value="Enterprise">Enterprise Node (50+ seats, custom SLA)</option>
                  <option value="Growth">Growth Node (15 seats, priority queue)</option>
                  <option value="Starter">Starter Node (Standard ingress)</option>
                </select>
              </div>
              <div className="az-field">
                <label className="az-field-label">Primary Ingress Channel</label>
                <select name="channel" className="az-field-select" defaultValue="WhatsApp Cloud API">
                  <option value="WhatsApp Cloud API">WhatsApp Cloud API</option>
                  <option value="REST Webhook">REST Webhook Core</option>
                  <option value="SMTP Relay">SMTP Relay &amp; Email</option>
                </select>
              </div>
            </div>

            <div className="az-field">
              <label className="az-field-label">Operator Notes &amp; Routing Specifications</label>
              <textarea
                name="notes"
                rows={4}
                placeholder="Custom CRM database webhook hook at https://api.client.com/v1/intake..."
                className="az-field-textarea"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px", paddingTop: "16px", borderTop: "1px solid var(--az-border)" }}>
              <Link
                href="/dashboard/customers"
                className="az-btn-secondary"
                style={{ fontSize: "12px", padding: "8px 16px", textDecoration: "none" }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="az-btn-primary"
                style={{ fontSize: "12px", padding: "8px 24px" }}
              >
                {loading ? "Provisioning Node..." : "Provision Account Node"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
