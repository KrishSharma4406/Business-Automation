"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

/* ------------------------------------------------------------------ */
/*  Reusable style tokens (keeps everything co-located)               */
/* ------------------------------------------------------------------ */

const t = {
  accent: "var(--accent)",
  accentSubtle: "var(--accent-subtle)",
  border: "var(--border-default)",
  borderSubtle: "var(--border-subtle)",
  bgSurface: "var(--bg-surface)",
  bgHover: "var(--bg-surface-hover)",
  bgApp: "var(--bg-app)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  green: "var(--green)",
  greenSubtle: "var(--green-subtle)",
  yellow: "var(--yellow)",
  yellowSubtle: "var(--yellow-subtle)",
  orange: "var(--orange)",
  orangeSubtle: "var(--orange-subtle)",
  radiusMd: "var(--radius-md)",
  radiusLg: "var(--radius-lg)",
} as const;

/* ------------------------------------------------------------------ */
/*  Custom renderers for every markdown element                       */
/* ------------------------------------------------------------------ */

const components: Components = {
  /* ---------- Headings ---------- */
  h1: ({ children }) => (
    <h1
      style={{
        fontSize: "18px",
        fontWeight: 700,
        color: t.textPrimary,
        margin: "24px 0 12px",
        paddingBottom: "8px",
        borderBottom: `1px solid ${t.border}`,
        lineHeight: 1.3,
      }}
    >
      {children}
    </h1>
  ),

  h2: ({ children }) => (
    <h2
      style={{
        fontSize: "15px",
        fontWeight: 700,
        color: t.textPrimary,
        margin: "20px 0 10px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        lineHeight: 1.3,
      }}
    >
      <span
        style={{
          width: "3px",
          height: "16px",
          background: t.accent,
          borderRadius: "2px",
          flexShrink: 0,
        }}
      />
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3
      style={{
        fontSize: "14px",
        fontWeight: 600,
        color: t.textPrimary,
        margin: "16px 0 8px",
        lineHeight: 1.3,
      }}
    >
      {children}
    </h3>
  ),

  h4: ({ children }) => (
    <h4
      style={{
        fontSize: "13px",
        fontWeight: 600,
        color: t.textSecondary,
        margin: "12px 0 6px",
        textTransform: "uppercase",
        letterSpacing: "0.4px",
        lineHeight: 1.3,
      }}
    >
      {children}
    </h4>
  ),

  /* ---------- Paragraph ---------- */
  p: ({ children }) => (
    <p
      style={{
        margin: "8px 0",
        lineHeight: 1.7,
        color: t.textPrimary,
        fontSize: "13px",
      }}
    >
      {children}
    </p>
  ),

  /* ---------- Bold / Italic ---------- */
  strong: ({ children }) => (
    <strong style={{ fontWeight: 600, color: t.textPrimary }}>
      {children}
    </strong>
  ),

  em: ({ children }) => (
    <em style={{ fontStyle: "italic", color: t.textSecondary }}>
      {children}
    </em>
  ),

  /* ---------- Links ---------- */
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: t.accent,
        textDecoration: "none",
        borderBottom: `1px solid transparent`,
        transition: "border-color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.borderBottomColor = t.accent;
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.borderBottomColor = "transparent";
      }}
    >
      {children}
    </a>
  ),

  /* ---------- Horizontal rule ---------- */
  hr: () => (
    <hr
      style={{
        border: "none",
        height: "1px",
        background: `linear-gradient(to right, transparent, ${t.border}, transparent)`,
        margin: "20px 0",
      }}
    />
  ),

  /* ---------- Block-quote ---------- */
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: "12px 0",
        padding: "10px 16px",
        borderLeft: `3px solid ${t.accent}`,
        background: t.accentSubtle,
        borderRadius: `0 ${t.radiusMd} ${t.radiusMd} 0`,
        color: t.textSecondary,
        fontSize: "13px",
        lineHeight: 1.6,
      }}
    >
      {children}
    </blockquote>
  ),

  /* ---------- Lists ---------- */
  ul: ({ children }) => (
    <ul
      style={{
        margin: "8px 0",
        paddingLeft: "0",
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol
      style={{
        margin: "8px 0",
        paddingLeft: "0",
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        counterReset: "step-counter",
      }}
    >
      {children}
    </ol>
  ),

  li: ({ children, ...props }) => {
    /* Detect if parent is ordered (has `ordered` prop from react-markdown) */
    const isOrdered = (props as any).node?.position?.start != null && (props as any).ordered;

    if (isOrdered) {
      return (
        <li
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
            counterIncrement: "step-counter",
            fontSize: "13px",
            lineHeight: 1.6,
            color: t.textPrimary,
          }}
        >
          <span
            style={{
              minWidth: "22px",
              height: "22px",
              borderRadius: "50%",
              background: t.accentSubtle,
              color: t.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 700,
              flexShrink: 0,
              marginTop: "1px",
            }}
          >
            {(props as any).index != null ? (props as any).index + 1 : "•"}
          </span>
          <div style={{ flex: 1 }}>{children}</div>
        </li>
      );
    }

    return (
      <li
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "flex-start",
          fontSize: "13px",
          lineHeight: 1.6,
          color: t.textPrimary,
        }}
      >
        <span
          style={{
            color: t.accent,
            fontSize: "8px",
            marginTop: "7px",
            flexShrink: 0,
          }}
        >
          ●
        </span>
        <div style={{ flex: 1 }}>{children}</div>
      </li>
    );
  },

  /* ---------- Table ---------- */
  table: ({ children }) => (
    <div
      style={{
        margin: "12px 0",
        borderRadius: t.radiusLg,
        border: `1px solid ${t.border}`,
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          {children}
        </table>
      </div>
    </div>
  ),

  thead: ({ children }) => (
    <thead
      style={{
        background: "rgba(74, 108, 247, 0.08)",
      }}
    >
      {children}
    </thead>
  ),

  tbody: ({ children }) => <tbody>{children}</tbody>,

  tr: ({ children, ...props }) => {
    const isEven = (props as any).node?.position?.start?.line
      ? (props as any).node.position.start.line % 2 === 0
      : false;

    return (
      <tr
        style={{
          borderBottom: `1px solid ${t.borderSubtle}`,
          background: isEven ? "rgba(255,255,255,0.02)" : "transparent",
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(74, 108, 247, 0.04)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = isEven
            ? "rgba(255,255,255,0.02)"
            : "transparent";
        }}
      >
        {children}
      </tr>
    );
  },

  th: ({ children }) => (
    <th
      style={{
        padding: "10px 14px",
        textAlign: "left",
        fontWeight: 600,
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        color: t.accent,
        borderBottom: `1px solid ${t.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  ),

  td: ({ children }) => (
    <td
      style={{
        padding: "9px 14px",
        color: t.textPrimary,
        fontSize: "12px",
        verticalAlign: "top",
      }}
    >
      {children}
    </td>
  ),

  /* ---------- Code ---------- */
  code: ({ children, className, ...props }) => {
    const isBlock = className?.includes("language-");

    if (isBlock) {
      return (
        <div
          style={{
            margin: "12px 0",
            borderRadius: t.radiusMd,
            overflow: "hidden",
            border: `1px solid ${t.border}`,
          }}
        >
          <div
            style={{
              padding: "6px 12px",
              background: "rgba(74, 108, 247, 0.06)",
              borderBottom: `1px solid ${t.border}`,
              fontSize: "10px",
              fontWeight: 600,
              color: t.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {className?.replace("language-", "") || "code"}
          </div>
          <pre
            style={{
              margin: 0,
              padding: "14px 16px",
              background: t.bgApp,
              overflowX: "auto",
              fontSize: "12px",
              lineHeight: 1.6,
            }}
          >
            <code
              style={{
                fontFamily: "var(--font-geist-mono, 'Fira Code', monospace)",
                color: t.textPrimary,
              }}
            >
              {children}
            </code>
          </pre>
        </div>
      );
    }

    return (
      <code
        style={{
          padding: "2px 6px",
          borderRadius: "4px",
          background: "rgba(74, 108, 247, 0.1)",
          color: t.accent,
          fontSize: "12px",
          fontFamily: "var(--font-geist-mono, 'Fira Code', monospace)",
          fontWeight: 500,
        }}
      >
        {children}
      </code>
    );
  },

  pre: ({ children }) => <>{children}</>,

  /* ---------- Input (checkboxes in GFM) ---------- */
  input: ({ ...props }) => {
    if ((props as any).type === "checkbox") {
      const checked = (props as any).checked;
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "16px",
            height: "16px",
            borderRadius: "4px",
            border: checked
              ? `2px solid ${t.green}`
              : `2px solid ${t.border}`,
            background: checked ? t.greenSubtle : "transparent",
            color: t.green,
            fontSize: "10px",
            marginRight: "6px",
            flexShrink: 0,
          }}
        >
          {checked ? "✓" : ""}
        </span>
      );
    }
    return <input {...props} />;
  },
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

type AIMessageRendererProps = {
  content: string;
};

export default function AIMessageRenderer({ content }: AIMessageRendererProps) {
  return (
    <div
      className="ai-message-content"
      style={{
        fontSize: "13px",
        lineHeight: 1.6,
        color: t.textPrimary,
        wordBreak: "break-word",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
