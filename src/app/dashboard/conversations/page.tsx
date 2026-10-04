"use client";

import TopBar from "@/src/components/top-bar";
import { useState } from "react";

export default function ConversationsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(true);

  return (
    <>
      <TopBar title="Conversations" subtitle="Manage customer conversations and AI responses" />

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
            <StatCard label="Total Conversations" value="0" />
            <StatCard label="Open" value="0" />
            <StatCard label="AI Resolved" value="0" />
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
                <option value="updated">Last updated</option>
                <option value="priority">Priority</option>
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
                + New
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

          {/* Conversation List */}
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
                Recent Conversations
              </span>
            </div>

            {/* Empty state */}
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                No conversations yet.
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                Customer conversations will appear here once they start.
              </p>
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
                { value: "open", label: "Open" },
                { value: "closed", label: "Closed" },
                { value: "pending", label: "Pending" },
              ]}
            />

            <FilterDropdown
              label="Channel"
              value={channelFilter}
              onChange={setChannelFilter}
              options={[
                { value: "all", label: "Any" },
                { value: "email", label: "Email" },
                { value: "whatsapp", label: "WhatsApp" },
                { value: "slack", label: "Slack" },
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