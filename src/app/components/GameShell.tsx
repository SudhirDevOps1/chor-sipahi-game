import React from "react";
import { ArrowLeft } from "lucide-react";

interface GameShellProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  badge?: string;
  right?: React.ReactNode;
  sidebar?: React.ReactNode;
  tips?: string[];
  children: React.ReactNode;
}

export default function GameShell({
  title,
  subtitle,
  onBack,
  badge,
  right,
  sidebar,
  tips,
  children,
}: GameShellProps) {
  return (
    <div
      style={{
        background: "var(--paper-light, #fffbf1)",
        color: "var(--ink, #172748)",
        borderRadius: "16px",
        border: "2px solid var(--ink, #172748)",
        padding: "24px",
        boxShadow: "var(--shadow, 6px 6px 0 #172748)",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
          borderBottom: "2px solid var(--ink)",
          paddingBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: "var(--paper, #f7f0df)",
              border: "2px solid var(--ink, #172748)",
              color: "var(--ink)",
              borderRadius: "50%",
              width: "42px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "2px 2px 0 var(--ink)",
              transition: "all 0.15s ease",
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 900,
                  margin: 0,
                  letterSpacing: "-0.03em",
                }}
              >
                {title}
              </h1>
              {badge && (
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 900,
                    background: "var(--gold, #e5b343)",
                    border: "1.5px solid var(--ink, #172748)",
                    color: "var(--ink)",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--ink-soft, #41506a)",
                margin: "4px 0 0",
                fontFamily: "sans-serif",
              }}
            >
              {subtitle}
            </p>
          </div>
        </div>
        {right && <div>{right}</div>}
      </div>

      {/* Main Grid split with sidebar if present */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: sidebar ? "2fr 1fr" : "1fr",
          gap: "28px",
        }}
      >
        <div>
          {children}

          {/* Tips section */}
          {tips && tips.length > 0 && (
            <div
              style={{
                marginTop: "28px",
                padding: "20px",
                background: "var(--paper-deep, #eadcc1)",
                border: "2px solid var(--ink, #172748)",
                borderRadius: "12px",
                boxShadow: "4px 4px 0 rgba(23,39,72,0.15)",
              }}
            >
              <h3
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  color: "var(--saffron-dark, #b94318)",
                  textTransform: "uppercase",
                  margin: "0 0 12px",
                  fontFamily: "sans-serif",
                }}
              >
                Tips & Rules
              </h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  fontSize: "0.85rem",
                  color: "var(--ink-soft)",
                  fontFamily: "sans-serif",
                  lineHeight: 1.6,
                }}
              >
                {tips.map((t, idx) => (
                  <li key={idx} style={{ marginBottom: "6px" }}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {sidebar && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {sidebar}
          </div>
        )}
      </div>
    </div>
  );
}

interface PanelProps {
  title: string;
  children: React.ReactNode;
}

export function Panel({ title, children }: PanelProps) {
  return (
    <div
      style={{
        background: "#fffdf6",
        border: "2px solid var(--ink, #172748)",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "3px 3px 0 rgba(23,39,72,0.1)",
      }}
    >
      <h2
        style={{
          fontSize: "1rem",
          fontWeight: 900,
          color: "var(--ink)",
          borderBottom: "2px solid var(--ink)",
          paddingBottom: "10px",
          margin: "0 0 16px",
          fontFamily: "Georgia, serif",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

interface StatProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  active?: boolean;
}

export function Stat({ label, value, icon, active }: StatProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        background: active ? "#f7e4ad" : "var(--paper-light, #fffbf1)",
        border: active
          ? "2px solid var(--saffron-dark, #b94318)"
          : "1px solid var(--ink, #172748)",
        borderRadius: "8px",
        fontSize: "0.85rem",
        boxShadow: active
          ? "2px 2px 0 var(--saffron-dark)"
          : "1px 1px 0 var(--ink)",
        transition: "all 0.15s ease",
        color: "var(--ink)",
        fontFamily: "sans-serif",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: active ? "var(--saffron-dark)" : "var(--ink-soft)",
          fontWeight: 800,
          textTransform: "uppercase",
          fontSize: "0.75rem",
          letterSpacing: "0.05em",
        }}
      >
        {icon}
        {label}
      </span>
      <span style={{ fontWeight: 900, color: "var(--ink)", fontSize: "1rem" }}>
        {value}
      </span>
    </div>
  );
}
