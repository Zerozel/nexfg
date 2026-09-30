"use client";

interface GenericMessage {
  id: string;
  sender_role: string;
  body: string;
  created_at: string;
}

interface ChatMessageProps {
  message: GenericMessage;
  /**
   * The role of the viewer, as it appears in the message's `sender_role`
   * field. A message is "mine" when `message.sender_role === viewerSide`.
   * Examples: "school", "support", "teacher", "admin".
   */
  viewerSide: string;
}

/**
 * Map sender roles to display labels. Keeps message bubbles readable
 * regardless of which widget renders them.
 */
const SENDER_LABELS: Record<string, string> = {
  school: "School",
  support: "Support",
  teacher: "You",
  admin: "Admin",
};

export function ChatMessage({ message, viewerSide }: ChatMessageProps) {
  const isMine = message.sender_role === viewerSide;

  // For the opposite side's messages, look up a label. For same-side
  // messages we don't show a label (it's obviously "you").
  const oppositeLabel =
    SENDER_LABELS[message.sender_role] || message.sender_role;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          maxWidth: "78%",
          padding: "10px 14px",
          borderRadius: 14,
          background: isMine ? "#1a5c3a" : "#f3f4f6",
          color: isMine ? "#ffffff" : "#1c1c1c",
          fontSize: 13,
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {!isMine && (
          <div
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
              opacity: 0.6,
              marginBottom: 4,
            }}
          >
            {oppositeLabel}
          </div>
        )}
        {message.body}
        <div
          style={{
            fontSize: 10,
            opacity: 0.55,
            marginTop: 6,
            textAlign: isMine ? "right" : "left",
          }}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
