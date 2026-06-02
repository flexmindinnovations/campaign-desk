import * as React from "react";
import { useStore } from "../../store/useStore";
import { 
  Search, 
  Send, 
  Smartphone,
  MoreVertical,
  CheckCheck,
  Check,
  Bot
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatDate } from "../../components/ui/utils";
import { cn } from "../../components/ui/utils";

export function MessageCenter() {
  const contacts = useStore(state => state.contacts);
  const messages = useStore(state => state.messages);
  const campaigns = useStore(state => state.campaigns);
  const activeChatContactId = useStore(state => state.activeChatContactId);
  const setActiveChatContactId = useStore(state => state.setActiveChatContactId);
  const sendChatMessage = useStore(state => state.sendChatMessage);

  const [chatSearch, setChatSearch] = React.useState("");
  const [typedMessage, setTypedMessage] = React.useState("");
  const [isTypingSimulated, setIsTypingSimulated] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  const activeContact = contacts.find(c => c.id === activeChatContactId);

  // Auto scroll to chat bottom
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatContactId, isTypingSimulated]);

  // Handle support response typing indicator simulation
  React.useEffect(() => {
    // Watch messages for the last sent message (to trigger typing state for simulated reply)
    const activeMessages = messages.filter(m => m.contact_id === activeChatContactId);
    if (activeMessages.length === 0) return;
    const lastMsg = activeMessages[activeMessages.length - 1];
    
    // special chat inbox and not incoming
    if (lastMsg.campaign_id === 9999 && lastMsg.delivery_status === 'sent') {
      setIsTypingSimulated(true);
      const timer = setTimeout(() => {
        setIsTypingSimulated(false);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [messages, activeChatContactId]);

  // List of active conversations
  const conversations = contacts.map(c => {
    const contactMessages = messages.filter(m => m.contact_id === c.id);
    const lastMsg = contactMessages.length > 0
      ? contactMessages[contactMessages.length - 1]
      : null;
      
    // Fetch body text if chat message
    let lastMsgText = "No previous messages.";
    if (lastMsg) {
      if (lastMsg.campaign_id === 9999) {
        lastMsgText = localStorage.getItem(`chat_body_${lastMsg.whatsapp_message_id}`) || "Image or Template File";
      } else {
        lastMsgText = `Template: ${lastMsg.whatsapp_message_id ? 'Fired approved template' : 'Pending dispatch'}`;
      }
    }

    return {
      contact: c,
      lastMsg,
      lastMsgText
    };
  }).filter(conv => 
    conv.contact.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
    conv.contact.phone.includes(chatSearch)
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChatContactId) return;

    sendChatMessage(activeChatContactId, typedMessage.trim());
    setTypedMessage("");
  };

  const getChatTicks = (status: string) => {
    switch (status) {
      case 'read':
        return <CheckCheck size={14} className="text-emerald-500 font-extrabold" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-slate-400 font-extrabold" />;
      case 'sent':
        return <Check size={14} className="text-slate-400 font-extrabold" />;
      default:
        return <Check size={12} className="text-slate-300" />;
    }
  };

  const activeChatMessages = activeChatContactId
    ? messages.filter(m => m.contact_id === activeChatContactId)
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col font-sans">
      
      {/* Messaging console grid container */}
      <Card className="flex-1 flex overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
        
        {/* Left column: Conversation threads search & list */}
        <div className="w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
          {/* Thread Search Box */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-display mb-3">Support Inbox</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search chats..."
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Conversations scroll list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-850/30">
            {conversations.length > 0 ? (
              conversations.map((conv) => {
                const isActive = activeChatContactId === conv.contact.id;
                
                return (
                  <div
                    key={conv.contact.id}
                    onClick={() => setActiveChatContactId(conv.contact.id)}
                    className={cn(
                      "p-3.5 flex items-start gap-3 cursor-pointer transition-colors duration-150 select-none",
                      isActive
                        ? "bg-emerald-500/5 border-l-4 border-emerald-500 dark:bg-emerald-500/10"
                        : "hover:bg-slate-50/50 dark:hover:bg-slate-900/30 border-l-4 border-transparent"
                    )}
                  >
                    {/* User Avatar node */}
                    <div className="w-9 h-9 rounded-full bg-slate-150 text-slate-700 dark:bg-slate-800 dark:text-slate-350 flex items-center justify-center font-bold text-xs shrink-0">
                      {conv.contact.name.split(" ").map(n => n[0]).join("")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 text-xs">
                        <span className="truncate">{conv.contact.name}</span>
                        {conv.lastMsg && (
                          <span className="text-[9px] text-slate-400 font-mono font-normal">
                            {formatDate(conv.lastMsg.sent_at || conv.lastMsg.created_at)}
                          </span>
                        )}
                      </div>
                      
                      {/* Short body text preview */}
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight font-sans">
                        {conv.lastMsgText}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">No matching support chats.</p>
            )}
          </div>
        </div>

        {/* Right column: active chat window */}
        <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950/20">
          
          {/* Active Chat Header */}
          {activeContact ? (
            <>
              <div className="h-16 border-b border-slate-100 bg-white/80 dark:bg-slate-900/80 px-6 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/20">
                    {activeContact.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h4 className="text-xs font-black font-display text-slate-800 dark:text-slate-200">
                      {activeContact.name}
                    </h4>
                    <span className="text-[9px] font-mono text-emerald-500 font-bold tracking-wider">
                      +{activeContact.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={activeContact.source === 'odoo' ? 'success' : 'secondary'} className="text-[8px] tracking-wide uppercase">
                    {activeContact.source === 'odoo' ? 'Odoo ERP Synced' : 'Manual Entry'}
                  </Badge>
                  <button className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full dark:hover:bg-slate-800 cursor-pointer">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Chat Message Bubble Log Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 grid-bg-lines">
                <AnimatePresence initial={false}>
                  {activeChatMessages.map((m) => {
                    const isIncoming = m.delivery_status === 'read' && m.campaign_id === 9999 && m.whatsapp_message_id?.includes('chat');
                    const text = localStorage.getItem(`chat_body_${m.whatsapp_message_id}`);
                    
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "flex w-full",
                          isIncoming ? "justify-start" : "justify-end"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-md rounded-xl p-3 shadow-xs text-xs relative",
                            isIncoming 
                              ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100" 
                              : "bg-emerald-500 text-white rounded-tr-none shadow-[0_3px_10px_rgba(34,197,94,0.15)]"
                          )}
                        >
                          {/* Chat Sender title (Bot vs Administrator) */}
                          <div className="flex items-center gap-1.5 font-bold mb-1 opacity-70 text-[9px]">
                            {isIncoming ? (
                              <>
                                <Bot size={10} className="text-emerald-500 animate-pulse" />
                                <span>Odoo Chatbot</span>
                              </>
                            ) : (
                              <span>Administrator</span>
                            )}
                          </div>

                          {text ? (
                            <p className="leading-relaxed font-sans pr-8">{text}</p>
                          ) : (
                            <p className="leading-relaxed font-mono italic pr-8">
                              Fired Campaign Template: <strong className="underline">{campaigns.find(c => c.id === m.campaign_id)?.template_name || m.whatsapp_message_id}</strong>
                            </p>
                          )}

                          <div className="absolute right-2 bottom-1 flex items-center gap-0.5 select-none text-[8px] opacity-70">
                            <span>{formatDate(m.sent_at || m.created_at).split(",")[1]?.trim()}</span>
                            {!isIncoming && getChatTicks(m.delivery_status)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Dynamic typing indicator mockup */}
                {isTypingSimulated && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start items-center gap-2 text-xs text-slate-400 pl-2 select-none"
                  >
                    <Bot size={12} className="text-emerald-500 animate-pulse" />
                    <span className="font-semibold italic animate-pulse">Customer Support is typing...</span>
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Console Form */}
              <form 
                onSubmit={handleSendMessage}
                className="h-20 bg-white border-t border-slate-100 dark:bg-slate-900 dark:border-slate-800/80 px-6 flex items-center gap-4 shrink-0"
              >
                <input
                  type="text"
                  placeholder={`Send direct WhatsApp template message to ${activeContact.name}...`}
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
                
                <button
                  type="submit"
                  disabled={!typedMessage.trim()}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-white bg-emerald-500 hover:bg-emerald-600 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 shrink-0",
                    !typedMessage.trim() && "opacity-40 cursor-not-allowed shadow-none bg-slate-400"
                  )}
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 select-none">
              <Smartphone size={32} className="text-slate-350 animate-pulse mb-3" />
              <p className="text-sm font-semibold">Select a support chat thread to begin.</p>
              <p className="text-xs text-slate-400 mt-1">Converse in real-time with automatic Odoo chatbot assistance.</p>
            </div>
          )}

        </div>

      </Card>
    </div>
  );
}
