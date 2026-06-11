import { create } from 'zustand';
import type { Contact, Campaign, CampaignMessage, WhatsAppTemplate, RecentActivity, WhatsAppSettings, OdooSettings, SystemSettings, CampaignAnalytics, Invoice, TemplateComponent } from '../types/database';
import { api } from '../services/api';
import { toast } from '../components/ui/Toast';

interface StoreState {
  // Theme & Navigation
  theme: 'light' | 'dark';
  activeSidebarTab: string;
  sidebarCollapsed: boolean;
  
  // Database tables
  contacts: Contact[];
  campaigns: Campaign[];
  messages: CampaignMessage[];
  templates: WhatsAppTemplate[];
  activities: RecentActivity[];
  invoices: Invoice[];

  
  // Settings
  whatsappSettings: WhatsAppSettings;
  odooSettings: OdooSettings;
  systemSettings: SystemSettings;
  
  // Selection states
  selectedCampaignId: number | null;
  selectedContactId: number | null;
  activeChatContactId: number | null;
  
  // Active Campaign Simulators (keyed by campaignId)
  activeIntervals: Record<number, number>;

  // API Live State
  isApiConnected: boolean;
  isApiLoading: boolean;
  campaignAnalytics: Record<number, CampaignAnalytics>;
  pollingInterval: number | null;

  // Per-resource loading flags (shown in table skeletons)
  loadingState: { contacts: boolean; campaigns: boolean; invoices: boolean };
  // Timestamps (ms) of last successful fetch — used to skip redundant re-fetches
  lastFetched: { contacts: number | null; campaigns: number | null; invoices: number | null };

  // Campaign fetch action (lazy, per-page — not part of initStore bootstrap)
  fetchCampaigns: (force?: boolean) => Promise<void>;

  // Theme Actions
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebarCollapse: () => void;
  
  // Navigation Actions
  setActiveSidebarTab: (tab: string) => void;
  setSelectedCampaignId: (id: number | null) => void;
  
  // Odoo Integration Sync Actions
  syncOdooContacts: () => Promise<{ total_synced: number; created: number; updated: number; failed: number }>;
  
  // Campaign Actions
  addCampaign: (campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'status'> & { scheduled_at: string | null }) => Promise<number>;
  startCampaign: (id: number) => Promise<void>;
  pauseCampaign: (id: number) => Promise<void>;
  cancelCampaign: (id: number) => Promise<void>;
  duplicateCampaign: (id: number) => Promise<void>;
  deleteCampaign: (id: number) => Promise<void>;
  updateCampaign: (id: number, fields: Partial<Campaign>) => void;
  
  // API Actions
  initStore: () => Promise<void>;
  fetchCampaignDetailsAndAnalytics: (campaignId: number) => Promise<void>;
  startPollingCampaigns: (intervalMs?: number) => void;
  stopPollingCampaigns: () => void;
  
  // Contact Actions
  addManualContact: (contact: Omit<Contact, 'id' | 'synced_at' | 'source'>) => Promise<void>;
  deleteContact: (id: number) => void;
  
  // Template Actions
  addTemplate: (template: WhatsAppTemplate) => void;
  syncTemplates: () => Promise<void>;
  
  // Settings Actions
  updateWhatsAppSettings: (settings: Partial<WhatsAppSettings>) => void;
  updateOdooSettings: (settings: Partial<OdooSettings>) => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  
  // Invoice Actions
  fetchInvoices: (force?: boolean) => Promise<void>;
  createInvoice: (invoiceData: { partner_id: number; invoice_date?: string; lines: Array<{ name: string; quantity: number; price_unit: number }> }) => Promise<number>;
  postInvoice: (id: number) => Promise<void>;
  sendInvoiceWhatsApp: (id: number, payload: { template_name: string; template_language?: string; company_name?: string; invoice_url?: string }) => Promise<void>;

  
  sendChatMessage: (
    contactId: number,
    messageText: string,
    isIncoming?: boolean,
    campaignId?: number | null,
    templateDetails?: { templateName: string; components: TemplateComponent[] } | null
  ) => Promise<void>;
  setActiveChatContactId: (id: number | null) => void;
  
  // Selectors
  getCampaignAnalytics: (campaignId: number) => CampaignAnalytics | null;
  getCampaignMessages: (campaignId: number) => CampaignMessage[];
  getContactMessages: (contactId: number) => CampaignMessage[];
  
  // Utility
  addActivity: (activity: Omit<RecentActivity, 'id' | 'timestamp'>) => void;
  resetAllData: () => void;
}

// Helper to load state from localStorage or fallback
const getLocalStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error: unknown) {
    console.error(error);
    return fallback;
  }
};

const setLocalStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error: unknown) {
    console.error(error);
  }
};

// Clear old mock data from localStorage on first load - start fresh with API data
const clearOldMockData = () => {
  const keysToClean = ['contacts', 'campaigns', 'messages', 'templates', 'activities', 'invoices'];
  keysToClean.forEach(key => localStorage.removeItem(key));
};

if (typeof window !== 'undefined') {
  clearOldMockData();
}

const DEFAULT_WHATSAPP_SETTINGS: WhatsAppSettings = {
  phone_number_id: '',
  business_account_id: '',
  token: '',
  status: 'disconnected'
};

const DEFAULT_ODOO_SETTINGS: OdooSettings = {
  url: '',
  db: '',
  username: '',
  last_sync: null
};

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  batch_size: 50,
  retry_count: 3,
  message_delay: 1
};

export const useStore = create<StoreState>((set, get) => ({

  // Theme & Navigation
  theme: getLocalStorage<'light' | 'dark'>('theme', 'dark'),
  activeSidebarTab: 'dashboard',
  sidebarCollapsed: getLocalStorage<boolean>('sidebarCollapsed', false),

  // Database Tables
  contacts: getLocalStorage<Contact[]>('contacts', []),
  campaigns: getLocalStorage<Campaign[]>('campaigns', []),
  messages: getLocalStorage<CampaignMessage[]>('messages', []),
  templates: getLocalStorage<WhatsAppTemplate[]>('templates', []),
  activities: getLocalStorage<RecentActivity[]>('activities', []),
  invoices: getLocalStorage<Invoice[]>('invoices', []),


  // Settings
  whatsappSettings: getLocalStorage<WhatsAppSettings>('whatsappSettings', DEFAULT_WHATSAPP_SETTINGS),
  odooSettings: getLocalStorage<OdooSettings>('odooSettings', DEFAULT_ODOO_SETTINGS),
  systemSettings: getLocalStorage<SystemSettings>('systemSettings', DEFAULT_SYSTEM_SETTINGS),

  // Selections
  selectedCampaignId: null,
  selectedContactId: null,
  activeChatContactId: null,
  activeIntervals: {},
  
  // API Live State
  isApiConnected: false,
  isApiLoading: false,
  campaignAnalytics: {},
  pollingInterval: null,
  loadingState: { contacts: false, campaigns: false, invoices: false },
  lastFetched: { contacts: null, campaigns: null, invoices: null },
  
  setActiveChatContactId: (id) => set({ activeChatContactId: id }),
  setSelectedCampaignId: (id) => set({ 
    selectedCampaignId: id, 
    activeSidebarTab: id ? 'campaign-details' : 'campaigns' 
  }),


  // Theme Actions
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: nextTheme });
    setLocalStorage('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  setTheme: (theme) => {
    set({ theme });
    setLocalStorage('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  toggleSidebarCollapse: () => {
    const next = !get().sidebarCollapsed;
    set({ sidebarCollapsed: next });
    setLocalStorage('sidebarCollapsed', next);
  },
  
  // Navigation Actions
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),

  // API Actions — bootstrap: contacts only (campaigns are fetched lazily per-page)
  initStore: async () => {
    const STALE_MS = 2 * 60 * 1000;
    const { lastFetched } = get();
    const now = Date.now();
    const contactsFresh = lastFetched.contacts !== null && now - lastFetched.contacts < STALE_MS;

    if (contactsFresh) {
      set({ isApiConnected: true });
      return;
    }

    set({ isApiLoading: true, loadingState: { ...get().loadingState, contacts: true } });
    try {
      const contacts = await api.getContacts();
      set({
        contacts,
        isApiConnected: true,
        isApiLoading: false,
        loadingState: { ...get().loadingState, contacts: false },
        lastFetched: { ...get().lastFetched, contacts: now },
      });
      toast.success("Synchronized with live Render API & Supabase PostgreSQL.");
    } catch (error: unknown) {
      console.error(error);
      set({
        isApiConnected: false,
        isApiLoading: false,
        loadingState: { ...get().loadingState, contacts: false },
      });
      toast.info("Render backend offline. Running in premium simulator mode.");
    }
  },

  fetchCampaigns: async (force = false) => {
    const STALE_MS = 2 * 60 * 1000;
    const { lastFetched } = get();
    const fresh = lastFetched.campaigns !== null && Date.now() - lastFetched.campaigns < STALE_MS;
    if (!force && fresh) return;

    set({ loadingState: { ...get().loadingState, campaigns: true } });
    try {
      const campaigns = await api.getCampaigns();
      set({
        campaigns,
        loadingState: { ...get().loadingState, campaigns: false },
        lastFetched: { ...get().lastFetched, campaigns: Date.now() },
      });
    } catch (error: unknown) {
      console.error(error);
      set({ loadingState: { ...get().loadingState, campaigns: false } });
      toast.error("Failed to load campaigns.");
    }
  },


  fetchCampaignDetailsAndAnalytics: async (campaignId) => {
    const { isApiConnected } = get();
    if (!isApiConnected) return;

    try {
      const details = await api.getCampaignDetail(campaignId);
      const messagesList = await api.getCampaignMessages(campaignId);
      const analytics = await api.getCampaignAnalytics(campaignId);

      // Refresh campaigns list with fresh detail
      const updatedCampaigns = get().campaigns.map(c => c.id === campaignId ? details : c);

      // Update store messages
      const otherMessages = get().messages.filter(m => m.campaign_id !== campaignId);
      const mergedMessages = [...messagesList, ...otherMessages];

      // Update analytics cache
      const updatedAnalytics = { ...get().campaignAnalytics, [campaignId]: analytics };

      set({
        campaigns: updatedCampaigns,
        messages: mergedMessages,
        campaignAnalytics: updatedAnalytics
      });
    } catch (error: unknown) {
      console.error("Failed loading campaign details from API:", error);
    }
  },

  startPollingCampaigns: (intervalMs = 2000) => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const newInterval = window.setInterval(async () => {
      const { campaigns } = get();
      const hasRunningCampaigns = campaigns.some(c => c.status === 'running' || c.status === 'scheduled');

      if (!hasRunningCampaigns) {
        get().stopPollingCampaigns();
        return;
      }

      try {
        await get().fetchCampaigns(true);
      } catch (error: unknown) {
        console.error(error);
      }
    }, intervalMs);

    set({ pollingInterval: newInterval as unknown as number });
  },

  stopPollingCampaigns: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  },

  // Odoo Sync Action
  syncOdooContacts: async () => {
    set({ isApiLoading: true });
    try {
      const result = await api.syncOdooContacts();
      const contacts = await api.getContacts();

      set({ contacts, isApiLoading: false });

      get().addActivity({
        type: 'contacts_synced',
        details: `Synced Odoo ERP CRM database. Total: ${result.total}, Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}.`
      });

      return {
        total_synced: result.total,
        created: result.created,
        updated: result.updated,
        failed: result.skipped
      };
    } catch (error: unknown) {
      set({ isApiLoading: false });
      toast.error("Odoo CRM synchronization failed.");
      throw error;
    }
  },

  // Campaign Lifecycle Actions
  addCampaign: async (campaignData) => {
    try {
      const newCamp = await api.createCampaign(campaignData);
      await get().fetchCampaigns(true);

      get().addActivity({
        type: 'campaign_started',
        campaign_name: newCamp.name,
        details: `Campaign "${newCamp.name}" saved in draft/scheduled mode.`
      });

      return newCamp.id;
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to create campaign on backend.");
      throw error;
    }
  },

  startCampaign: async (campaignId) => {
    try {
      const updatedCamp = await api.startCampaign(campaignId);
      await get().fetchCampaigns(true);

      // Dynamic logs sync
      await get().fetchCampaignDetailsAndAnalytics(campaignId);

      get().addActivity({
        type: 'campaign_started',
        campaign_name: updatedCamp.name,
        details: 'WhatsApp campaign started. Processing background dispatches...'
      });
    } catch (error: unknown) {
      toast.error("Failed to start campaign.");
      console.error(error);
    }
  },

  pauseCampaign: async (campaignId) => {
    await get().cancelCampaign(campaignId);
  },

  cancelCampaign: async (campaignId) => {
    try {
      const updatedCamp = await api.cancelCampaign(campaignId);
      await get().fetchCampaigns(true);

      await get().fetchCampaignDetailsAndAnalytics(campaignId);
      toast.success(`Campaign "${updatedCamp.name}" cancelled.`);
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to cancel campaign on backend.");
    }
  },

  duplicateCampaign: async (campaignId) => {
    const { campaigns } = get();
    const original = campaigns.find(c => c.id === campaignId);
    if (!original) return;
    try {
      await api.createCampaign({
        name: `${original.name} (Copy)`,
        topic: original.topic || 'WhatsApp Outreach',
        template_name: original.template_name,
        template_language: original.template_language || 'en',
        template_components: original.template_components || [],
        scheduled_at: null
      });

      await get().fetchCampaigns(true);
      toast.success("Campaign duplicated as a new draft.");
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to duplicate campaign on backend.");
    }
  },

  deleteCampaign: async (campaignId) => {
    const { campaigns } = get();
    try {
      await api.cancelCampaign(campaignId).catch(() => {});
      const updated = campaigns.filter(c => c.id !== campaignId);
      set({ campaigns: updated });
      toast.success("Campaign removed from directory.");
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to remove campaign.");
    }
  },

  updateCampaign: (id, fields) => {
    const { campaigns } = get();
    const updated = campaigns.map(c => c.id === id ? { ...c, ...fields, updated_at: new Date().toISOString() } : c);
    set({ campaigns: updated });
    setLocalStorage('campaigns', updated);
  },

  // Contact Actions
  addManualContact: async (contactData) => {
    const { contacts } = get();
    try {
      const newContact = await api.createContact(contactData);
      const updated = [newContact, ...contacts];
      set({ contacts: updated });
      toast.success(`Created contact "${contactData.name}" on Odoo & PostgreSQL database.`);

      get().addActivity({
        type: 'contacts_synced',
        details: `Added new live contact: ${newContact.name} (${newContact.phone}).`
      });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create contact on backend.");
      throw error;
    }
  },

  deleteContact: (id) => {
    const { contacts } = get();
    const updated = contacts.filter(c => c.id !== id);
    set({ contacts: updated });
    setLocalStorage('contacts', updated);
  },

  // Template Actions
  addTemplate: (template) => {
    const { templates } = get();
    const updated = [template, ...templates];
    set({ templates: updated });
    setLocalStorage('templates', updated);
  },

  syncTemplates: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Just triggers fresh loading simulation
        resolve();
      }, 1500);
    });
  },

  // Settings Actions
  updateWhatsAppSettings: (settings) => {
    const updated = { ...get().whatsappSettings, ...settings };
    set({ whatsappSettings: updated });
    setLocalStorage('whatsappSettings', updated);
  },

  updateOdooSettings: (settings) => {
    const updated = { ...get().odooSettings, ...settings };
    set({ odooSettings: updated });
    setLocalStorage('odooSettings', updated);
  },

  updateSystemSettings: (settings) => {
    const updated = { ...get().systemSettings, ...settings };
    set({ systemSettings: updated });
    setLocalStorage('systemSettings', updated);
  },

  // Chat Actions
  sendChatMessage: async (contactId, messageText, isIncoming = false, campaignId = null, templateDetails = null) => {
    const { messages, contacts, isApiConnected } = get();
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    let waMessageId = `chat.wamid.${Date.now()}`;
    let deliveryStatus: CampaignMessage['delivery_status'] = isIncoming ? 'read' : 'sent';

    if (isApiConnected && !isIncoming) {
      try {
        const payload = templateDetails
          ? {
              message_type: 'template' as const,
              template_name: templateDetails.templateName,
              components: templateDetails.components
            }
          : {
              message_type: 'custom' as const,
              custom_text: messageText
            };
        const res = await api.sendDirectMessage(contactId, payload);
        waMessageId = res.whatsapp_message_id;
        deliveryStatus = 'sent';
      } catch (error: unknown) {
        toast.error(`WhatsApp Send Failed: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }

    // We can represent real-time chat logs in our DB by piggybacking on CampaignMessages table
    // creating a special campaign_id = 9999 (which stands for active chat inbox log) or chosen campaign
    const newMessageId = messages.reduce((max, m) => m.id > max ? m.id : max, 0) + 1;
    
    const newMsg: CampaignMessage = {
      id: newMessageId,
      campaign_id: campaignId || 9999, // special inbox tag or chosen campaign
      contact_id: contactId,
      whatsapp_message_id: waMessageId,
      delivery_status: deliveryStatus,
      sent_at: new Date().toISOString(),
      error_message: null,
      retry_count: 0,
      created_at: new Date().toISOString()
    };

    // Piggyback message parameters in storage (normally stored in backend, we append parameters in localStorage)
    // To keep it simple, we store custom chat bodies in a separate localStorage string array
    const chatTextDbKey = `chat_body_${newMsg.whatsapp_message_id}`;
    localStorage.setItem(chatTextDbKey, messageText);

    const updated = [...messages, newMsg];
    set({ messages: updated });
    setLocalStorage('messages', updated);

    // Auto-Responder Trigger (Simulate Customer Support reply)
    if (!isIncoming) {
      setTimeout(() => {
        // Standard chatbot answer
        const chatbotResponses = [
          `Hi! Thanks for contacting us. We received your query: "${messageText}". Our support team will get in touch shortly.`,
          `This is an automated reply. Thank you for your feedback!`,
          `Great, thank you! I've logged this request on Odoo and will update you soon.`,
          `Hello! For security, please do not share password credentials over chat. An agent has been alerted.`
        ];
        const randomAnswer = chatbotResponses[Math.floor(Math.random() * chatbotResponses.length)];
        get().sendChatMessage(contactId, randomAnswer, true, campaignId);
      }, 2000);
    }
  },

  // Selectors
  getCampaignAnalytics: (campaignId) => {
    const { isApiConnected, campaignAnalytics } = get();
    if (isApiConnected && campaignAnalytics[campaignId]) {
      return campaignAnalytics[campaignId];
    }
    const { campaigns, messages } = get();
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return null;

    const campaignMessages = messages.filter(m => m.campaign_id === campaignId);
    const total = campaignMessages.length;
    
    if (total === 0) {
      return {
        campaign_id: campaignId,
        campaign_name: campaign.name,
        status: campaign.status,
        total_contacts: 0,
        pending: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        delivery_rate: 0,
        read_rate: 0,
        failure_rate: 0
      };
    }

    const pending = campaignMessages.filter(m => m.delivery_status === 'pending').length;
    const sent = campaignMessages.filter(m => m.delivery_status === 'sent').length;
    const delivered = campaignMessages.filter(m => m.delivery_status === 'delivered').length;
    const read = campaignMessages.filter(m => m.delivery_status === 'read').length;
    const failed = campaignMessages.filter(m => m.delivery_status === 'failed').length;

    // Successful deliveries include sent, delivered, and read
    const successful = sent + delivered + read;
    
    return {
      campaign_id: campaignId,
      campaign_name: campaign.name,
      status: campaign.status,
      total_contacts: total,
      pending,
      sent,
      delivered,
      read,
      failed,
      delivery_rate: total > 0 ? (successful / total) : 0,
      read_rate: successful > 0 ? (read / successful) : 0,
      failure_rate: total > 0 ? (failed / total) : 0
    };
  },

  getCampaignMessages: (campaignId) => {
    return get().messages.filter(m => m.campaign_id === campaignId);
  },

  getContactMessages: (contactId) => {
    return get().messages.filter(m => m.contact_id === contactId);
  },

  // Activity Log Writer
  addActivity: (actData) => {
    const { activities } = get();
    const newId = `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newActivity: RecentActivity = {
      ...actData,
      id: newId,
      timestamp: new Date().toISOString()
    };
    const updated = [newActivity, ...activities.slice(0, 49)];
    set({ activities: updated });
    setLocalStorage('activities', updated);
  },

  // Data resetter
  resetAllData: () => {
    localStorage.removeItem('contacts');
    localStorage.removeItem('campaigns');
    localStorage.removeItem('messages');
    localStorage.removeItem('templates');
    localStorage.removeItem('activities');
    localStorage.removeItem('whatsappSettings');
    localStorage.removeItem('odooSettings');
    localStorage.removeItem('systemSettings');

    set({
      contacts: [],
      campaigns: [],
      messages: [],
      templates: [],
      activities: [],
      whatsappSettings: DEFAULT_WHATSAPP_SETTINGS,
      odooSettings: DEFAULT_ODOO_SETTINGS,
      systemSettings: DEFAULT_SYSTEM_SETTINGS,
      selectedCampaignId: null,
      selectedContactId: null,
      activeChatContactId: null,
      invoices: []
    });
  },

  fetchInvoices: async (force = false) => {
    const STALE_MS = 2 * 60 * 1000;
    const { isApiConnected, lastFetched } = get();
    if (!isApiConnected) return;

    const fresh = lastFetched.invoices !== null && Date.now() - lastFetched.invoices < STALE_MS;
    if (!force && fresh) return;

    set({ loadingState: { ...get().loadingState, invoices: true } });
    try {
      const invoices = await api.getInvoices();
      set({
        invoices,
        loadingState: { ...get().loadingState, invoices: false },
        lastFetched: { ...get().lastFetched, invoices: Date.now() },
      });
    } catch (error) {
      console.error(error);
      set({ loadingState: { ...get().loadingState, invoices: false } });
      toast.error("Failed to load invoices from Odoo.");
    }
  },

  createInvoice: async (invoiceData) => {
    try {
      const newInvoiceId = await api.createInvoice(invoiceData);
      await get().fetchInvoices();
      toast.success(`Draft invoice created successfully (ID ${newInvoiceId})`);
      return newInvoiceId;
    } catch (error) {
      toast.error("Failed to create Odoo invoice.");
      throw error;
    }
  },

  postInvoice: async (id) => {
    try {
      await api.postInvoice(id);
      await get().fetchInvoices();
      toast.success("Invoice posted & validated successfully in Odoo.");
    } catch (error) {
      toast.error("Failed to post invoice.");
      throw error;
    }
  },

  sendInvoiceWhatsApp: async (id, payload) => {
    try {
      await api.sendInvoiceWhatsApp(id, payload);
      toast.success("WhatsApp template invoice notification queued.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send WhatsApp invoice notification.");
    }
  }

}));

// Initialize document theme on import
if (typeof window !== 'undefined') {
  const currentTheme = getLocalStorage<'light' | 'dark'>('theme', 'dark');
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
