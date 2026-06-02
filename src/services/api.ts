import type { Contact, Campaign, CampaignMessage, CampaignAnalytics } from '../types/database';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface OdooSyncResult {
  created: number;
  updated: number;
  skipped: number;
  total: number;
}

export const api = {
  /**
   * Health Checks
   */
  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/`);
      return res.ok;
    } catch {
      return false;
    }
  },

  checkDbHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/health/db`);
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Contacts endpoints
   */
  getContacts: async (): Promise<Contact[]> => {
    const res = await fetch(`${BASE_URL}/contacts/`);
    if (!res.ok) throw new Error('Failed to fetch contacts');
    const data = await res.json();
    // Map Odoo data structure into frontend Contact model
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email || null,
      synced_at: c.synced_at || new Date().toISOString(),
      source: 'odoo' as const // Synced Odoo CRM source
    }));
  },

  syncOdooContacts: async (): Promise<OdooSyncResult> => {
    const res = await fetch(`${BASE_URL}/contacts/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed Odoo ERP database sync');
    return res.json();
  },

  createContact: async (contactData: { name: string; phone: string; email?: string }): Promise<Contact> => {
    const res = await fetch(`${BASE_URL}/contacts/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create contact in Odoo/PostgreSQL' }));
      throw new Error(err.detail || 'Failed to create contact');
    }
    const c = await res.json();
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email || null,
      synced_at: c.last_synced_at || c.created_at || new Date().toISOString(),
      source: 'odoo' as const
    };
  },

  updateContact: async (id: number, contactData: { name?: string; phone?: string; email?: string }): Promise<Contact> => {
    const res = await fetch(`${BASE_URL}/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update contact in Odoo/PostgreSQL' }));
      throw new Error(err.detail || 'Failed to update contact');
    }
    const c = await res.json();
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email || null,
      synced_at: c.last_synced_at || c.created_at || new Date().toISOString(),
      source: 'odoo' as const
    };
  },

  /**
   * Campaigns endpoints
   */
  getCampaigns: async (): Promise<Campaign[]> => {
    const res = await fetch(`${BASE_URL}/campaigns/`);
    if (!res.ok) throw new Error('Failed to fetch campaigns list');
    const data = await res.json();
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      topic: c.topic || 'WhatsApp Outreach',
      template_name: c.template_name,
      template_language: c.template_language || 'en',
      template_components: c.template_components || [],
      status: c.status || 'draft',
      scheduled_at: c.scheduled_at || null,
      created_at: c.created_at || new Date().toISOString(),
      updated_at: c.updated_at || new Date().toISOString()
    }));
  },

  getCampaignDetail: async (id: number): Promise<Campaign> => {
    const res = await fetch(`${BASE_URL}/campaigns/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch campaign details for ID ${id}`);
    const c = await res.json();
    return {
      id: c.id,
      name: c.name,
      topic: c.topic || 'WhatsApp Outreach',
      template_name: c.template_name,
      template_language: c.template_language || 'en',
      template_components: c.template_components || [],
      status: c.status || 'draft',
      scheduled_at: c.scheduled_at || null,
      created_at: c.created_at || new Date().toISOString(),
      updated_at: c.updated_at || new Date().toISOString()
    };
  },

  createCampaign: async (campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'status'> & { scheduled_at: string | null }): Promise<Campaign> => {
    const res = await fetch(`${BASE_URL}/campaigns/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData)
    });
    if (!res.ok) throw new Error('Failed to create campaign in PostgreSQL database');
    return res.json();
  },

  startCampaign: async (id: number): Promise<Campaign> => {
    const res = await fetch(`${BASE_URL}/campaigns/${id}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Failed to start campaign ID ${id}`);
    return res.json();
  },

  cancelCampaign: async (id: number): Promise<Campaign> => {
    const res = await fetch(`${BASE_URL}/campaigns/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Failed to cancel campaign ID ${id}`);
    return res.json();
  },

  getCampaignMessages: async (campaignId: number, skip = 0, limit = 1000): Promise<CampaignMessage[]> => {
    const res = await fetch(`${BASE_URL}/campaigns/${campaignId}/messages?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to load messages records for campaign ID ${campaignId}`);
    return res.json();
  },

  getCampaignAnalytics: async (campaignId: number): Promise<CampaignAnalytics> => {
    const res = await fetch(`${BASE_URL}/campaigns/${campaignId}/analytics`);
    if (!res.ok) throw new Error(`Failed to load delivery analytics for campaign ID ${campaignId}`);
    const data = await res.json();
    return {
      campaign_id: data.campaign_id,
      campaign_name: data.campaign_name,
      status: data.status,
      total_contacts: data.total_contacts || 0,
      pending: data.pending || 0,
      sent: data.sent || 0,
      delivered: data.delivered || 0,
      read: data.read || 0,
      failed: data.failed || 0,
      delivery_rate: data.delivery_rate || 0,
      read_rate: data.read_rate || 0,
      failure_rate: data.total_contacts > 0 ? (data.failed || 0) / data.total_contacts : 0
    };
  },

  sendDirectMessage: async (
    contactId: number,
    payload: {
      message_type: 'template' | 'custom';
      template_name?: string;
      components?: Array<{ type: string; parameters: Array<{ type: string; text: string }> }>;
      custom_text?: string;
    }
  ): Promise<{ status: string; whatsapp_message_id: string; message_id: number }> => {
    const res = await fetch(`${BASE_URL}/contacts/${contactId}/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to send WhatsApp message' }));
      throw new Error(err.detail || 'Failed to send direct message');
    }
    return res.json();
  }
};
