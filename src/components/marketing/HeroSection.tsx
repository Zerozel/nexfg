"use client";

import { COLORS, HERO_STATS, FEATURE_PILLS } from "@/lib/marketing/constants";

interface HeroSectionProps {
  onScrollTo: (id: string) => void;
}

export function HeroSection({ onScrollTo }: HeroSectionProps) {
  return (
    <section
      className="section-padding"
      id="top"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: `linear-gradient(160deg, ${COLORS.primaryDeep} 0%, ${COLORS.primaryDark} 40%, #1a3a20 100%)`,
        position: "relative",
        overflow: "hidden",
        paddingTop: 68,
      }}
    >
      {/* Glow Effects */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "-5%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,153,26,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(26,92,58,0.3) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* Grid Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,0.015) 40px,rgba(255,255,255,0.015) 41px),repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(255,255,255,0.015) 60px,rgba(255,255,255,0.015) 61px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="grid-hero"
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "80px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left Content */}
        <div>
          {/* Eyebrow */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(201,153,26,0.12)",
              border: "1px solid rgba(201,153,26,0.25)",
              color: COLORS.gold,
              fontFamily: "monospace",
              fontSize: 10,
              letterSpacing: 3,
              textTransform: "uppercase",
              padding: "6px 14px",
              borderRadius: 100,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: COLORS.gold,
                animation: "pulse 2s infinite",
              }}
            />
            A TheNexaVerse Enterprise
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(2.2rem, 8vw, 3.6rem)",
              fontWeight: 700,
              color: COLORS.white,
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            We Did Not Come
            <br />
            to Manage Schools.
            <br />
            <em style={{ color: COLORS.gold, fontStyle: "italic" }}>
              We Came to Change
            </em>
            <br />
            What They Produce.
          </h1>

          {/* Description */}
          <p
            style={{
              color: "rgba(255,255,255,0.68)",
              fontSize: 17,
              lineHeight: 1.8,
              maxWidth: 560,
              marginBottom: 40,
            }}
          >
            NexaForge is the education ecosystem for African schools that refuse
            to produce students who are only good at passing exams. Software that
            runs your school. Programmes that transform your students.
          </p>

          {/* CTAs */}
          <div
            className="heroActions"
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              marginBottom: 56,
            }}
          >
            <button
              onClick={() => onScrollTo("cta")}
              style={{
                background: COLORS.gold,
                color: COLORS.primaryDark,
                fontWeight: 700,
                fontSize: 14,
                padding: "14px 28px",
                borderRadius: 8,
                cursor: "pointer",
                border: "none",
                fontFamily: "inherit",
                boxShadow: "0 4px 20px rgba(201,153,26,0.35)",
                width: "100%",
                maxWidth: "max-content",
              }}
            >
              Get Your School on NexaForge →
            </button>
            <button
              onClick={() => onScrollTo("platform")}
              style={{
                background: "transparent",
                color: COLORS.white,
                fontWeight: 600,
                fontSize: 14,
                padding: "13px 28px",
                borderRadius: 8,
                cursor: "pointer",
                border: "2px solid rgba(255,255,255,0.25)",
                fontFamily: "inherit",
                width: "100%",
                maxWidth: "max-content",
              }}
            >
              See How It Works
            </button>
          </div>

          {/* Stats */}
          <div
            className="heroStats"
            style={{ display: "flex", gap: 36, flexWrap: "wrap" }}
          >
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                style={{ textAlign: "center", minWidth: 100 }}
              >
                <div
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "2.4rem",
                    fontWeight: 700,
                    color: COLORS.white,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                  <span style={{ color: COLORS.gold }}>{stat.suffix}</span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.4)",
                    marginTop: 4,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            overflow: "hidden",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(26,92,58,0.6), rgba(201,153,26,0.2))",
              padding: "32px 28px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(201,153,26,0.2)",
                border: "1px solid rgba(201,153,26,0.35)",
                color: COLORS.gold,
                fontSize: 10,
                letterSpacing: 2,
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: 100,
                marginBottom: 14,
              }}
            >
              🏆 Live Platform
            </div>
            <div
              style={{
                fontFamily: "Georgia, serif",
                color: COLORS.white,
                fontSize: "1.3rem",
                fontWeight: 600,
                marginBottom: 8,
                lineHeight: 1.3,
              }}
            >
              Your School. Fully Operational. Today.
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: 13,
                lineHeight: 1.65,
              }}
            >
              From student registration to report cards — everything your school
              needs in one place.
            </div>
          </div>
          <div style={{ padding: "24px 28px" }}>
            {FEATURE_PILLS.map((pill) => (
              <div
                key={pill.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span style={{ fontSize: 16 }}>{pill.icon}</span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: 13,
                  }}
                >
                  {pill.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
