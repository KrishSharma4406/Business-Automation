"use client";

import TopBar from "@/src/components/top-bar";
import { useState } from "react";

export default function CustomersPage() {
  const [showFilters, setShowFilters] = useState(true);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  return (
    <>
      <TopBar title="Customers" subtitle="Manage your customers and customer information" />

      <div style={{ display: "flex", flex: 1 }}>
        {/* Main content */}
        <div style={{ flex: 1, padding: "24px" }}>
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Sort by:</span>
              <select
                style={{
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-input)",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                  outline: "none",
                }}
              >
                <option value="name">Name</option>
                <option value="date">Date added</option>
                <option value="company">Company</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                0 customers
              </span>

              <a
                href="/dashboard/customers/new"
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--accent)",
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                + New
              </a>

              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-surface)",
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                Filters
              </button>
            </div>
          </div>

          {/* Customer List */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.5fr 1fr 1fr",
                gap: "12px",
                padding: "12px 20px",
                borderBottom: "1px solid var(--border-default)",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              <span>Name</span>
              <span>Email</span>
              <span>Company</span>
              <span>Added</span>
            </div>

            {/* Empty state */}
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                No customers yet.
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                Add your first customer to get started.
              </p>
              <a
                href="/dashboard/customers/new"
                style={{
                  display: "inline-block",
                  marginTop: "16px",
                  padding: "8px 20px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Add Customer
              </a>
            </div>
          </div>
        </div>

        {/* Right Filter Panel */}
        {showFilters && (
          <div
            style={{
              width: "280px",
              borderLeft: "1px solid var(--border-subtle)",
              padding: "20px",
              background: "var(--bg-sidebar)",
              flexShrink: 0,
            }}
          >
            <FilterDropdown
              label="Company"
              value={companyFilter}
              onChange={setCompanyFilter}
              options={[
                { value: "all", label: "Any" },
              ]}
            />

            <FilterDropdown
              label="Tags"
              value={tagFilter}
              onChange={setTagFilter}
              options={[
                { value: "all", label: "Any" },
              ]}
            />

            <button
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                marginTop: "20px",
              }}
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function FilterDropdown({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          display: "block",
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--text-secondary)",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-default)",
          background: "var(--bg-input)",
          color: "var(--text-primary)",
          fontSize: "13px",
          outline: "none",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}