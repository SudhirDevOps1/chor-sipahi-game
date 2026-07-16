"use client";

import React, { useEffect, useState } from "react";

export function PrismAnalyticsWidget() {
  const [liveCount, setLiveCount] = useState<number>(0);
  const [totalViews, setTotalViews] = useState<number>(0);

  useEffect(() => {
    const url = "https://prismanalytics.sudhirdevops1.workers.dev/api/widget?siteId=pa_a855e546a1c7483dbf30";
    function update() {
      fetch(url)
        .then((res) => res.json())
        .then((data: any) => {
          if (data) {
            setLiveCount(Number(data.liveCount) || 0);
            setTotalViews(Number(data.totalViews) || 0);
          }
        })
        .catch((err) => console.error("Prism widget error:", err));
    }
    update();
    const interval = setInterval(update, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="prism-analytics-widget"
      style={{
        maxWidth: "320px",
        minWidth: "250px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: "#0c0a12",
        color: "#f4f3f6",
        borderRadius: "16px",
        padding: "18px",
        border: "1px solid rgba(139, 108, 245, 0.25)",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.6)",
        position: "relative",
        overflow: "hidden",
        margin: "2rem auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at top right, rgba(139, 108, 245, 0.12), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            className="prism-pulse-dot"
            style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 12px #10b981",
            }}
          />
          <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#10b981", fontFamily: "monospace" }}>
            Live Visitors
          </span>
        </div>
        <div style={{ fontSize: "10px", color: "#787582", fontWeight: 500 }}>PrismAnalytics</div>
      </div>
      <div style={{ marginTop: "14px", display: "flex", alignItems: "baseline", gap: "8px", position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: "38px", fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>
          {liveCount.toLocaleString()}
        </div>
        <div style={{ fontSize: "12px", color: "#a39fae", fontWeight: 500 }}>active right now</div>
      </div>
      <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#787582", position: "relative", zIndex: 2 }}>
        <div>
          Total Pageviews: <span style={{ color: "#c9c7d0", fontWeight: 600 }}>{totalViews.toLocaleString()}</span>
        </div>
        <div style={{ color: "rgba(139, 108, 245, 0.85)", fontWeight: 600 }}>🛡️ Cookie-Free</div>
      </div>
    </div>
  );
}

export function FormForgeFeedbackForm() {
  return (
    <form
      method="POST"
      action="https://apnaform.sudhirdevops1.workers.dev/api/submit/endpoint_hSQ8pIPJWdphv4LunoqB4XgG"
      className="ff-feedback"
    >
      <h3>Share Your Feedback</h3>
      <p>We value your opinion. Help us improve!</p>
      <label htmlFor="ff-name">Your Name</label>
      <input id="ff-name" name="name" type="text" required placeholder="Enter your name" />
      <label htmlFor="ff-email">Email</label>
      <input id="ff-email" name="email" type="email" required placeholder="you@example.com" />
      <label>Rating</label>
      <div className="ff-stars" style={{ display: "flex", gap: "0.375rem", direction: "rtl", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <label style={{ cursor: "pointer", fontSize: "1.5rem" }}>⭐<input type="radio" name="rating" value="5" style={{ display: "none" }} /></label>
        <label style={{ cursor: "pointer", fontSize: "1.5rem" }}>⭐<input type="radio" name="rating" value="4" style={{ display: "none" }} /></label>
        <label style={{ cursor: "pointer", fontSize: "1.5rem" }}>⭐<input type="radio" name="rating" value="3" style={{ display: "none" }} /></label>
        <label style={{ cursor: "pointer", fontSize: "1.5rem" }}>⭐<input type="radio" name="radio" value="2" style={{ display: "none" }} /></label>
        <label style={{ cursor: "pointer", fontSize: "1.5rem" }}>⭐<input type="radio" name="rating" value="1" style={{ display: "none" }} /></label>
      </div>
      <label htmlFor="ff-msg">Your Feedback</label>
      <textarea id="ff-msg" name="message" rows={4} required placeholder="Tell us what you think..."></textarea>
      {/* Honeypot Bot Trap */}
      <input name="website" tabIndex={-1} autoComplete="off" style={{ display: "none" }} />
      <button type="submit">Submit Feedback</button>
    </form>
  );
}
