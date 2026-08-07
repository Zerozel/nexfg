"use client";

import { useState } from "react";
import { COLORS, FAQ_ITEMS } from "@/lib/marketing/constants";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="section-padding"
      style={{
        background: COLORS.cream,
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              display: "inline-block",
              fontFamily: "monospace",
              fontSize: 10,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: COLORS.primary,
              background: "rgba(26,92,58,0.08)",
              padding: "5px 12px",
              borderRadius: 100,
              marginBottom: 14,
            }}
          >
            FAQ
          </div>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
              fontWeight: 700,
              color: COLORS.text,
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            Questions schools ask us.
          </h2>
          <div
            style={{
              width: 48,
              height: 3,
              background: COLORS.gold,
              borderRadius: 2,
              margin: "16px auto 24px",
            }}
          />
        </div>

        {/* FAQ Items */}
        {FAQ_ITEMS.map((faq, index) => (
          <div
            key={index}
            style={{
              borderBottom: "1px solid rgba(0,0,0,0.07)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => toggleFaq(index)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 0",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 15,
                color: COLORS.text,
                background: "none",
                border: "none",
                width: "100%",
                textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              <span>{faq.question}</span>
              <span
                style={{
                  color: COLORS.primary,
                  fontSize: 20,
                  fontWeight: 400,
                  flexShrink: 0,
                  marginLeft: 16,
                }}
              >
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <div
                style={{
                  fontSize: 14,
                  color: COLORS.textMid,
                  lineHeight: 1.75,
                  paddingBottom: 20,
                }}
              >
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
