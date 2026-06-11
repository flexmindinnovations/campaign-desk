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

export interface InvoiceLine {
  id?: number;
  name: string;
  quantity: number;
  price_unit: number;
  price_subtotal?: number;
}

export interface Invoice {
  id: number;
  name: string;
  partner_id: [number, string] | number;
  partner_name?: string;
  invoice_date: string;
  amount_total: number;
  state: 'draft' | 'posted' | 'cancel';
  payment_state: 'not_paid' | 'in_payment' | 'paid' | 'partial';
  invoice_line_ids?: InvoiceLine[];
}

// ── Conversation / Chat ───────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant';

export type WsStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface ConversationMessage {
  id: number;
  contact_phone: string;
  role: MessageRole;
  content: string;
  wamid: string | null;
  created_at: string;
}

export interface ConversationSummary {
  contact_phone: string;
  last_message: string;
  last_role: MessageRole;
  last_message_at: string;
  message_count: number;
}

export interface WsEvent {
  type: 'new_message' | 'history';
  message?: ConversationMessage;
  messages?: ConversationMessage[];
}

