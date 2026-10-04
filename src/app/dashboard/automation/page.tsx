"use client";

import TopBar from "@/src/components/top-bar";
import { useState } from "react";

export default function AutomationPage() {
  const [showFilters, setShowFilters] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  return (
    <>
      <TopBar title="Automations" subtitle="Automate repetitive business tasks with AI" />

      <div style={{ display: "flex", flex: 1 }}>
        {/* Main content */}
        <div style={{ flex: 1, padding: "24px" }}>
          {/* Stats Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <StatCard label="Total Automations" value="0" />
            <StatCard label="Active" value="0" />
            <StatCard label="Executions" value="0" />
          </div>

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
                <option value="date">Date created</option>
                <option value="name">Name</option>
                <option value="executions">Executions</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--accent)",
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                + Create Automation
              </button>

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

          {/* Automations List */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid var(--border-default)",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                Your Automations
              </span>
            </div>

            {/* Empty state */}
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                No automations created yet.
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                Create your first workflow to automate a repetitive business task.
              </p>
              <button
                style={{
                  marginTop: "16px",
                  padding: "8px 20px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Create your first automation
              </button>
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
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "Any" },
                { value: "active", label: "Active" },
                { value: "paused", label: "Paused" },
                { value: "draft", label: "Draft" },
              ]}
            />

            <FilterDropdown
              label="Type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "all", label: "Any" },
                { value: "workflow", label: "Workflow" },
                { value: "trigger", label: "Trigger" },
                { value: "scheduled", label: "Scheduled" },
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "18px 20px",
      }}
    >
      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
        {label}
      </p>
      <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
        {value}
      </p>
    </div>
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