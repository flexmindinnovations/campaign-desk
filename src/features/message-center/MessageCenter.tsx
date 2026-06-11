import * as React from "react";
import { Search, Send, Smartphone, Wifi, WifiOff, Loader2, Plus, X, Sparkles, FileText, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../../components/ui/Card";
import { cn } from "../../components/ui/utils";
import { useChatStore } from "../../store/chatStore";
import { useStore } from "../../store/useStore";
import type { ConversationMessage } from "../../types/database";
import { BASE_URL } from "../../appConstant";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}

function formatTime(iso: string): string {
  // Ensure the browser treats the timestamp as UTC (backend stores UTC without 'Z').
  const normalized = iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
  return new Date(normalized).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatRelative(iso: string): string {
  const normalized = iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
  const diff = Date.now() - new Date(normalized).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getInitials(phone: string, name?: string): string {
  if (name) return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return phone.slice(-2);
}

// Renders WhatsApp-style markdown: *bold*, line breaks.
function renderMarkdown(text: string): React.ReactNode {
  return text.split("\n").map((line, lineIdx) => {
    const segments = line.split(/(\*[^*\n]+\*)/g).map((seg, i) => {
      if (seg.startsWith("*") && seg.endsWith("*") && seg.length > 2) {
        return <strong key={i} className="font-semibold">{seg.slice(1, -1)}</strong>;
      }
      return seg || null;
    });
    return (
      <React.Fragment key={lineIdx}>
        {lineIdx > 0 && <br />}
        {segments}
      </React.Fragment>
    );
  });
}

// ── WS banner ────────────────────────────────────────────────────────────────

function WsStatusBanner({ status }: { status: string }) {
  if (status === "connected") return null;
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 py-1.5 text-[11px] font-semibold",
        status === "reconnecting"
          ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
      )}
    >
      {status === "reconnecting" ? (
        <><Loader2 size={11} className="animate-spin" /> Reconnecting…</>
      ) : (
        <><WifiOff size={11} /> Disconnected</>
      )}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
// role=user  → RIGHT (you sent this message)
// role=assistant → LEFT (AI replied)

function MessageBubble({ msg }: { msg: ConversationMessage }) {
  const isSent = msg.role === "user";
  const isPdf = msg.content.startsWith("📎 ") && msg.content.endsWith(".pdf");

  // Parse "📎 {id}:{name}.pdf" (new) or "📎 {name}.pdf" (legacy)
  const rawPdfContent = isPdf ? msg.content.slice(3) : ""; // strip "📎 "
  const idMatch = rawPdfContent.match(/^(\d+):(.*)/);
  const invoiceId = idMatch ? parseInt(idMatch[1]) : null;
  const pdfName = idMatch ? idMatch[2] : rawPdfContent;

  const openPdf = () => {
    if (invoiceId) window.open(`${BASE_URL}/invoices/${invoiceId}/pdf`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={cn("flex w-full items-end gap-1.5", isSent ? "justify-end" : "justify-start")}
    >
      {!isSent && (
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mb-1">
          <Sparkles size={11} className="text-white" />
        </div>
      )}

      <div
        className={cn(
          "max-w-xs sm:max-w-sm lg:max-w-md rounded-2xl text-sm relative shadow-sm",
          isPdf
            ? "bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-bl-sm overflow-hidden"
            : isSent
              ? "px-3.5 py-2 bg-[#dcf8c6] text-slate-900 rounded-br-sm dark:bg-[#005c4b] dark:text-slate-100"
              : "px-3.5 py-2 bg-white text-slate-900 rounded-bl-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
        )}
      >
        {isPdf ? (
          /* PDF attachment bubble */
          <>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{pdfName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">PDF Document</p>
              </div>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-700 px-3 py-1.5 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">{formatTime(msg.created_at)}</span>
              {invoiceId && (
                <button
                  type="button"
                  onClick={openPdf}
                  className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 cursor-pointer transition-colors"
                >
                  <ExternalLink size={10} />
                  Open
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="leading-relaxed break-words pr-12">{renderMarkdown(msg.content)}</p>
            <span className={cn(
              "absolute right-3 bottom-1.5 text-[10px] font-mono select-none",
              isSent ? "text-emerald-700/60 dark:text-emerald-300/50" : "text-slate-400"
            )}>
              {formatTime(msg.created_at)}
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ── Contact picker ────────────────────────────────────────────────────────────

function ContactPicker({ onSelect, onClose }: { onSelect: (phone: string) => void; onClose: () => void }) {
  const contacts = useStore((s) => s.contacts);
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = contacts.filter((c) => {
    const lq = q.toLowerCase();
    return c.name.toLowerCase().includes(lq) || c.phone.includes(lq);
  });

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 mx-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
        <Search size={12} className="text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search contacts…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 text-xs bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
        />
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X size={12} />
        </button>
      </div>
      <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/40">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            {contacts.length === 0 ? "No contacts synced." : "No matches."}
          </p>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { onSelect(c.phone); onClose(); }}
              className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                {getInitials(c.phone, c.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{c.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{formatPhone(c.phone)}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function MessageCenter() {
  const { conversations, messages, activePhone, wsStatus, setActivePhone, sendMessage, loadConversations } = useChatStore();
  const contacts = useStore((s) => s.contacts);

  const [search, setSearch] = React.useState("");
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [showPicker, setShowPicker] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const pickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { loadConversations(); }, [loadConversations]);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activePhone]);

  React.useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker]);

  const resolvedName = (phone: string) =>
    contacts.find((c) => c.phone === phone || c.phone === phone.replace(/^\+/, ""))?.name;

  const filtered = conversations.filter((c) => {
    const name = resolvedName(c.contact_phone) ?? "";
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || c.contact_phone.includes(q);
  });

  const activeMessages = (activePhone ? (messages[activePhone] ?? []) : [])
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !activePhone || sending) return;
    const text = draft.trim();
    setDraft("");
    setSending(true);
    try {
      await sendMessage(activePhone, text);
    } catch {
      setDraft(text);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-100px)] flex flex-col">
      <Card className="flex-1 flex overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 flex-col">
        <WsStatusBanner status={wsStatus} />

        <div className="flex flex-1 overflow-hidden">

          {/* ── Conversation list ─────────────────────────────────────────── */}
          <div className="w-[280px] border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
            <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Chats</h3>
                <div className="flex items-center gap-2">
                  <span className={cn("flex items-center gap-1 text-[10px] font-semibold", wsStatus === "connected" ? "text-emerald-600" : "text-slate-400")}>
                    {wsStatus === "connected" ? <Wifi size={10} /> : <WifiOff size={10} />}
                    {wsStatus === "connected" ? "Live" : "Offline"}
                  </span>
                  <div className="relative" ref={pickerRef}>
                    <button
                      type="button"
                      title="New chat"
                      onClick={() => setShowPicker((v) => !v)}
                      className="w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                    {showPicker && (
                      <ContactPicker
                        onSelect={(phone) => setActivePhone(phone)}
                        onClose={() => setShowPicker(false)}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 text-slate-400" size={12} />
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10">
                  {conversations.length === 0 ? "No chats yet." : "No matches."}
                </p>
              ) : (
                filtered.map((conv) => {
                  const name = resolvedName(conv.contact_phone);
                  const isActive = activePhone === conv.contact_phone;
                  const unread = conv.last_role === "user";
                  return (
                    <button
                      key={conv.contact_phone}
                      type="button"
                      onClick={() => setActivePhone(conv.contact_phone)}
                      className={cn(
                        "w-full text-left px-4 py-3 flex items-center gap-3 border-b border-slate-50 dark:border-slate-800/40 transition-colors",
                        isActive ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                        isActive ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      )}>
                        {getInitials(conv.contact_phone, name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={cn("text-xs truncate", unread ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300")}>
                            {name ?? formatPhone(conv.contact_phone)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono shrink-0 ml-1">
                            {formatRelative(conv.last_message_at)}
                          </span>
                        </div>
                        <p className={cn("text-[11px] truncate mt-0.5", unread ? "text-slate-600 dark:text-slate-300 font-medium" : "text-slate-400")}>
                          {conv.last_role === "assistant" && "🤖 "}
                          {conv.last_message}
                        </p>
                      </div>
                      {unread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Chat window ───────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0">
            {activePhone ? (
              <>
                {/* Header */}
                <div className="h-[60px] px-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {getInitials(activePhone, resolvedName(activePhone))}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {resolvedName(activePhone) ?? formatPhone(activePhone)}
                    </p>
                    <p className="text-[10px] text-emerald-500 font-medium">AI-powered assistant</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 chat-bg">
                  <AnimatePresence initial={false}>
                    {activeMessages.map((msg) => (
                      <MessageBubble key={msg.id} msg={msg} />
                    ))}
                  </AnimatePresence>
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <form
                  onSubmit={handleSend}
                  className="px-3 py-3 flex items-end gap-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0"
                >
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder={wsStatus !== "connected" ? "Connecting…" : "Type a message"}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={wsStatus !== "connected" || sending}
                    className="flex-1 resize-none px-4 py-2.5 text-sm rounded-3xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed max-h-32 overflow-y-auto"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || wsStatus !== "connected" || sending}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0",
                      draft.trim() && wsStatus === "connected" && !sending
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md cursor-pointer"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 chat-bg select-none">
                <div className="w-20 h-20 rounded-full bg-white/80 dark:bg-slate-800/80 flex items-center justify-center shadow-sm">
                  <Smartphone size={32} className="text-slate-300 dark:text-slate-600" />
                </div>
                <div className="text-center bg-white/70 dark:bg-slate-900/70 px-6 py-3 rounded-2xl">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select a chat</p>
                  <p className="text-xs text-slate-400 mt-1">
                    or tap <strong className="text-emerald-500">+</strong> to start a new one
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </Card>
    </div>
  );
}
