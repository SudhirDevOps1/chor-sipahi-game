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
    <div style={{
      background: "var(--background, #0f172a)",
      color: "var(--text-primary, #f8fafc)",
      borderRadius: "20px",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "24px",
      boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
      fontFamily: "var(--font-sans, system-ui, sans-serif)",
    }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button type="button" onClick={onBack} style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
          }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>{title}</h1>
              {badge && (
                <span style={{
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  background: "rgba(99,102,241,0.2)",
                  border: "1px solid #6366f1",
                  color: "#818cf8",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  textTransform: "uppercase",
                }}>
                  {badge}
                </span>
              )}
            </div>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "2px 0 0" }}>{subtitle}</p>
          </div>
        </div>
        {right && <div>{right}</div>}
      </div>

      {/* Main Grid split with sidebar if present */}
      <div style={{ display: "grid", gridTemplateColumns: sidebar ? "2fr 1fr" : "1fr", gap: "24px" }}>
        <div>
          {children}

          {/* Tips section */}
          {tips && tips.length > 0 && (
            <div style={{
              marginTop: "24px",
              padding: "16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
            }}>
              <h3 style={{ fontSize: "0.8rem", fontWeight: 800, letterSpacing: "0.05em", color: "#818cf8", textTransform: "uppercase", margin: "0 0 8px" }}>Tips & Rules</h3>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.8rem", color: "#94a3b8" }}>
                {tips.map((t, idx) => (
                  <li key={idx} style={{ marginBottom: "4px" }}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {sidebar && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px",
      padding: "16px",
    }}>
      <h2 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px", margin: "0 0 12px" }}>
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
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 12px",
      background: active ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
      border: active ? "1.5px solid #6366f1" : "1.5px solid transparent",
      borderRadius: "8px",
      fontSize: "0.8rem",
      boxShadow: active ? "0 0 10px rgba(99,102,241,0.3)" : "none",
      transition: "all 0.25s ease",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: "6px", color: active ? "#818cf8" : "#94a3b8" }}>
        {icon}
        {label}
      </span>
      <span style={{ fontWeight: 800, color: "#fff" }}>{value}</span>
    </div>
  );
}
