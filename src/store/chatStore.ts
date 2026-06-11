import { create } from 'zustand';
import type { ConversationMessage, ConversationSummary, WsStatus } from '../types/database';
import { api } from '../services/api';

interface ChatState {
  conversations: ConversationSummary[];
  messages: Record<string, ConversationMessage[]>;
  activePhone: string | null;
  wsStatus: WsStatus;

  setWsStatus: (status: WsStatus) => void;
  setActivePhone: (phone: string) => Promise<void>;
  setConversations: (list: ConversationSummary[]) => void;
  upsertMessage: (msg: ConversationMessage) => void;
  seedHistory: (msgs: ConversationMessage[]) => void;
  // Sends as inbound customer message → triggers AI reply pipeline
  sendMessage: (phone: string, content: string) => Promise<void>;
  loadConversations: () => Promise<void>;
}

const TEMP_ID_PREFIX = -1; // negative IDs are always optimistic

function dedupeById(msgs: ConversationMessage[]): ConversationMessage[] {
  const seen = new Set<number>();
  return msgs.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

function updateConversations(
  convs: ConversationSummary[],
  msg: ConversationMessage,
): ConversationSummary[] {
  const updated = convs.map((c) =>
    c.contact_phone === msg.contact_phone
      ? { ...c, last_message: msg.content, last_role: msg.role, last_message_at: msg.created_at }
      : c,
  );
  if (!updated.some((c) => c.contact_phone === msg.contact_phone)) {
    updated.unshift({
      contact_phone: msg.contact_phone,
      last_message: msg.content,
      last_role: msg.role,
      last_message_at: msg.created_at,
      message_count: 1,
    });
  }
  return [...updated].sort(
    (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime(),
  );
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  activePhone: null,
  wsStatus: 'disconnected',

  setWsStatus: (status) => set({ wsStatus: status }),

  setActivePhone: async (phone) => {
    set({ activePhone: phone });
    if (!get().messages[phone]) {
      const msgs = await api.getConversationMessages(phone);
      set((s) => ({ messages: { ...s.messages, [phone]: dedupeById(msgs) } }));
    }
  },

  setConversations: (list) => set({ conversations: list }),

  upsertMessage: (msg) => {
    set((s) => {
      const existing = s.messages[msg.contact_phone] ?? [];
      // Skip if real ID already present (prevents WS + HTTP response race duplicates)
      if (msg.id > 0 && existing.some((m) => m.id === msg.id)) {
        return { conversations: updateConversations(s.conversations, msg) };
      }
      return {
        messages: { ...s.messages, [msg.contact_phone]: [...existing, msg] },
        conversations: updateConversations(s.conversations, msg),
      };
    });
  },

  seedHistory: (msgs) => {
    if (!msgs.length) return;
    set((s) => {
      const grouped: Record<string, ConversationMessage[]> = {};
      for (const [phone, existing] of Object.entries(s.messages)) {
        grouped[phone] = [...existing];
      }
      for (const m of msgs) {
        if (!grouped[m.contact_phone]) grouped[m.contact_phone] = [];
        if (!grouped[m.contact_phone].some((x) => x.id === m.id)) {
          grouped[m.contact_phone].push(m);
        }
      }
      return { messages: grouped };
    });
  },

  sendMessage: async (phone, content) => {
    const tempId = TEMP_ID_PREFIX * Date.now(); // always negative
    const optimistic: ConversationMessage = {
      id: tempId,
      contact_phone: phone,
      role: 'user', // shows on RIGHT (you sent it); triggers AI reply
      content,
      wamid: null,
      created_at: new Date().toISOString(),
    };
    get().upsertMessage(optimistic);

    try {
      const saved = await api.simulateCustomerMessage(phone, content);
      set((s) => {
        const filtered = (s.messages[phone] ?? []).filter(
          (m) => m.id !== tempId && m.id !== saved.id,
        );
        return { messages: { ...s.messages, [phone]: [...filtered, saved] } };
      });
    } catch (err) {
      set((s) => ({
        messages: {
          ...s.messages,
          [phone]: (s.messages[phone] ?? []).filter((m) => m.id !== tempId),
        },
      }));
      throw err;
    }
  },

  loadConversations: async () => {
    const list = await api.getConversations();
    set({ conversations: list });
  },
}));
