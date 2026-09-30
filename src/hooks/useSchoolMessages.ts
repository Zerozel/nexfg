"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

export interface SchoolMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: "teacher" | "admin";
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface SchoolConversation {
  id: string;
  teacher_user_id: string;
  status: "open" | "closed";
  last_message_at: string;
  unread_for_teacher: number;
  created_at: string;
}

interface UseSchoolMessagesReturn {
  conversation: SchoolConversation | null;
  messages: SchoolMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sendMessage: (body: string) => Promise<void>;
  unreadCount: number;
  refetch: () => Promise<void>;
}

/**
 * Teacher-side hook. Fetches (or creates) the teacher's conversation with
 * their school admin, loads messages, sends new ones, and listens for
 * realtime updates from the admin side.
 */
export function useSchoolMessages(): UseSchoolMessagesReturn {
  const [conversation, setConversation] = useState<SchoolConversation | null>(
    null
  );
  const [messages, setMessages] = useState<SchoolMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationIdRef = useRef<string | null>(null);

  const fetchConversation = useCallback(async () => {
    const res = await fetch("/api/school-messages");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to load conversation");
    }
    const result = await res.json();
    const convo: SchoolConversation = result.data.conversation;
    setConversation(convo);
    conversationIdRef.current = convo.id;
    return convo;
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    const res = await fetch(
      `/api/school-messages/thread?conversationId=${conversationId}`
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

  useEffect(() => {
    const convoId = conversationIdRef.current;
    if (!convoId) return;

    const channel = supabase
      .channel(`school-messages-${convoId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "school_messages",
          filter: `conversation_id=eq.${convoId}`,
        },
        (payload) => {
          const newMsg = payload.new as SchoolMessage;
          setMessages((prev) => {
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

  const sendMessage = useCallback(async (body: string) => {
    const convoId = conversationIdRef.current;
    setIsSending(true);
    try {
      const res = await fetch("/api/school-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convoId, body }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to send message");
      }
      const result = await res.json();
      const newMsg: SchoolMessage = result.data.message;
      setMessages((prev) =>
        prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
      );
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    conversation,
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    unreadCount: conversation?.unread_for_teacher || 0,
    refetch,
  };
}
