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
      <TopBar title="Add Customer" subtitle="Create a new customer account" />

      <div className="az-dash-body" style={{ maxWidth: "760px" }}>
        <div className="az-dash-card">
          <div className="az-dash-card-header">
            <div className="az-dash-card-title">
              <span className="az-status-dot" />
              <span>CUSTOMER PROFILE // NEW ACCOUNT</span>
            </div>
            <Link
              href="/dashboard/customers"
              className="az-btn-secondary"
              style={{ fontSize: "11px", padding: "4px 8px", textDecoration: "none" }}
            >
              ← Back to Customers
            </Link>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="az-field">
                <label className="az-field-label">Full Name</label>
                <input name="name" placeholder="Dr. Vikram Sen" required className="az-field-input" />
              </div>
              <div className="az-field">
                <label className="az-field-label">Email Address</label>
                <input name="email" type="email" placeholder="vikram@cliniccorp.in" required className="az-field-input" />
              </div>
              <div className="az-field">
                <label className="az-field-label">Phone / WhatsApp</label>
                <input name="phone" placeholder="+91 98402 00000" className="az-field-input" />
              </div>
              <div className="az-field">
                <label className="az-field-label">Company / Business Name</label>
                <input name="company" placeholder="Sen Healthcare Systems" className="az-field-input" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="az-field">
                <label className="az-field-label">Plan / Tier</label>
                <select name="tier" className="az-field-select" defaultValue="Enterprise">
                  <option value="Enterprise">Enterprise (50+ seats, custom SLA)</option>
                  <option value="Growth">Growth (15 seats, priority support)</option>
                  <option value="Starter">Starter (Basic plan)</option>
                </select>
              </div>
              <div className="az-field">
                <label className="az-field-label">Preferred Contact Method</label>
                <select name="channel" className="az-field-select" defaultValue="WhatsApp Cloud API">
                  <option value="WhatsApp Cloud API">WhatsApp</option>
                  <option value="REST Webhook">Webhook / API</option>
                  <option value="SMTP Relay">Email</option>
                </select>
              </div>
            </div>

            <div className="az-field">
              <label className="az-field-label">Notes &amp; Preferences</label>
              <textarea
                name="notes"
                rows={4}
                placeholder="Add special instructions, client requirements, or notes..."
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
                {loading ? "Saving Customer..." : "Add Customer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
