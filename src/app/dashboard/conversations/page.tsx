"use client";

import { useEffect, useRef, useState } from "react";
import TopBar from "@/src/components/top-bar";
import { Icon } from "@/src/components/ui/icon";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

type Conversation = {
  id: string;
  title?: string;
  channel: string;
  status: string;
  messages: Message[];
  createdAt: string;
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations() {
    try {
      setLoadingList(true);
      const res = await fetch("/api/ai/conversations");
      if (res.ok) {
        const data = await res.json();
        const list = data.conversations || [];
        setConversations(list);
        if (list.length > 0 && !activeConv) {
          setActiveConv(list[0]);
          setMessages(list[0].messages || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  }

  const handleSelectConv = (c: Conversation) => {
    setActiveConv(c);
    setMessages(c.messages || []);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConv?.id,
          messages: updated,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          role: "assistant",
          content: data.reply || "Analysis completed with no output.",
        };
        setMessages([...updated, assistantMsg]);
        loadConversations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveConv(null);
    setMessages([
      {
        role: "assistant",
        content:
          "Hello, I am Autozip AI. I have full context of your leads, customers, and active automations. What business questions or operational automations would you like to explore?",
      },
    ]);
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#f8fafc",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <TopBar
        title="AI Omnichannel Co-Pilot"
        subtitle="Context-aware business operations assistant trained on your live leads and automations."
        actions={
          <button
            onClick={handleNewChat}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#0284c7",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "7px 14px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Icon name="plus" size={14} strokeWidth={2.5} />
            New Conversation
          </button>
        }
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Conversation List Drawer */}
        <div
          style={{
            width: "300px",
            borderRight: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", fontSize: "12px", fontWeight: 700, color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Recent Sessions
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {conversations.length === 0 ? (
              <div style={{ padding: "24px 12px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                No past sessions
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = activeConv?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectConv(c)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: isSelected ? "rgba(56, 189, 248, 0.12)" : "transparent",
                      color: isSelected ? "#0284c7" : "#334155",
                      cursor: "pointer",
                      marginBottom: "4px",
                      transition: "all 0.12s ease",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: isSelected ? 600 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.title || "Operations Consultation"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px" }}>
                      {c.messages?.length || 0} messages
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Chat Box */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#f8fafc" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "75%",
                        padding: "14px 18px",
                        borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                        backgroundColor: isUser ? "#0284c7" : "#ffffff",
                        color: isUser ? "#ffffff" : "#0f172a",
                        border: isUser ? "none" : "1px solid #e2e8f0",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                        fontSize: "13.5px",
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      padding: "12px 18px",
                      borderRadius: "12px 12px 12px 2px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    Analyzing database context & synthesizing recommendation...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Box Footer */}
          <div style={{ padding: "16px 32px 24px", borderTop: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <form onSubmit={handleSendMessage} style={{ maxWidth: "800px", margin: "0 auto", display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Ask about your leads, conversion rates, or design an automation rule..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13.5px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  backgroundColor: "#0284c7",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
