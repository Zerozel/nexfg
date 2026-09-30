"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ChatMessage } from "@/components/support/ChatMessage";
import { useToast } from "@/components/ui/use-toast";

interface ConversationSummary {
  id: string;
  school_id: string;
  school_name: string;
  admin_user_id: string;
  status: "open" | "closed";
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export default function SuperAdminSupportPage() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [draft, setDraft] = useState("");

  const endRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch("/api/support/conversations");
      if (!res.ok) throw new Error("Failed to load conversations");
      const result = await res.json();
      setConversations(result.data.conversations || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingList(false);
    }
  }, [toast]);

  const loadThread = useCallback(
    async (conversationId: string) => {
      setIsLoadingThread(true);
      try {
        const res = await fetch(
          `/api/support/messages?conversationId=${conversationId}`
        );
        if (!res.ok) throw new Error("Failed to load messages");
        const result = await res.json();
        setMessages(result.data.messages || []);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsLoadingThread(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeId) loadThread(activeId);
  }, [activeId, loadThread]);

  // Realtime: new messages in the active thread
  useEffect(() => {
    if (!activeId) return;
    const channel = supabase
      .channel(`super-admin-support-${activeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${activeId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
          );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId]);

  // Auto-scroll thread
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || !activeId) return;
    setDraft("");
    setIsSending(true);
    try {
      const res = await fetch("/api/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeId, body }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to send");
      }
      const result = await res.json();
      const newMsg: Message = result.data.message;
      setMessages((prev) =>
        prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
      );
    } catch (err: any) {
      toast({
        title: "Failed to send",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const activeConvo = conversations.find((c) => c.id === activeId);

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-lg border bg-white overflow-hidden">
      {/* Left: conversation list */}
      <div className="w-[320px] border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold">Support Chats</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {conversations.length} conversation
            {conversations.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingList ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-4 text-sm text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              No conversations yet.
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left p-4 border-b transition-colors hover:bg-gray-50 ${
                  activeId === c.id ? "bg-green-50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">
                      {c.school_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(c.last_message_at).toLocaleDateString()}
                    </div>
                  </div>
                  {c.unread_count > 0 && (
                    <span className="flex-shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
                      {c.unread_count}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: thread */}
      <div className="flex-1 flex flex-col">
        {!activeConvo ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
            Select a conversation to view messages.
          </div>
        ) : (
          <>
            <div className="p-4 border-b">
              <div className="font-semibold">{activeConvo.school_name}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Status: {activeConvo.status}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingThread ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  No messages yet.
                </div>
              ) : (
                messages.map((m) => (
                  <ChatMessage key={m.id} message={m} viewerSide="support" />
                ))
              )}
              <div ref={endRef} />
            </div>

            <div className="border-t p-3 flex gap-2 items-end">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Reply…"
                rows={2}
                className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/30"
              />
              <button
                onClick={handleSend}
                disabled={isSending || !draft.trim()}
                className="h-10 w-10 rounded-lg bg-green-700 text-white flex items-center justify-center disabled:opacity-50"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
