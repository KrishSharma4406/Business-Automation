"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Ticker from "./ticker";

export default function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [search, setSearch] = useState("");
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 40, width: "100%", background: "var(--az-surface)" }}>
      <div className="az-dash-header" style={{ position: "relative", top: "auto" }}>
        {/* Left: Breadcrumbs & Node Hierarchy */}
        <div className="az-dash-header-title">
          <span className="az-tag az-tag-emerald" style={{ padding: "2px 6px", fontSize: "10px" }}>
            <span className="az-status-dot" />
            ACTIVE
          </span>
        <h1 className="az-dash-header-h1">
          {title}
        </h1>
        {subtitle && (
          <span className="az-dash-header-sub">
            {subtitle}
          </span>
        )}
      </div>

      {/* Right: Telemetry & Search */}
      <div className="az-dash-header-actions">
        {timeStr && (
          <div
            className="az-tag"
            style={{
              fontFamily: "var(--az-font-mono)",
              fontSize: "11px",
              color: "var(--az-text-secondary)",
              letterSpacing: "0.05em",
            }}
          >
            UTC {timeStr}
          </div>
        )}

        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span
            style={{
              position: "absolute",
              left: "10px",
              color: "var(--az-emerald)",
              fontFamily: "var(--az-font-mono)",
              fontSize: "12px",
              pointerEvents: "none",
            }}
          >
            &gt;
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="az-input-search"
            style={{
              paddingLeft: "26px",
              width: "220px",
              height: "32px",
            }}
          />
        </div>

        <Link
          href="/"
          target="_blank"
          className="az-btn-secondary"
          style={{
            fontSize: "11px",
            padding: "6px 12px",
            height: "32px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            textDecoration: "none",
          }}
        >
          <span>View Website</span>
          <span style={{ color: "var(--az-emerald)" }}>↗</span>
        </Link>
      </div>
    </div>
    <Ticker className="az-dash-ticker" />
  </div>
  );
}
