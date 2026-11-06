"use client";

import { useEffect, useState } from "react";
import TopBar from "@/src/components/top-bar";
import { Icon } from "@/src/components/ui/icon";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
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
    status: "Active",
    channel: "WhatsApp API",
    createdAt: "2026-03-14T09:12:00Z",
  },
  {
    id: "cust-2",
    name: "Elena Vance",
    email: "elena.vance@enterprise.io",
    phone: "+1 415 802 9912",
    company: "Vance Autonomous Systems",
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
    status: "Onboarding",
    channel: "WhatsApp API",
    createdAt: "2026-04-02T11:20:00Z",
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(DEFAULT_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New Customer Modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.customers && Array.isArray(data.customers) && data.customers.length > 0) {
          const mapped: Customer[] = data.customers.map((c: any) => ({
            id: c.id,
            name: c.name,
            email: c.email || "No email",
            phone: c.phone || "No phone",
            company: c.company || "Direct Account",
            status:
              c.status?.toLowerCase() === "active"
                ? "Active"
                : c.status?.toLowerCase() === "onboarding"
                ? "Onboarding"
                : "Paused",
            channel: "Inbound Pipeline",
            createdAt: c.createdAt || new Date().toISOString(),
          }));
          setCustomers(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          company: company.trim() || undefined,
          status: "active",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const created: Customer = {
          id: data.customer?.id || "c-" + Date.now(),
          name: name.trim(),
          email: email.trim() || "No email",
          phone: phone.trim() || "No phone",
          company: company.trim() || "Enterprise Account",
          status: "Active",
          channel: "Dashboard Manual",
          createdAt: new Date().toISOString(),
        };
        setCustomers([created, ...customers]);
        setName("");
        setEmail("");
        setPhone("");
        setCompany("");
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBar
        title="Customer Directory"
        subtitle="Manage client accounts, verified contact channels, and onboarding statuses."
        actions={
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#0284c7",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "7px 14px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Icon name="plus" size={14} strokeWidth={2.5} />
            Add Customer
          </button>
        }
      />

      <div style={{ padding: "32px 36px 60px", maxWidth: "1280px", width: "100%", margin: "0 auto" }}>
        {/* Search & Filter Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, maxWidth: "420px" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Icon name="search" size={15} />
              </span>
              <input
                type="text"
                placeholder="Search customers by name, email, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  fontSize: "13px",
                  outline: "none",
                  color: "#0f172a",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              backgroundColor: "#f1f5f9",
              borderRadius: "8px",
              padding: "3px",
              gap: "2px",
            }}
          >
            {(["all", "active", "onboarding", "paused"] as const).map((tab) => {
              const isSel = statusFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  style={{
                    border: "none",
                    backgroundColor: isSel ? "#ffffff" : "transparent",
                    color: isSel ? "#0f172a" : "#64748b",
                    fontSize: "12px",
                    fontWeight: isSel ? 600 : 500,
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    boxShadow: isSel ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer Table */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr",
              padding: "14px 20px",
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              fontSize: "12px",
              fontWeight: 600,
              color: "#64748b",
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            <div>Customer</div>
            <div>Company</div>
            <div>Contact</div>
            <div>Status</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "#94a3b8" }}>
              <Icon name="groups" size={32} style={{ color: "#cbd5e1", marginBottom: "8px" }} />
              <div style={{ fontSize: "14px", fontWeight: 500 }}>No customer accounts found</div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                Try adjusting your search criteria or add a new customer above.
              </div>
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr",
                  padding: "16px 20px",
                  alignItems: "center",
                  borderBottom: "1px solid #f1f5f9",
                  fontSize: "13px",
                  color: "#1e293b",
                  transition: "background 0.12s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "#0f172a" }}>{c.name}</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                    {c.email}
                  </div>
                </div>

                <div style={{ color: "#334155", fontWeight: 500 }}>
                  {c.company || "Individual Client"}
                </div>

                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  <div>{c.phone || "No phone"}</div>
                  <div style={{ color: "#94a3b8", fontSize: "11px" }}>{c.channel}</div>
                </div>

                <div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: "12px",
                      backgroundColor:
                        c.status === "Active"
                          ? "#f0fdf4"
                          : c.status === "Onboarding"
                          ? "#eff6ff"
                          : "#fef3c7",
                      color:
                        c.status === "Active"
                          ? "#16a34a"
                          : c.status === "Onboarding"
                          ? "#0284c7"
                          : "#d97706",
                    }}
                  >
                    {c.status}
                  </span>
                </div>

                <div style={{ textAlign: "right" }}>
                  <button
                    onClick={() => setSelectedCustomer(c)}
                    style={{
                      padding: "5px 10px",
                      fontSize: "12px",
                      fontWeight: 500,
                      backgroundColor: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "26px 30px",
              width: "100%",
              maxWidth: "440px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>
                Add New Customer
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCustomer}>
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "6px",
                  }}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "6px",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. rajesh@clinic.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "6px",
                  }}
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98402 11982"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "6px",
                  }}
                >
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apollo Healthcare Node"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "8px 14px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#64748b",
                    backgroundColor: "#f1f5f9",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    padding: "8px 18px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ffffff",
                    backgroundColor: "#0284c7",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  {creating ? "Saving..." : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer Modal */}
      {selectedCustomer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(3px)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 1000,
          }}
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "450px",
              backgroundColor: "#ffffff",
              height: "100%",
              padding: "32px",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                {selectedCustomer.name}
              </h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                  Company
                </span>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#0f172a", marginTop: "2px" }}>
                  {selectedCustomer.company}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                  Email Address
                </span>
                <div style={{ fontSize: "14px", color: "#0f172a", marginTop: "2px" }}>
                  {selectedCustomer.email}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                  Phone
                </span>
                <div style={{ fontSize: "14px", color: "#0f172a", marginTop: "2px" }}>
                  {selectedCustomer.phone}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                  Status
                </span>
                <div style={{ marginTop: "4px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: "12px",
                      backgroundColor: "#f0fdf4",
                      color: "#16a34a",
                    }}
                  >
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
