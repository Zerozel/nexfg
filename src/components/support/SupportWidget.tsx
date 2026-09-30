"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bug, Lightbulb, MessageCircle, Mail, Loader2 } from "lucide-react";
import { useSupportChat } from "@/hooks/useSupportChat";
import { ChatMessage } from "./ChatMessage";
import { useToast } from "@/components/ui/use-toast";

const WHATSAPP_NUMBER = "2349032925721";
const SUPPORT_EMAIL = "support@nexaforges.me";

type Tab = "support" | "feedback" | "contact";

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("support");
  const { toast } = useToast();

  const {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    unreadCount,
  } = useSupportChat();

  // Auto-scroll to bottom when messages change
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen && tab === "support") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, tab]);

  const [draft, setDraft] = useState("");

  const handleSend = async () => {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    try {
      await sendMessage(body);
    } catch (err: any) {
      toast({
        title: "Failed to send",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi NexaForges support, I have a question about my school."
  )}`;

  const mailHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    "Support request"
  )}`;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Open support chat"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#1a5c3a",
          color: "#ffffff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(26,92,58,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 60,
        }}
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
        {!isOpen && unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              minWidth: 20,
              height: 20,
              padding: "0 6px",
              borderRadius: 10,
              background: "#c9991a",
              color: "#0d3320",
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 88,
            right: 20,
            width: 360,
            maxWidth: "calc(100vw - 40px)",
            height: 520,
            maxHeight: "calc(100vh - 120px)",
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 14,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 60,
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              background: "#faf8f3",
            }}
          >
            <TabButton active={tab === "support"} onClick={() => setTab("support")}>
              <MessageCircle size={14} />
              Support
            </TabButton>
            <TabButton active={tab === "feedback"} onClick={() => setTab("feedback")}>
              <Lightbulb size={14} />
              Feedback
            </TabButton>
            <TabButton active={tab === "contact"} onClick={() => setTab("contact")}>
              <Mail size={14} />
              Contact
            </TabButton>
          </div>

          {/* Content */}
          {tab === "support" && (
            <>
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px 16px 8px",
                  background: "#ffffff",
                }}
              >
                {isLoading && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: 24,
                    }}
                  >
                    <Loader2 className="animate-spin text-gray-400" size={20} />
                  </div>
                )}
                {error && (
                  <div style={{ color: "#dc2626", fontSize: 13, padding: 12 }}>
                    {error}
                  </div>
                )}
                {!isLoading && !error && messages.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 32,
                      color: "#8a8a8a",
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    <MessageCircle
                      size={28}
                      style={{ margin: "0 auto 12px", opacity: 0.4 }}
                    />
                    <div style={{ marginBottom: 6, fontWeight: 600, color: "#1c1c1c" }}>
                      Talk to NexaForges
                    </div>
                    <div>Send us a message. We usually respond within a few hours.</div>
                  </div>
                )}
                {messages.map((m) => (
                  <ChatMessage key={m.id} message={m} viewerSide="school" />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div
                style={{
                  borderTop: "1px solid rgba(0,0,0,0.08)",
                  padding: 12,
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-end",
                  background: "#ffffff",
                }}
              >
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message…"
                  rows={2}
                  style={{
                    flex: 1,
                    resize: "none",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !draft.trim()}
                  style={{
                    background: "#1a5c3a",
                    color: "#ffffff",
                    border: "none",
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isSending || !draft.trim() ? "not-allowed" : "pointer",
                    opacity: isSending || !draft.trim() ? 0.5 : 1,
                  }}
                >
                  {isSending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </>
          )}

          {tab === "feedback" && (
            <FeedbackForm onDone={() => setTab("support")} />
          )}

          {tab === "contact" && (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 13, color: "#4a4a4a", lineHeight: 1.6, margin: 0 }}>
                Prefer a different channel? We&apos;re on WhatsApp and email.
              </p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  background: "#25D366",
                  color: "#ffffff",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
              <a
                href={mailHref}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  background: "#1a5c3a",
                  color: "#ffffff",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <Mail size={18} />
                Send an Email
              </a>
              <div
                style={{
                  fontSize: 12,
                  color: "#8a8a8a",
                  marginTop: 8,
                  lineHeight: 1.6,
                }}
              >
                {SUPPORT_EMAIL}
                <br />
                +234 903 292 5721
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "12px 8px",
        background: active ? "#ffffff" : "transparent",
        border: "none",
        borderBottom: active ? "2px solid #1a5c3a" : "2px solid transparent",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        color: active ? "#1a5c3a" : "#6a6a8a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

// ── Feedback form ──

function FeedbackForm({ onDone }: { onDone: () => void }) {
  const [category, setCategory] = useState<"bug" | "feature" | "general">("general");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!subject.trim() || !body.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject: subject.trim(), body: body.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to submit feedback");
      }
      toast({
        title: "Thank you",
        description: "Your feedback has been sent to NexaForges.",
      });
      setSubject("");
      setBody("");
      setCategory("general");
      onDone();
    } catch (err: any) {
      toast({
        title: "Failed to submit",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryButton = (
    value: "bug" | "feature" | "general",
    label: string,
    Icon: any
  ) => (
    <button
      key={value}
      onClick={() => setCategory(value)}
      style={{
        flex: 1,
        padding: "8px 6px",
        border: category === value ? "1.5px solid #1a5c3a" : "1px solid rgba(0,0,0,0.1)",
        background: category === value ? "rgba(26,92,58,0.05)" : "#ffffff",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600,
        color: category === value ? "#1a5c3a" : "#6a6a8a",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: 4,
        fontFamily: "inherit",
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, flex: 1, overflowY: "auto" }}>
      <p style={{ fontSize: 13, color: "#4a4a4a", margin: 0, lineHeight: 1.55 }}>
        Tell us what could be better. Your feedback goes directly to the NexaForge team.
      </p>

      <div style={{ display: "flex", gap: 6 }}>
        {categoryButton("bug", "Bug", Bug)}
        {categoryButton("feature", "Idea", Lightbulb)}
        {categoryButton("general", "Other", MessageCircle)}
      </div>

      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
        style={{
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 8,
          padding: "10px 12px",
          fontSize: 13,
          fontFamily: "inherit",
          outline: "none",
        }}
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Describe it…"
        rows={5}
        style={{
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 8,
          padding: "10px 12px",
          fontSize: 13,
          fontFamily: "inherit",
          outline: "none",
          resize: "none",
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !subject.trim() || !body.trim()}
        style={{
          background: "#1a5c3a",
          color: "#ffffff",
          border: "none",
          borderRadius: 8,
          padding: "12px 16px",
          fontSize: 13,
          fontWeight: 600,
          cursor: isSubmitting || !subject.trim() || !body.trim() ? "not-allowed" : "pointer",
          opacity: isSubmitting || !subject.trim() || !body.trim() ? 0.5 : 1,
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
        Send Feedback
      </button>
    </div>
  );
}
