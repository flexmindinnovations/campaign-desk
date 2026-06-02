import { create } from 'zustand';
import type { Contact, Campaign, CampaignMessage, WhatsAppTemplate, RecentActivity, WhatsAppSettings, OdooSettings, SystemSettings, CampaignAnalytics, DeliveryStatus } from '../types/database';
import { getSeededContacts, INITIAL_CAMPAIGNS, generateMockMessages, INITIAL_TEMPLATES, INITIAL_WHATSAPP_SETTINGS, INITIAL_ODOO_SETTINGS, INITIAL_SYSTEM_SETTINGS, INITIAL_ACTIVITIES } from '../services/mockDatabase';
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
  
  // Chat Actions
  sendChatMessage: (
    contactId: number,
    messageText: string,
    isIncoming?: boolean,
    campaignId?: number | null,
    templateDetails?: { templateName: string; components: any[] } | null
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
  } catch (error) {
    return fallback;
  }
};

const setLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Ignore
  }
};

const SEED_CONTACTS = getSeededContacts();
const SEED_MESSAGES = generateMockMessages(INITIAL_CAMPAIGNS, SEED_CONTACTS);

export const useStore = create<StoreState>((set, get) => ({
  // Theme & Navigation
  theme: getLocalStorage<'light' | 'dark'>('theme', 'dark'),
  activeSidebarTab: 'dashboard',
  sidebarCollapsed: getLocalStorage<boolean>('sidebarCollapsed', false),
  
  // Database Tables
  contacts: getLocalStorage<Contact[]>('contacts', SEED_CONTACTS),
  campaigns: getLocalStorage<Campaign[]>('campaigns', INITIAL_CAMPAIGNS),
  messages: getLocalStorage<CampaignMessage[]>('messages', SEED_MESSAGES),
  templates: getLocalStorage<WhatsAppTemplate[]>('templates', INITIAL_TEMPLATES),
  activities: getLocalStorage<RecentActivity[]>('activities', INITIAL_ACTIVITIES),
  
  // Settings
  whatsappSettings: getLocalStorage<WhatsAppSettings>('whatsappSettings', INITIAL_WHATSAPP_SETTINGS),
  odooSettings: getLocalStorage<OdooSettings>('odooSettings', INITIAL_ODOO_SETTINGS),
  systemSettings: getLocalStorage<SystemSettings>('systemSettings', INITIAL_SYSTEM_SETTINGS),
  
  // Selections
  selectedCampaignId: null,
  selectedContactId: null,
  activeChatContactId: SEED_CONTACTS[0]?.id || null,
  activeIntervals: {},
  
  // API Live State
  isApiConnected: false,
  isApiLoading: false,
  campaignAnalytics: {},
  
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

  // API Actions
  initStore: async () => {
    set({ isApiLoading: true });
    try {
      const isConnected = await api.checkHealth();
      if (isConnected) {
        // Fetch live contacts and campaigns from PostgreSQL/Supabase
        const contacts = await api.getContacts();
        const campaigns = await api.getCampaigns();
        
        set({
          contacts,
          campaigns,
          isApiConnected: true,
          isApiLoading: false
        });
        
        toast.success("Synchronized with live Render API & Supabase PostgreSQL.");
      } else {
        set({ isApiConnected: false, isApiLoading: false });
        toast.info("Render backend offline. Running in premium simulator mode.");
      }
    } catch (e) {
      set({ isApiConnected: false, isApiLoading: false });
      toast.info("Render backend offline. Running in premium simulator mode.");
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
    } catch (error) {
      console.error("Failed loading campaign details from API:", error);
    }
  },

  // Odoo Sync Action
  syncOdooContacts: async () => {
    const { isApiConnected } = get();
    if (isApiConnected) {
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
      } catch (error) {
        set({ isApiLoading: false });
        toast.error("Odoo CRM synchronization failed.");
        throw error;
      }
    }

    // Offline Simulation fallback
    return new Promise((resolve) => {
      setTimeout(() => {
        const { contacts } = get();
        
        // Add 3 new mock Odoo contacts
        const newContacts: Contact[] = [
          {
            id: contacts.reduce((max, c) => c.id > max ? c.id : max, 0) + 1,
            name: 'Anish Deshmukh',
            phone: '918429482910',
            email: 'anish@flexmind.in',
            synced_at: new Date().toISOString(),
            source: 'odoo'
          },
          {
            id: contacts.reduce((max, c) => c.id > max ? c.id : max, 0) + 2,
            name: 'Katarina Muller',
            phone: '49301234567',
            email: 'katarina.m@muller.de',
            synced_at: new Date().toISOString(),
            source: 'odoo'
          },
          {
            id: contacts.reduce((max, c) => c.id > max ? c.id : max, 0) + 3,
            name: 'Vijay Mallya',
            phone: '919000000001',
            email: 'vijay.m@odoo-customer.com',
            synced_at: new Date().toISOString(),
            source: 'odoo'
          }
        ];

        const updatedContacts = contacts.map(c => {
          if (c.id === 1) {
            return { ...c, synced_at: new Date().toISOString() };
          }
          return c;
        });

        const mergedContacts = [...updatedContacts, ...newContacts];
        set({ contacts: mergedContacts, odooSettings: { ...get().odooSettings, last_sync: new Date().toISOString() } });
        setLocalStorage('contacts', mergedContacts);
        setLocalStorage('odooSettings', get().odooSettings);
        
        get().addActivity({
          type: 'contacts_synced',
          details: `Synced Odoo ERP contacts database. Created 3 records, updated 1.`
        });

        resolve({
          total_synced: mergedContacts.filter(c => c.source === 'odoo').length,
          created: 3,
          updated: 1,
          failed: 0
        });
      }, 2000);
    });
  },

  // Campaign Lifecycle Actions
  addCampaign: async (campaignData) => {
    const { isApiConnected } = get();
    if (isApiConnected) {
      try {
        const newCamp = await api.createCampaign(campaignData);
        const refreshed = await api.getCampaigns();
        set({ campaigns: refreshed });
        
        get().addActivity({
          type: 'campaign_started',
          campaign_name: newCamp.name,
          details: `Campaign "${newCamp.name}" saved in draft/scheduled mode.`
        });
        
        return newCamp.id;
      } catch (error) {
        toast.error("Failed to create campaign on backend.");
        throw error;
      }
    }

    // Offline Simulation fallback
    const { campaigns } = get();
    const newId = campaigns.reduce((max, c) => c.id > max ? c.id : max, 0) + 1;
    const now = new Date().toISOString();
    
    const newCampaign: Campaign = {
      ...campaignData,
      id: newId,
      status: campaignData.scheduled_at ? 'scheduled' : 'draft',
      created_at: now,
      updated_at: now
    };

    const updated = [newCampaign, ...campaigns];
    set({ campaigns: updated });
    setLocalStorage('campaigns', updated);

    get().addActivity({
      type: 'campaign_started',
      campaign_name: newCampaign.name,
      details: `Created campaign in ${newCampaign.status} state.`
    });

    return newId;
  },

  startCampaign: async (campaignId) => {
    const { isApiConnected } = get();
    if (isApiConnected) {
      try {
        const updatedCamp = await api.startCampaign(campaignId);
        const refreshed = await api.getCampaigns();
        set({ campaigns: refreshed });
        
        // Dynamic logs sync
        await get().fetchCampaignDetailsAndAnalytics(campaignId);
        
        get().addActivity({
          type: 'campaign_started',
          campaign_name: updatedCamp.name,
          details: 'WhatsApp campaign started. Processing background dispatches...'
        });
        return;
      } catch (error) {
        toast.error("Failed to start campaign.");
        console.error(error);
        return;
      }
    }

    // Offline Simulation background loop
    const { campaigns, messages, contacts } = get();
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const updatedCampaigns = campaigns.map(c => {
      if (c.id === campaignId) {
        return { ...c, status: 'running' as const, updated_at: new Date().toISOString() };
      }
      return c;
    });

    const hasMessages = messages.some(m => m.campaign_id === campaignId);
    let updatedMessages = [...messages];
    
    if (!hasMessages) {
      const campaignMessages: CampaignMessage[] = contacts.map((contact, idx) => ({
        id: messages.reduce((max, m) => m.id > max ? m.id : max, 0) + idx + 1,
        campaign_id: campaignId,
        contact_id: contact.id,
        whatsapp_message_id: null,
        delivery_status: 'pending',
        sent_at: null,
        error_message: null,
        retry_count: 0,
        created_at: new Date().toISOString()
      }));
      updatedMessages = [...campaignMessages, ...messages];
    } else {
      updatedMessages = messages.map(m => {
        if (m.campaign_id === campaignId && m.delivery_status !== 'read' && m.delivery_status !== 'delivered' && m.delivery_status !== 'failed') {
          return { ...m, delivery_status: 'pending' as const };
        }
        return m;
      });
    }

    set({ campaigns: updatedCampaigns, messages: updatedMessages });
    setLocalStorage('campaigns', updatedCampaigns);
    setLocalStorage('messages', updatedMessages);

    get().addActivity({
      type: 'campaign_started',
      campaign_name: campaign.name,
      details: 'WhatsApp campaign started. Processing background dispatch queues...'
    });

    const intervalId = window.setInterval(() => {
      const state = useStore.getState();
      const currentMessages = state.messages;
      
      const pendingForCampaign = currentMessages.filter(
        m => m.campaign_id === campaignId && m.delivery_status === 'pending'
      );

      if (pendingForCampaign.length === 0) {
        window.clearInterval(state.activeIntervals[campaignId]);
        
        const finalCampaigns = state.campaigns.map(c => {
          if (c.id === campaignId) {
            return { ...c, status: 'completed' as const, updated_at: new Date().toISOString() };
          }
          return c;
        });
        
        const nextIntervals = { ...state.activeIntervals };
        delete nextIntervals[campaignId];

        set({ campaigns: finalCampaigns, activeIntervals: nextIntervals });
        setLocalStorage('campaigns', finalCampaigns);

        state.addActivity({
          type: 'campaign_completed',
          campaign_name: campaign.name,
          details: 'Campaign background dispatch completed successfully.'
        });
        return;
      }

      const batchToProcess = pendingForCampaign.slice(0, 3);
      const batchIds = batchToProcess.map(b => b.id);

      const newProcessedMessages = currentMessages.map(m => {
        if (batchIds.includes(m.id)) {
          const failed = Math.random() < 0.15;
          const statusChoices: DeliveryStatus[] = ['sent', 'delivered', 'read'];
          const delivery_status = failed ? ('failed' as const) : statusChoices[Math.floor(Math.random() * statusChoices.length)];
          const error_message = failed ? 'Undelivered: Meta Cloud API timeout or invalid number' : null;
          
          return {
            ...m,
            delivery_status,
            whatsapp_message_id: `wamid.HBgLOTE4NDQ2OTk4NTc5FQIAERgSRDFDMkJGN0I3OUQ0QkQyQUY3CC==_${m.id}`,
            sent_at: new Date().toISOString(),
            error_message,
            retry_count: failed ? 3 : 0
          };
        }
        return m;
      });

      set({ messages: newProcessedMessages });
      setLocalStorage('messages', newProcessedMessages);

      const failedMsg = batchToProcess.find((_, _i) => Math.random() < 0.15);
      if (failedMsg) {
        const contact = state.contacts.find(c => c.id === failedMsg.contact_id);
        if (contact) {
          state.addActivity({
            type: 'failed_delivery',
            campaign_name: campaign.name,
            contact_name: contact.name,
            details: `Failed delivery to ${contact.phone}. (Invalid Destination Profile)`
          });
        }
      }

    }, 1500);

    const nextIntervals = { ...get().activeIntervals, [campaignId]: intervalId };
    set({ activeIntervals: nextIntervals });
  },

  pauseCampaign: async (campaignId) => {
    const { isApiConnected } = get();
    if (isApiConnected) {
      // Pause acts as a cancel call in live Meta flow
      await get().cancelCampaign(campaignId);
      return;
    }

    // Offline Simulation fallback
    const { campaigns, activeIntervals } = get();
    const interval = activeIntervals[campaignId];
    if (interval) {
      window.clearInterval(interval);
      const nextIntervals = { ...activeIntervals };
      delete nextIntervals[campaignId];
      set({ activeIntervals: nextIntervals });
    }

    const updated = campaigns.map(c => {
      if (c.id === campaignId) {
        return { ...c, status: 'draft' as const, updated_at: new Date().toISOString() };
      }
      return c;
    });

    set({ campaigns: updated });
    setLocalStorage('campaigns', updated);
  },

  cancelCampaign: async (campaignId) => {
    const { isApiConnected } = get();
    if (isApiConnected) {
      try {
        const updatedCamp = await api.cancelCampaign(campaignId);
        const refreshed = await api.getCampaigns();
        set({ campaigns: refreshed });
        
        await get().fetchCampaignDetailsAndAnalytics(campaignId);
        toast.success(`Campaign "${updatedCamp.name}" cancelled.`);
        return;
      } catch (error) {
        toast.error("Failed to cancel campaign on backend.");
        return;
      }
    }

    // Offline Simulation fallback
    const { campaigns, activeIntervals } = get();
    const interval = activeIntervals[campaignId];
    if (interval) {
      window.clearInterval(interval);
      const nextIntervals = { ...activeIntervals };
      delete nextIntervals[campaignId];
      set({ activeIntervals: nextIntervals });
    }

    const updated = campaigns.map(c => {
      if (c.id === campaignId) {
        return { ...c, status: 'failed' as const, updated_at: new Date().toISOString() };
      }
      return c;
    });

    set({ campaigns: updated });
    setLocalStorage('campaigns', updated);
  },

  duplicateCampaign: async (campaignId) => {
    const { isApiConnected, campaigns } = get();
    if (isApiConnected) {
      const original = campaigns.find(c => c.id === campaignId);
      if (!original) return;
      try {
        const newCamp = await api.createCampaign({
          name: `${original.name} (Copy)`,
          topic: original.topic || 'WhatsApp Outreach',
          template_name: original.template_name,
          template_language: original.template_language || 'en',
          template_components: original.template_components || [],
          scheduled_at: null
        });
        
        const refreshed = await api.getCampaigns();
        set({ campaigns: refreshed });
        toast.success(`Duplicated to draft "${newCamp.name}".`);
      } catch (error) {
        toast.error("Failed to duplicate campaign on backend.");
      }
      return;
    }

    // Offline Simulation fallback
    const original = campaigns.find(c => c.id === campaignId);
    if (!original) return;

    const newId = campaigns.reduce((max, c) => c.id > max ? c.id : max, 0) + 1;
    const now = new Date().toISOString();

    const duplicated: Campaign = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      status: 'draft',
      scheduled_at: null,
      created_at: now,
      updated_at: now
    };

    const updated = [duplicated, ...campaigns];
    set({ campaigns: updated });
    setLocalStorage('campaigns', updated);
  },

  deleteCampaign: async (campaignId) => {
    const { isApiConnected, campaigns } = get();
    if (isApiConnected) {
      try {
        await api.cancelCampaign(campaignId).catch(() => {});
        const updated = campaigns.filter(c => c.id !== campaignId);
        set({ campaigns: updated });
        toast.success("Campaign removed from directory.");
      } catch (e) {
        toast.error("Failed to remove campaign.");
      }
      return;
    }

    // Offline Simulation fallback
    const { messages } = get();
    const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
    const updatedMessages = messages.filter(m => m.campaign_id !== campaignId);
    
    set({ campaigns: updatedCampaigns, messages: updatedMessages });
    setLocalStorage('campaigns', updatedCampaigns);
    setLocalStorage('messages', updatedMessages);
  },

  updateCampaign: (id, fields) => {
    const { campaigns } = get();
    const updated = campaigns.map(c => c.id === id ? { ...c, ...fields, updated_at: new Date().toISOString() } : c);
    set({ campaigns: updated });
    setLocalStorage('campaigns', updated);
  },

  // Contact Actions
  addManualContact: async (contactData) => {
    const { isApiConnected, contacts } = get();
    if (isApiConnected) {
      try {
        const newContact = await api.createContact(contactData);
        const updated = [newContact, ...contacts];
        set({ contacts: updated });
        toast.success(`Created contact "${contactData.name}" on Odoo & PostgreSQL database.`);
        
        get().addActivity({
          type: 'contacts_synced',
          details: `Added new live contact: ${newContact.name} (${newContact.phone}).`
        });
        return;
      } catch (error: any) {
        toast.error(error.message || "Failed to create contact on backend.");
        throw error;
      }
    }

    // Offline Simulation fallback
    const newId = contacts.reduce((max, c) => c.id > max ? c.id : max, 0) + 1;
    
    const newContact: Contact = {
      ...contactData,
      id: newId,
      synced_at: new Date().toISOString(),
      source: 'manual'
    };

    const updated = [newContact, ...contacts];
    set({ contacts: updated });
    setLocalStorage('contacts', updated);

    get().addActivity({
      type: 'contacts_synced',
      details: `Added new manual contact: ${newContact.name} (${newContact.phone}).`
    });
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
      } catch (error: any) {
        toast.error(`WhatsApp Send Failed: ${error.message || error}`);
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
      contacts: SEED_CONTACTS,
      campaigns: INITIAL_CAMPAIGNS,
      messages: SEED_MESSAGES,
      templates: INITIAL_TEMPLATES,
      activities: INITIAL_ACTIVITIES,
      whatsappSettings: INITIAL_WHATSAPP_SETTINGS,
      odooSettings: INITIAL_ODOO_SETTINGS,
      systemSettings: INITIAL_SYSTEM_SETTINGS,
      selectedCampaignId: null,
      selectedContactId: null,
      activeChatContactId: SEED_CONTACTS[0]?.id || null
    });
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
