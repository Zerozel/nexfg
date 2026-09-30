"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

export interface SupportMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: "school" | "support";
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface SupportConversation {
  id: string;
  school_id: string;
  admin_user_id: string;
  status: "open" | "closed";
  last_message_at: string;
  unread_for_school: number;
  created_at: string;
}

interface UseSupportChatReturn {
  conversation: SupportConversation | null;
  messages: SupportMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sendMessage: (body: string) => Promise<void>;
  unreadCount: number;
  refetch: () => Promise<void>;
}

/**
 * School-side hook. Fetches (or creates) the current school's support
 * conversation, loads its messages, sends new ones, and listens for
 * realtime updates from the support side.
 */
export function useSupportChat(): UseSupportChatReturn {
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationIdRef = useRef<string | null>(null);

  const fetchConversation = useCallback(async () => {
    const res = await fetch("/api/support/conversations");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to load conversation");
    }
    const result = await res.json();
    const convo: SupportConversation = result.data.conversation;
    setConversation(convo);
    conversationIdRef.current = convo.id;
    return convo;
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    const res = await fetch(
      `/api/support/messages?conversationId=${conversationId}`
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to load messages");
    }
    const result = await res.json();
    setMessages(result.data.messages || []);
  }, []);

  const refetch = useCallback(async () => {
    try {
      const convo = await fetchConversation();
      await fetchMessages(convo.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [fetchConversation, fetchMessages]);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const convo = await fetchConversation();
        if (cancelled) return;
        await fetchMessages(convo.id);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchConversation, fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    const convoId = conversationIdRef.current;
    if (!convoId) return;

    const channel = supabase
      .channel(`support-messages-${convoId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${convoId}`,
        },
        (payload) => {
          const newMsg = payload.new as SupportMessage;
          setMessages((prev) => {
            // Guard against duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation?.id]);

  const sendMessage = useCallback(
    async (body: string) => {
      const convoId = conversationIdRef.current;
      if (!convoId) throw new Error("No conversation");

      setIsSending(true);
      try {
        const res = await fetch("/api/support/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: convoId, body }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to send message");
        }
        const result = await res.json();
        const newMsg: SupportMessage = result.data.message;
        setMessages((prev) =>
          prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
        );
      } finally {
        setIsSending(false);
      }
    },
    []
  );

  return {
    conversation,
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    unreadCount: conversation?.unread_for_school || 0,
    refetch,
  };
}
