"use client";

import TopBar from "@/src/components/top-bar";
import AIMessageRenderer from "@/src/components/ai-message-renderer";
import { useEffect, useRef, useState } from "react";
import { formatConversationQuestion } from "@/src/lib/format-conversation-question";

type Message = {
  role: string;
  content: string;
};

type Conversation = {
  id: string;
  title?: string;
  channel: string;
  status: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesTopRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeConvIdRef = useRef<string | null>(null);
  const prevMsgCountRef = useRef<number>(0);

  useEffect(() => {
    loadConversations();
  }, []);

  /* Scroll handling:
     - When switching or selecting a conversation, always start at the top.
     - Only scroll to bottom when a NEW message is added to the active conversation.
  */
  useEffect(() => {
    const currentId = activeConversation?.id || null;
    const currentCount = activeConversation?.messages?.length || 0;

    // Check if the user selected or switched conversation
    if (currentId !== activeConvIdRef.current) {
      activeConvIdRef.current = currentId;
      prevMsgCountRef.current = currentCount;

      // Start from top of the page/chat
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = 0;
      }
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = 0;
        }
      });
      return;
    }

    // Same conversation: scroll down only when new message is sent/received
    if (currentCount > prevMsgCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMsgCountRef.current = currentCount;
  }, [activeConversation?.id, activeConversation?.messages?.length, loading]);

  async function loadConversations() {
    try {
      setLoadingConversations(true);
      setErrorMessage(null);
      const response = await fetch("/api/ai/conversations");
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setErrorMessage(err.error || "Failed to load conversations");
        return;
      }
      const data = await response.json();
      const list: Conversation[] = (data.conversations || []).map((c: any) => ({
        ...c,
        messages: Array.isArray(c.messages) ? c.messages : [],
      }));
      setConversations(list);
      setActiveConversation((cur) => {
        if (!cur && list.length > 0) return list[0];
        if (cur) return list.find((c) => c.id === cur.id) || cur;
        return cur;
      });
    } catch {
      setErrorMessage("Failed to load conversations");
    } finally {
      setLoadingConversations(false);
    }
  }

  function startNewConversation() {
    setActiveConversation(null);
    setInput("");
    setErrorMessage(null);
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }

  function selectConversation(conv: Conversation) {
    setActiveConversation(conv);
    /* Ensure chat starts from top of page when selecting previous chat */
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = 0;
      }
    }, 10);
  }

  async function deleteConversation(convId: string) {
    if (deletingId) return;
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
    setDeletingId(convId);
    try {
      const res = await fetch(`/api/ai/conversations?id=${convId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMessage(err.error || "Failed to delete conversation");
        return;
      }
      /* If we deleted the active conversation, clear it */
      if (activeConversation?.id === convId) {
        setActiveConversation(null);
      }
      /* Remove from local list */
      setConversations((prev) => prev.filter((c) => c.id !== convId));
    } catch {
      setErrorMessage("Failed to delete conversation");
    } finally {
      setDeletingId(null);
    }
  }

  async function sendMessage(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setLoading(true);
    setErrorMessage(null);

    const userMsg: Message = { role: "user", content: msg };

    setActiveConversation((cur) => {
      if (!cur) return { id: "", channel: "AI", status: "open", messages: [userMsg], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      return { ...cur, messages: [...cur.messages, userMsg] };
    });

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConversation?.id || undefined, message: msg }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to send message");
        setActiveConversation((cur) => cur ? { ...cur, messages: [...cur.messages, { role: "assistant", content: `⚠️ ${data.error || "Error sending message"}` }] } : cur);
        return;
      }
      setActiveConversation((cur) => cur ? { ...cur, id: data.conversationId || cur.id, messages: [...cur.messages, { role: "assistant", content: data.message }] } : cur);
      await loadConversations();
    } catch {
      setErrorMessage("Network error");
      setActiveConversation((cur) => cur ? { ...cur, messages: [...cur.messages, { role: "assistant", content: "⚠️ Network error. Please try again." }] } : cur);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const filtered = conversations
    .filter((c) => statusFilter === "all" || c.status.toLowerCase() === statusFilter)
    .filter((c) => channelFilter === "all" || c.channel.toLowerCase() === channelFilter)
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = (c.title || formatConversationQuestion(c)).toLowerCase();
      const hasMatchInTitle = title.includes(q);
      const hasMatchInMessages = c.messages?.some((m) => m.content?.toLowerCase().includes(q));
      const hasMatchInChannel = c.channel?.toLowerCase().includes(q);
      const hasMatchInId = c.id?.toLowerCase().includes(q);
      return hasMatchInTitle || hasMatchInMessages || hasMatchInChannel || hasMatchInId;
    });

  return (
    <>
      <TopBar title="Conversations" subtitle="Manage customer conversations and AI responses" />

      <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
          <StatCard label="Total Conversations" value={String(conversations.length)} />
          <StatCard label="Open" value={String(conversations.filter((c) => c.status.toLowerCase() === "open").length)} />
          <StatCard label="AI Handled" value={String(conversations.filter((c) => c.channel.toUpperCase() === "AI").length)} />
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={[{ value: "all", label: "All" }, { value: "open", label: "Open" }, { value: "closed", label: "Closed" }]} />
            <FilterSelect label="Channel" value={channelFilter} onChange={setChannelFilter} options={[{ value: "all", label: "All" }, { value: "ai", label: "AI" }, { value: "email", label: "Email" }, { value: "whatsapp", label: "Slack" }]} />
          </div>
          <button onClick={startNewConversation} style={{ padding: "7px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--accent)", background: "var(--accent)", color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
            + New Conversation
          </button>
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div style={{ padding: "10px 14px", marginBottom: "16px", background: "var(--red-subtle)", border: "1px solid var(--red)", borderRadius: "var(--radius-md)", color: "var(--red)", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} style={{ background: "transparent", border: "none", color: "var(--red)", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>×</button>
          </div>
        )}

        {/* Split view */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "500px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>

          {/* Left: conversation list */}
          <div style={{ borderRight: "1px solid var(--border-default)", display: "flex", flexDirection: "column", background: "var(--bg-sidebar)" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>Recent ({filtered.length})</span>
              <button onClick={loadConversations} style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer" }}>↻ Refresh</button>
            </div>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-default)" }}>
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {loadingConversations ? (
                <p style={{ padding: "30px 16px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>Loading...</p>
              ) : filtered.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center" }}>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No conversations found.</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>Click &quot;+ New Conversation&quot; to start chatting.</p>
                </div>
              ) : (
                filtered.map((conv) => {
                  const isActive = activeConversation?.id === conv.id;
                  const isHovered = hoveredConversation === conv.id;
                  const isDeleting = deletingId === conv.id;
                  const questionTitle = conv.title || formatConversationQuestion(conv);
                  return (
                    <div
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      onMouseEnter={() => setHoveredConversation(conv.id)}
                      onMouseLeave={() => setHoveredConversation(null)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "var(--radius-md)",
                        marginBottom: "6px",
                        cursor: "pointer",
                        background: isActive ? "var(--bg-surface-hover)" : isHovered ? "rgba(255,255,255,0.03)" : "transparent",
                        border: isActive ? "1px solid var(--border-active)" : "1px solid transparent",
                        transition: "all 0.15s ease",
                        position: "relative",
                        opacity: isDeleting ? 0.5 : 1,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 6px", borderRadius: "var(--radius-sm)", background: "var(--accent-subtle)", color: "var(--accent)", textTransform: "uppercase" }}>{conv.channel || "AI"}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {isHovered && (
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                              title="Delete conversation"
                              aria-label="Delete conversation"
                              style={{
                                background: "var(--red-subtle)",
                                border: "1px solid transparent",
                                borderRadius: "var(--radius-sm)",
                                color: "var(--red)",
                                width: "22px",
                                height: "22px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                padding: 0,
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "var(--red)";
                                (e.currentTarget as HTMLElement).style.color = "#fff";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "var(--red-subtle)";
                                (e.currentTarget as HTMLElement).style.color = "var(--red)";
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          )}
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{conv.messages?.length || 0} msgs</span>
                        </div>
                      </div>
                      <p title={questionTitle} style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "4px" }}>{questionTitle}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)" }}>
                        <span style={{ color: conv.status.toLowerCase() === "open" ? "var(--green)" : "var(--text-muted)" }}>● {conv.status}</span>
                        <span>{conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" }) : ""}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: chat */}
          <div style={{ display: "flex", flexDirection: "column", background: "var(--bg-app)" }}>
            {/* Chat header */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border-default)", background: "var(--bg-surface)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{activeConversation ? (activeConversation.title || formatConversationQuestion(activeConversation)) : "New AI Chat"}</h2>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Autozip AI Business Assistant</span>
              </div>
              {activeConversation?.status && (
                <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "var(--radius-sm)", background: "var(--green-subtle)", color: "var(--green)", textTransform: "uppercase" }}>{activeConversation.status}</span>
              )}
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div ref={messagesTopRef} />
              {!activeConversation || activeConversation.messages.length === 0 ? (
                <div style={{ margin: "auto", maxWidth: "460px", textAlign: "center", padding: "20px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--accent-subtle)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", fontSize: "20px" }}>⚡</div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>AI Business Assistant</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "20px" }}>Ask questions about your leads, customers, automations, and operations.</p>
                  <div style={{ display: "grid", gap: "8px" }}>
                    <SuggestionButton onClick={() => sendMessage("Give me an overview of my current leads and how to qualify them.")} text='💡 "Give me an overview of my current leads"' />
                    <SuggestionButton onClick={() => sendMessage("What automations should I set up to respond to incoming customers?")} text='⚡ "What automations should I set up?"' />
                  </div>
                </div>
              ) : (
                activeConversation.messages.map((msg, idx) => {
                  const isUser = msg.role.toLowerCase() === "user";
                  return (
                    <div key={idx} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", width: "100%", animation: "fadeIn 0.3s ease" }}>
                      <div style={{ maxWidth: isUser ? "75%" : "85%", padding: isUser ? "12px 16px" : "16px 20px", borderRadius: "var(--radius-lg)", fontSize: "13px", lineHeight: "1.5", ...(isUser ? { background: "var(--accent)", color: "#fff", borderBottomRightRadius: "2px", whiteSpace: "pre-wrap", wordBreak: "break-word" } : { background: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)", borderBottomLeftRadius: "2px" }) }}>
                        <div style={{ fontSize: "10px", fontWeight: 600, marginBottom: isUser ? "4px" : "10px", color: isUser ? "rgba(255,255,255,0.75)" : "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                          {!isUser && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />}
                          {isUser ? "You" : "Autozip AI"}
                        </div>
                        {isUser ? msg.content : <AIMessageRenderer content={msg.content} />}
                      </div>
                    </div>
                  );
                })
              )}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start", animation: "fadeIn 0.3s ease" }}>
                  <div style={{ padding: "14px 18px", borderRadius: "var(--radius-lg)", background: "var(--bg-surface)", border: "1px solid var(--border-default)", fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", animation: "pulse 1.4s ease-in-out infinite", animationDelay: "0s" }} />
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", animation: "pulse 1.4s ease-in-out infinite", animationDelay: "0.2s" }} />
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", animation: "pulse 1.4s ease-in-out infinite", animationDelay: "0.4s" }} />
                    </span>
                    <span>Autozip AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-default)", background: "var(--bg-surface)" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask your AI business assistant... (Enter to send)" rows={2} disabled={loading} style={{ flex: 1, resize: "none", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--bg-input)", color: "var(--text-primary)", padding: "10px 12px", fontSize: "13px", outline: "none", fontFamily: "inherit", lineHeight: "1.4" }} />
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{ padding: "10px 20px", borderRadius: "var(--radius-md)", border: "none", background: "var(--accent)", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: !input.trim() || loading ? "not-allowed" : "pointer", opacity: !input.trim() || loading ? 0.6 : 1, height: "44px" }}>
                  {loading ? "..." : "Send"}
                </button>
              </div>
              <div style={{ marginTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
                <span>Press Enter to send. Shift + Enter for a new line.</span>
                <span>Powered by Groq</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: "18px 20px" }}>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>{label}</p>
      <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>{value}</p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: "6px 10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: "12px", outline: "none" }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function SuggestionButton({ onClick, text }: { onClick: () => void; text: string }) {
  return (
    <button onClick={onClick} style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--bg-surface)", color: "var(--text-primary)", fontSize: "12px", cursor: "pointer", textAlign: "left" }}>
      {text}
    </button>
  );
}