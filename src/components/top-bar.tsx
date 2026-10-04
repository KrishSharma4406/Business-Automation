"use client";

import { useState } from "react";

export default function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [search, setSearch] = useState("");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 24px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-sidebar)",
        minHeight: "54px",
      }}
    >
      {/* Left: Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <h1
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            {subtitle}
          </span>
        )}
      </div>

      {/* Right: Search */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "6px 12px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-default)",
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            fontSize: "13px",
            width: "200px",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}
