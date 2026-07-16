"use client";

import React, { useEffect, useState } from "react";

export function PrismAnalyticsWidget() {
  const [liveCount, setLiveCount] = useState<number>(0);
  const [totalViews, setTotalViews] = useState<number>(0);

  useEffect(() => {
    const url =
      "https://prismanalytics.sudhirdevops1.workers.dev/api/widget?siteId=pa_5eef70cd98b2492184e7";
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
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
          background:
            "radial-gradient(circle at top right, rgba(139, 108, 245, 0.12), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 2,
        }}
      >
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
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#10b981",
              fontFamily: "monospace",
            }}
          >
            Live Visitors
          </span>
        </div>
        <div style={{ fontSize: "10px", color: "#787582", fontWeight: 500 }}>
          PrismAnalytics
        </div>
      </div>
      <div
        style={{
          marginTop: "14px",
          display: "flex",
          alignItems: "baseline",
          gap: "8px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: "38px",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1,
          }}
        >
          {liveCount.toLocaleString()}
        </div>
        <div style={{ fontSize: "12px", color: "#a39fae", fontWeight: 500 }}>
          active right now
        </div>
      </div>
      <div
        style={{
          marginTop: "12px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "10px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "10px",
          color: "#787582",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div>
          Total Pageviews:{" "}
          <span style={{ color: "#c9c7d0", fontWeight: 600 }}>
            {totalViews.toLocaleString()}
          </span>
        </div>
        <div style={{ color: "rgba(139, 108, 245, 0.85)", fontWeight: 600 }}>
          🛡️ Cookie-Free
        </div>
      </div>
    </div>
  );
}

export function FormForgeContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const params = new URLSearchParams();
      formData.forEach((value, key) => {
        params.append(key, value.toString());
      });
      const res = await fetch(
        "https://apnaform.sudhirdevops1.workers.dev/api/submit/endpoint_hSQ8pIPJWdphv4LunoqB4XgG",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        },
      );
      const data = (await res.json()) as any;
      if (res.ok && data.ok) {
        setSubmitted(true);
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-center">
        <h3 className="text-emerald-400 text-xl font-bold mb-2">
          ✓ Message Sent
        </h3>
        <p className="text-slate-400 text-sm">
          Thank you! Your message has been successfully received. We will get
          back to you soon. ✉️
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl text-left"
    >
      <h3 className="text-lg font-bold text-white mb-1">Contact Us</h3>
      <p className="text-xs text-slate-400 mb-4">
        Have questions? Send us a message directly!
      </p>
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="Enter email"
          disabled={submitting}
          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Message
        </label>
        <textarea
          name="message"
          required
          placeholder="Type your message here..."
          rows={4}
          disabled={submitting}
          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
        ></textarea>
      </div>
      {/* Honeypot Bot Trap */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ display: "none" }}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all"
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
