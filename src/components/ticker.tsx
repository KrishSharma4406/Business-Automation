"use client";

interface TickerProps {
  items?: string[];
  speedSeconds?: number;
  className?: string;
}

const DEFAULT_TICKER_ITEMS = [
  "FROM FRICTION TO SCALABLE CODE",
  "REPEATABLE REVENUE ARCHITECTURE",
  "CAPTURE EVERY LEAD",
  "ELIMINATE OPERATIONAL FRICTION",
  "HIGH-RELIABILITY ENGINEERING",
  "SYSTEMS OVER HEADCOUNT",
  "REAL-TIME BUSINESS SYNC",
  "SUB-400MS INTENT INFERENCE",
  "DETERMINISTIC WORKFLOWS",
  "ATOMIC DATABASE PERSISTENCE",
];

export default function Ticker({
  items = DEFAULT_TICKER_ITEMS,
  speedSeconds = 35,
  className = "",
}: TickerProps) {
  return (
    <div className={`az-ticker ${className}`} aria-hidden="true">
      <div className="az-ticker-fade-l" />
      <div className="az-ticker-fade-r" />
      <div
        className="az-ticker-track"
        style={{ animationDuration: `${speedSeconds}s` }}
      >
        {[1, 2].map((setIndex) => (
          <div key={`ticker-set-${setIndex}`} className="az-ticker-group">
            {items.map((item, idx) => (
              <span
                key={`ticker-item-${setIndex}-${idx}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "36px",
                }}
              >
                <span className="az-ticker-item">{item}</span>
                <span className="az-ticker-dot" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
