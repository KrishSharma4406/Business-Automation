"use client";

import TopBar from "@/src/components/top-bar";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState<{
    name: string;
    email: string;
    phone: string;
    company: string;
    notes: string;
    status: string;
  }>({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
    status: "active",
  });

  useEffect(() => {
    if (!customerId) return;

    fetch(`/api/customers/${customerId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.customer) {
          setCustomer({
            name: data.customer.name || "",
            email: data.customer.email || "",
            phone: data.customer.phone || "",
            company: data.customer.company || "",
            notes: data.customer.notes || "",
            status: data.customer.status || "active",
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load customer profile:", err);
      })
      .finally(() => {
        setFetching(false);
      });
  }, [customerId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: (formData.get("name") as string)?.trim(),
      email: (formData.get("email") as string)?.trim() || undefined,
      phone: (formData.get("phone") as string)?.trim() || undefined,
      company: (formData.get("company") as string)?.trim() || undefined,
      notes: (formData.get("notes") as string)?.trim() || undefined,
      status: (formData.get("status") as string) || "active",
    };

    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update customer");
      }

      router.push("/dashboard/customers");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update customer");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this customer record?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete customer");
      }

      router.push("/dashboard/customers");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete customer");
      setDeleting(false);
    }
  }

  if (fetching) {
    return (
      <div className="az-dash-page">
        <TopBar title="Edit Customer" subtitle="Update customer details and preferences" />
        <div className="az-dash-body" style={{ padding: "40px", color: "var(--az-text-muted)", fontFamily: "var(--az-font-mono)" }}>
          [SYSTEM] Fetching Customer Node Profile...
        </div>
      </div>
    );
  }

  return (
    <div className="az-dash-page">
      <TopBar title="Edit Customer" subtitle="Update customer details and preferences" />

      <div className="az-dash-body" style={{ maxWidth: "760px" }}>
        <div className="az-dash-card">
          <div className="az-dash-card-header">
            <div className="az-dash-card-title">
              <span className="az-status-dot" />
              <span>CUSTOMER PROFILE // EDIT ACCOUNT</span>
            </div>
            <Link
              href="/dashboard/customers"
              className="az-btn-secondary"
              style={{ fontSize: "11px", padding: "4px 8px", textDecoration: "none" }}
            >
              ← Back to Customers
            </Link>
          </div>

          {error && (
            <div style={{ margin: "16px 24px 0", padding: "10px 14px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--az-rose)", borderRadius: "4px", color: "var(--az-rose)", fontSize: "12px", fontFamily: "var(--az-font-mono)" }}>
              [ERROR] {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="az-field">
                <label className="az-field-label">Full Name *</label>
                <input
                  name="name"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  required
                  className="az-field-input"
                />
              </div>
              <div className="az-field">
                <label className="az-field-label">Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="az-field-input"
                />
              </div>
              <div className="az-field">
                <label className="az-field-label">Phone / WhatsApp</label>
                <input
                  name="phone"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="az-field-input"
                />
              </div>
              <div className="az-field">
                <label className="az-field-label">Company / Business Name</label>
                <input
                  name="company"
                  value={customer.company}
                  onChange={(e) => setCustomer({ ...customer, company: e.target.value })}
                  className="az-field-input"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="az-field">
                <label className="az-field-label">Account Status</label>
                <select
                  name="status"
                  value={customer.status}
                  onChange={(e) => setCustomer({ ...customer, status: e.target.value })}
                  className="az-field-select"
                >
                  <option value="active">Active</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="az-field">
              <label className="az-field-label">Notes &amp; Preferences</label>
              <textarea
                name="notes"
                rows={4}
                value={customer.notes}
                onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                className="az-field-textarea"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "16px", borderTop: "1px solid var(--az-border)" }}>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="az-btn-secondary"
                style={{ fontSize: "12px", padding: "8px 16px", color: "var(--az-rose)", borderColor: "var(--az-rose)" }}
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>

              <div style={{ display: "flex", gap: "12px" }}>
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
                  {loading ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
