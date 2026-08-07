"use client";

import { useState, useEffect } from "react";
import { COLORS, NAV_LINKS } from "@/lib/marketing/constants";

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "rgba(7,26,16,0.95)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        height: 68,
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.3)" : "none",
        transition: "box-shadow 0.3s",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "0 24px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div
          onClick={() => scrollTo("top")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #c9991a 0%, #f0c840 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Georgia, serif",
              fontSize: 18,
              fontWeight: 700,
              color: COLORS.primaryDark,
              flexShrink: 0,
              boxShadow: "0 2px 12px rgba(201,153,26,0.4)",
            }}
          >
            N
          </div>
          <div style={{ color: COLORS.white }}>
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 16,
                fontWeight: 600,
                lineHeight: 1.1,
              }}
            >
              NexaForge
            </div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginTop: 2,
              }}
            >
              By TheNexaVerse
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {NAV_LINKS.map((link) => (
            <button
              key={link.sectionId}
              onClick={() => scrollTo(link.sectionId)}
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 13,
                fontWeight: 500,
                padding: "8px 14px",
                borderRadius: 6,
                cursor: "pointer",
                background: "none",
                border: "none",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = COLORS.white;
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                e.currentTarget.style.background = "none";
              }}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo("cta")}
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: 13,
              fontWeight: 500,
              padding: "9px 18px",
              borderRadius: 6,
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "none",
              fontFamily: "inherit",
              marginLeft: 4,
            }}
          >
            School Login
          </button>
          <button
            onClick={() => scrollTo("cta")}
            style={{
              background: COLORS.gold,
              color: COLORS.primaryDark,
              fontSize: 13,
              fontWeight: 700,
              padding: "9px 20px",
              borderRadius: 6,
              cursor: "pointer",
              border: "none",
              fontFamily: "inherit",
              marginLeft: 8,
              boxShadow: "0 2px 8px rgba(201,153,26,0.25)",
            }}
          >
            Get Started →
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map((link) => (
            <button
              key={link.sectionId}
              className="mobile-menu-link"
              onClick={() => scrollTo(link.sectionId)}
            >
              {link.label}
            </button>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            <button
              onClick={() => scrollTo("cta")}
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 14,
                fontWeight: 500,
                padding: "12px 18px",
                borderRadius: 6,
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "none",
                fontFamily: "inherit",
                width: "100%",
              }}
            >
              School Login
            </button>
            <button
              onClick={() => scrollTo("cta")}
              style={{
                background: COLORS.gold,
                color: COLORS.primaryDark,
                fontSize: 14,
                fontWeight: 700,
                padding: "12px 20px",
                borderRadius: 6,
                cursor: "pointer",
                border: "none",
                fontFamily: "inherit",
                width: "100%",
              }}
            >
              Get Started →
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
