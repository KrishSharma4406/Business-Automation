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

  /* Scroll handling */
  useEffect(() => {
    const currentId = activeConversation?.id || null;
    const currentCount = activeConversation?.messages?.length || 0;

    if (currentId !== activeConvIdRef.current) {
      activeConvIdRef.current = currentId;
      prevMsgCountRef.current = currentCount;

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
    if (!window.confirm("Delete this conversation?")) return;
    setDeletingId(convId);
    try {
      const res = await fetch(`/api/ai/conversations?id=${convId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMessage(err.error || "Failed to delete conversation");
        return;
      }
      if (activeConversation?.id === convId) {
        setActiveConversation(null);
      }
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
    <div className="az-dash-page">
      <TopBar title="AI Conversations" subtitle="Chat with Autozip AI and review customer communication logs" />

      <div className="az-dash-body" style={{ flex: 1, minHeight: 0 }}>
        {/* Stats */}
        <div className="az-dash-stats">
          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">Total Conversations</span>
              <span className="az-tag az-tag-blue">Logs</span>
            </div>
            <div className="az-dash-stat-val">{conversations.length}</div>
            <div className="az-dash-stat-delta">Across all channels</div>
          </div>

          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">Active / Open</span>
              <span className="az-tag az-tag-emerald">Live</span>
            </div>
            <div className="az-dash-stat-val">
              {conversations.filter((c) => c.status.toLowerCase() === "open").length}
            </div>
            <div className="az-dash-stat-delta">
              <span className="az-status-dot" /> Ongoing sessions
            </div>
          </div>

          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">AI Automated</span>
              <span className="az-tag az-tag-emerald">Groq Engine</span>
            </div>
            <div className="az-dash-stat-val">
              {conversations.filter((c) => c.channel.toUpperCase() === "AI").length}
            </div>
            <div className="az-dash-stat-delta">Instant response rate</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="az-toolbar">
          <div className="az-toolbar-group">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--az-text-muted)", fontFamily: "var(--az-font-mono)", textTransform: "uppercase" }}>Status:</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="az-select-cyber">
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--az-text-muted)", fontFamily: "var(--az-font-mono)", textTransform: "uppercase" }}>Channel:</span>
              <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} className="az-select-cyber">
                <option value="all">All Channels</option>
                <option value="ai">AI Assistant</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>

          <button onClick={startNewConversation} className="az-btn-primary" style={{ fontSize: "12px", padding: "6px 16px" }}>
            + New AI Chat
          </button>
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div style={{ padding: "10px 14px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "4px", color: "var(--az-red)", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} style={{ background: "transparent", border: "none", color: "var(--az-red)", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>✕</button>
          </div>
        )}

        {/* Split View Container */}
        <div
          className="az-dash-card"
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            minHeight: "560px",
            height: "640px",
          }}
        >
          {/* Left Column: Conversation List */}
          <div style={{ borderRight: "1px solid var(--az-border)", display: "flex", flexDirection: "column", background: "rgba(22, 26, 32, 0.5)" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--az-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, fontFamily: "var(--az-font-mono)", color: "#ffffff", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                RECENT ({filtered.length})
              </span>
              <button
                onClick={loadConversations}
                style={{ background: "transparent", border: "none", color: "var(--az-text-muted)", fontSize: "11px", cursor: "pointer", fontFamily: "var(--az-font-mono)" }}
              >
                ↻ REFRESH
              </button>
            </div>

            <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--az-border)" }}>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="az-input-search"
                style={{ width: "100%", minWidth: "unset", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {loadingConversations ? (
                <p style={{ padding: "30px 16px", textAlign: "center", fontSize: "12px", color: "var(--az-text-muted)", fontFamily: "var(--az-font-mono)" }}>Loading conversations...</p>
              ) : filtered.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center" }}>
                  <p style={{ fontSize: "13px", color: "var(--az-text-secondary)" }}>No conversations found</p>
                  <p style={{ fontSize: "11px", color: "var(--az-text-muted)", marginTop: "6px" }}>Click &quot;+ New AI Chat&quot; to begin</p>
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
                        padding: "10px 12px",
                        borderRadius: "4px",
                        marginBottom: "6px",
                        cursor: "pointer",
                        background: isActive ? "rgba(16, 185, 129, 0.08)" : isHovered ? "rgba(255, 255, 255, 0.03)" : "transparent",
                        border: isActive ? "1px solid var(--az-emerald)" : "1px solid transparent",
                        transition: "all 0.15s ease",
                        opacity: isDeleting ? 0.4 : 1,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span className={`az-tag ${conv.channel.toUpperCase() === "AI" ? "az-tag-emerald" : "az-tag-blue"}`} style={{ fontSize: "9px", padding: "1px 5px" }}>
                          {conv.channel || "AI"}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {isHovered && (
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                              title="Delete conversation"
                              aria-label="Delete conversation"
                              style={{
                                background: "rgba(239, 68, 68, 0.15)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: "3px",
                                color: "var(--az-red)",
                                width: "20px",
                                height: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                padding: 0,
                              }}
                            >
                              ✕
                            </button>
                          )}
                          <span style={{ fontSize: "10px", color: "var(--az-text-muted)", fontFamily: "var(--az-font-mono)" }}>
                            {conv.messages?.length || 0} msgs
                          </span>
                        </div>
                      </div>
                      <p
                        title={questionTitle}
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: isActive ? "#ffffff" : "var(--az-text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginBottom: "4px",
                        }}
                      >
                        {questionTitle}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--az-text-muted)" }}>
                        <span style={{ color: conv.status.toLowerCase() === "open" ? "var(--az-emerald)" : "var(--az-text-muted)" }}>
                          ● {conv.status}
                        </span>
                        <span>{conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" }) : ""}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat Stream */}
          <div style={{ display: "flex", flexDirection: "column", background: "var(--az-bg)", minWidth: 0 }}>
            {/* Chat header */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--az-border)", background: "var(--az-surface)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ minWidth: 0, flex: 1, paddingRight: "16px" }}>
                <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {activeConversation ? (activeConversation.title || formatConversationQuestion(activeConversation)) : "New AI Session"}
                </h2>
                <span style={{ fontSize: "11px", color: "var(--az-text-muted)" }}>Autozip Business Assistant • Groq Llama 3</span>
              </div>
              {activeConversation?.status && (
                <span className="az-tag az-tag-emerald" style={{ fontSize: "10px" }}>
                  {activeConversation.status.toUpperCase()}
                </span>
              )}
            </div>

            {/* Messages Area */}
            <div ref={messagesContainerRef} style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div ref={messagesTopRef} />
              {!activeConversation || activeConversation.messages.length === 0 ? (
                <div style={{ margin: "auto", maxWidth: "480px", textAlign: "center", padding: "20px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      color: "var(--az-emerald)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px auto",
                      fontSize: "18px",
                    }}
                  >
                    ⚡
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff", marginBottom: "6px" }}>
                    AI Business Assistant
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--az-text-secondary)", lineHeight: "1.5", marginBottom: "20px" }}>
                    Ask questions about your leads, follow-up automations, customer accounts, and revenue.
                  </p>
                  <div style={{ display: "grid", gap: "8px" }}>
                    <SuggestionButton
                      onClick={() => sendMessage("Give me an overview of my current leads and who to follow up with today.")}
                      text="💡 Which leads need attention today?"
                    />
                    <SuggestionButton
                      onClick={() => sendMessage("Draft a WhatsApp follow-up message for a prospect who hasn't replied.")}
                      text="⚡ Draft a WhatsApp follow-up template"
                    />
                    <SuggestionButton
                      onClick={() => sendMessage("What automations should I set up to qualify new incoming leads?")}
                      text="🤖 Suggest automated qualification rules"
                    />
                  </div>
                </div>
              ) : (
                activeConversation.messages.map((msg, idx) => {
                  const isUser = msg.role.toLowerCase() === "user";
                  return (
                    <div key={idx} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", width: "100%" }}>
                      <div
                        style={{
                          maxWidth: isUser ? "75%" : "85%",
                          padding: isUser ? "12px 16px" : "16px 20px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          lineHeight: "1.5",
                          ...(isUser
                            ? {
                                background: "rgba(16, 185, 129, 0.15)",
                                border: "1px solid rgba(16, 185, 129, 0.35)",
                                color: "#ffffff",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                              }
                            : {
                                background: "var(--az-surface)",
                                border: "1px solid var(--az-border)",
                                color: "var(--az-text-primary)",
                              }),
                        }}
                      >
                        <div
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            fontFamily: "var(--az-font-mono)",
                            marginBottom: isUser ? "4px" : "8px",
                            color: isUser ? "var(--az-emerald)" : "var(--az-text-muted)",
                            textTransform: "uppercase",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {!isUser && <span className="az-status-dot" />}
                          {isUser ? "You" : "Autozip AI"}
                        </div>
                        {isUser ? msg.content : <AIMessageRenderer content={msg.content} />}
                      </div>
                    </div>
                  );
                })
              )}

              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      padding: "12px 18px",
                      borderRadius: "6px",
                      background: "var(--az-surface)",
                      border: "1px solid var(--az-border)",
                      fontSize: "12px",
                      color: "var(--az-text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span className="az-status-dot" />
                    <span>Autozip AI is analyzing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--az-border)", background: "var(--az-surface)" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question or type a message... (Press Enter to send)"
                  rows={2}
                  disabled={loading}
                  style={{
                    flex: 1,
                    resize: "none",
                    borderRadius: "4px",
                    border: "1px solid var(--az-border)",
                    background: "#15181e",
                    color: "#ffffff",
                    padding: "10px 12px",
                    fontSize: "13px",
                    outline: "none",
                    fontFamily: "inherit",
                    lineHeight: "1.4",
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="az-btn-primary"
                  style={{
                    padding: "0 20px",
                    height: "44px",
                    fontSize: "12px",
                    opacity: !input.trim() || loading ? 0.5 : 1,
                    cursor: !input.trim() || loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "..." : "Send"}
                </button>
              </div>
              <div style={{ marginTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--az-text-muted)", fontFamily: "var(--az-font-mono)" }}>
                <span>Shift + Enter for new line • Enter to send</span>
                <span>Powered by Groq LLM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestionButton({ onClick, text }: { onClick: () => void; text: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: "4px",
        border: "1px solid var(--az-border)",
        background: "var(--az-surface)",
        color: "var(--az-text-primary)",
        fontSize: "12px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--az-emerald)";
        e.currentTarget.style.color = "#ffffff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--az-border)";
        e.currentTarget.style.color = "var(--az-text-primary)";
      }}
    >
      {text}
    </button>
  );
}