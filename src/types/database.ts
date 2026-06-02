export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';

export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
  synced_at: string;
  source: 'odoo' | 'manual';
}

export interface TemplateParameter {
  type: 'text';
  text: string;
}

export interface TemplateComponent {
  type: 'body' | 'header' | 'footer' | 'buttons';
  parameters: TemplateParameter[];
}

export interface Campaign {
  id: number;
  name: string;
  topic: string;
  template_name: string;
  template_language: string;
  template_components?: TemplateComponent[];
  status: CampaignStatus;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignMessage {
  id: number;
  campaign_id: number;
  contact_id: number;
  whatsapp_message_id: string | null;
  delivery_status: DeliveryStatus;
  sent_at: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
}

export interface WhatsAppTemplate {
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  body_text: string;
  params_count: number;
  usage_description: string;
}

export interface WhatsAppSettings {
  phone_number_id: string;
  business_account_id: string;
  token: string;
  status: 'connected' | 'disconnected';
}

export interface OdooSettings {
  url: string;
  db: string;
  username: string;
  last_sync: string | null;
}

export interface SystemSettings {
  batch_size: number;
  retry_count: number;
  message_delay: number;
}

export interface RecentActivity {
  id: string;
  type: 'campaign_started' | 'campaign_completed' | 'failed_delivery' | 'contacts_synced';
  campaign_name?: string;
  contact_name?: string;
  details: string;
  timestamp: string;
}

export interface CampaignAnalytics {
  campaign_id: number;
  campaign_name: string;
  status: CampaignStatus;
  total_contacts: number;
  pending: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  delivery_rate: number;
  read_rate: number;
  failure_rate: number;
}
