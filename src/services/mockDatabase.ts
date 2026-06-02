import type { Contact, WhatsAppTemplate, Campaign, CampaignMessage, RecentActivity, WhatsAppSettings, OdooSettings, SystemSettings, DeliveryStatus } from '../types/database';

export const INITIAL_TEMPLATES: WhatsAppTemplate[] = [
  {
    name: 'payment_reminder',
    category: 'UTILITY',
    language: 'en',
    status: 'APPROVED',
    body_text: 'Hello {{1}}, this is a friendly reminder that an outstanding invoice of {{2}} {{3}} is due for {{4}}. Please complete your payment as soon as possible.',
    params_count: 4,
    usage_description: 'Send invoices reminders with name, currency, amount, and company name.'
  },
  {
    name: 'invoice',
    category: 'UTILITY',
    language: 'en',
    status: 'APPROVED',
    body_text: 'Hello {{1}}, invoice {{2}} from {{3}} has been generated for {{4}} {{5}}. You can view or download your invoice here: {{6}}',
    params_count: 6,
    usage_description: 'Send direct invoice confirmations with download link.'
  },
  {
    name: 'sale',
    category: 'UTILITY',
    language: 'en',
    status: 'APPROVED',
    body_text: 'Hi {{1}}, your sales order {{2}} from {{3}} has been confirmed! Total order value: {{4}} {{5}}. Track your shipment here: {{6}}',
    params_count: 6,
    usage_description: 'Order confirmation message with order details and tracking link.'
  },
  {
    name: 'hello_world',
    category: 'UTILITY',
    language: 'en',
    status: 'APPROVED',
    body_text: 'Hello! Welcome to the WhatsApp Campaign Management System. This is a standard hello world template message containing no parameters.',
    params_count: 0,
    usage_description: 'Default template for testing and onboarding.'
  },
  {
    name: 'pos_marketing',
    category: 'MARKETING',
    language: 'en',
    status: 'APPROVED',
    body_text: 'Hey {{1}}! Thanks for shopping at {{2}}. We thought you would love a special {{3}} discount code on your next visit: {{4}}! Valid until {{5}}.',
    params_count: 5,
    usage_description: 'Send point-of-sale customer discount coupons.'
  },
  {
    name: 'pos_receipt',
    category: 'UTILITY',
    language: 'en',
    status: 'APPROVED',
    body_text: 'Hi {{1}}, here is your digital receipt for your recent purchase at {{2}} on {{3}}. Total amount: {{4}} {{5}}. View full receipt here: {{6}}',
    params_count: 6,
    usage_description: 'Point-of-sale digital receipt notification.'
  },
  {
    name: 'payment_receipt',
    category: 'UTILITY',
    language: 'en',
    status: 'APPROVED',
    body_text: 'Thank you {{1}}! We have successfully received your payment of {{2}} {{3}} for invoice {{4}}. Transaction reference: {{5}}.',
    params_count: 5,
    usage_description: 'Confirm successful invoice payment.'
  },
  {
    name: 'payment_link',
    category: 'UTILITY',
    language: 'en',
    status: 'APPROVED',
    body_text: 'Hello {{1}}, to pay for your outstanding invoice {{2}} with {{3}}, please use this secure payment link: {{4}}. Amount due: {{5}} {{6}}.',
    params_count: 6,
    usage_description: 'Send secure, quick-checkout payment links.'
  },
  {
    name: 'point_sale_marketing',
    category: 'MARKETING',
    language: 'en',
    status: 'APPROVED',
    body_text: 'Exclusive offer for {{1}}! Unlock a premium {{2}} off code: {{3}} for all items on our store at {{4}}.',
    params_count: 4,
    usage_description: 'Marketing campaign offer with coupon code.'
  }
];

export const INITIAL_CONTACTS: Contact[] = [
  { id: 1, name: 'Mohammad Imran', phone: '918446998579', email: 'imran@flexmind.in', synced_at: '2026-06-02T10:00:00Z', source: 'odoo' },
  { id: 2, name: 'Alice Vance', phone: '14155552671', email: 'alice.vance@gmail.com', synced_at: '2026-06-02T10:00:00Z', source: 'odoo' },
  { id: 3, name: 'John Doe', phone: '12125553920', email: 'john.doe@verizon.com', synced_at: '2026-06-02T10:00:00Z', source: 'odoo' },
  { id: 4, name: 'Sarah Jenkins', phone: '442079460192', email: 'sarah.j@techstart.io', synced_at: '2026-06-02T10:00:00Z', source: 'odoo' },
  { id: 5, name: 'Rajesh Kumar', phone: '919876543210', email: 'rajesh.kumar@ril.com', synced_at: '2026-06-02T10:00:00Z', source: 'odoo' },
  { id: 6, name: 'David Miller', phone: '13125557812', email: 'd.miller@millergroup.org', synced_at: '2026-06-02T10:00:00Z', source: 'odoo' },
  { id: 7, name: 'Emma Watson', phone: '441179460991', email: 'emma@watsonmedia.co.uk', synced_at: '2026-06-02T10:00:00Z', source: 'odoo' },
  { id: 8, name: 'Priya Sharma', phone: '919123456789', email: 'priya.sharma@tcs.com', synced_at: '2026-06-02T10:00:00Z', source: 'odoo' },
  { id: 9, name: 'Michael Chang', phone: '85291234567', email: 'm.chang@asiatech.hk', synced_at: '2026-06-02T10:00:00Z', source: 'odoo' },
  { id: 10, name: 'Sophie Dubois', phone: '33142277889', email: 'sophie.dubois@orange.fr', synced_at: '2026-06-02T10:00:00Z', source: 'odoo' },
  { id: 11, name: 'Carlos Rodriguez', phone: '34912345678', email: 'carlos.r@telefonica.es', synced_at: '2026-06-02T10:00:00Z', source: 'odoo' },
  { id: 12, name: 'Yuki Tanaka', phone: '819012345678', email: 'y.tanaka@softbank.co.jp', synced_at: '2026-06-02T10:00:00Z', source: 'odoo' },
  { id: 13, name: 'Jane Smith', phone: '16505550199', email: 'jane.smith@designco.com', synced_at: '2026-06-02T12:00:00Z', source: 'manual' },
  { id: 14, name: 'Robert Johnson', phone: '12065550144', email: 'r.johnson@builders.com', synced_at: '2026-06-02T12:00:00Z', source: 'manual' },
  { id: 15, name: 'Emily Davis', phone: '13125550188', email: 'emily@davislegal.com', synced_at: '2026-06-02T12:00:00Z', source: 'manual' }
];

// Generate extra contacts dynamically to make tables rich (up to 50 contacts)
const EXTRA_FIRST_NAMES = ['Aarav', 'Ananya', 'Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Ava', 'Elijah', 'Charlotte', 'William', 'Sophia', 'James', 'Amelia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Evelyn'];
const EXTRA_LAST_NAMES = ['Patel', 'Singh', 'Smith', 'Jones', 'Brown', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const EXTRA_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'corporate.com', 'startup.co', 'enterprise.org', 'services.in', 'agency.net'];

export const getSeededContacts = (): Contact[] => {
  const contacts = [...INITIAL_CONTACTS];
  let currentId = contacts.length + 1;
  
  for (let i = 0; i < 35; i++) {
    const firstName = EXTRA_FIRST_NAMES[i % EXTRA_FIRST_NAMES.length];
    const lastName = EXTRA_LAST_NAMES[(i * 3) % EXTRA_LAST_NAMES.length];
    const name = `${firstName} ${lastName}`;
    const domain = EXTRA_DOMAINS[(i * 7) % EXTRA_DOMAINS.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
    
    // Generate valid looking mock phone number
    const countryCode = [91, 1, 44, 33, 81][i % 5];
    const rest = Math.floor(1000000000 + Math.random() * 9000000000).toString().substring(0, 10 - countryCode.toString().length + 2);
    const phone = `${countryCode}${rest}`;
    
    contacts.push({
      id: currentId++,
      name,
      phone,
      email,
      synced_at: new Date(Date.now() - (i * 3600000)).toISOString(),
      source: i % 4 === 0 ? 'manual' : 'odoo'
    });
  }
  
  return contacts;
};

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    name: 'Outstanding Invoice Reminder - Q1',
    topic: 'Q1 Outstanding Payments Collection',
    template_name: 'payment_reminder',
    template_language: 'en',
    template_components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{contact_name}}' },
          { type: 'text', text: '5000' },
          { type: 'text', text: 'INR' },
          { type: 'text', text: 'Flexmind Innovations' }
        ]
      }
    ],
    status: 'completed',
    scheduled_at: null,
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 47 * 3600000).toISOString()
  },
  {
    id: 2,
    name: 'June Product Promotion Campaign',
    topic: 'Marketing Promotion for Point of Sale Users',
    template_name: 'pos_marketing',
    template_language: 'en',
    template_components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{contact_name}}' },
          { type: 'text', text: 'Flexmind Store' },
          { type: 'text', text: '20%' },
          { type: 'text', text: 'FLEX20' },
          { type: 'text', text: 'June 30, 2026' }
        ]
      }
    ],
    status: 'running',
    scheduled_at: null,
    created_at: new Date(Date.now() - 10 * 600000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 600000).toISOString()
  },
  {
    id: 3,
    name: 'Automated Sales Order Confirmation',
    topic: 'Sales Orders Confirmation Alerts',
    template_name: 'sale',
    template_language: 'en',
    template_components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{contact_name}}' },
          { type: 'text', text: 'SO/2026/00492' },
          { type: 'text', text: 'Flexmind ERP' },
          { type: 'text', text: '12500' },
          { type: 'text', text: 'INR' },
          { type: 'text', text: 'https://flexmind.odoo.com/orders/492' }
        ]
      }
    ],
    status: 'draft',
    scheduled_at: null,
    created_at: new Date(Date.now() - 1200000).toISOString(),
    updated_at: new Date(Date.now() - 1200000).toISOString()
  },
  {
    id: 4,
    name: 'Scheduled Weekly Payment Links',
    topic: 'Weekly Invoice Reminders',
    template_name: 'payment_link',
    template_language: 'en',
    template_components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{contact_name}}' },
          { type: 'text', text: 'INV/2026/082' },
          { type: 'text', text: 'Flexmind Innovations' },
          { type: 'text', text: 'https://flexmind.odoo.com/pay/inv082' },
          { type: 'text', text: '750' },
          { type: 'text', text: 'USD' }
        ]
      }
    ],
    status: 'scheduled',
    scheduled_at: new Date(Date.now() + 24 * 3600000).toISOString(), // Tomorrow
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString()
  }
];

export const generateMockMessages = (campaigns: Campaign[], contacts: Contact[]): CampaignMessage[] => {
  const messages: CampaignMessage[] = [];
  let currentId = 1;

  // Let's seed messages for Campaign 1 (Completed)
  const c1 = campaigns.find(c => c.id === 1);
  if (c1) {
    contacts.forEach((contact, idx) => {
      // 150 contacts or in this case, our 50 contacts list
      // Let's make: 2 failed, 4 sent, 8 delivered, rest read
      let status: DeliveryStatus = 'read';
      let error_message: string | null = null;
      
      if (idx % 20 === 0) {
        status = 'failed';
        error_message = 'Failed to deliver: Recipient phone number not registered on WhatsApp';
      } else if (idx % 15 === 0) {
        status = 'sent';
      } else if (idx % 12 === 0) {
        status = 'delivered';
      }

      messages.push({
        id: currentId++,
        campaign_id: 1,
        contact_id: contact.id,
        whatsapp_message_id: `wamid.HBgLOTE4NDQ2OTk4NTc5FQIAERgSRDFDMkJGN0I3OUQ0QkQyQUY3AA==_${idx}`,
        delivery_status: status,
        sent_at: new Date(Date.parse(c1.created_at) + (idx * 5000)).toISOString(),
        error_message,
        retry_count: status === 'failed' ? 3 : 0,
        created_at: c1.created_at
      });
    });
  }

  // Let's seed messages for Campaign 2 (Running)
  const c2 = campaigns.find(c => c.id === 2);
  if (c2) {
    // Only processed first 15 contacts so far
    contacts.slice(0, 22).forEach((contact, idx) => {
      let status: DeliveryStatus = 'read';
      if (idx > 18) {
        status = 'pending';
      } else if (idx > 15) {
        status = 'sent';
      } else if (idx > 10) {
        status = 'delivered';
      }

      messages.push({
        id: currentId++,
        campaign_id: 2,
        contact_id: contact.id,
        whatsapp_message_id: status === 'pending' ? null : `wamid.HBgLOTE4NDQ2OTk4NTc5FQIAERgSRDFDMkJGN0I3OUQ0QkQyQUY3BB==_${idx}`,
        delivery_status: status,
        sent_at: status === 'pending' ? null : new Date(Date.parse(c2.created_at) + (idx * 5000)).toISOString(),
        error_message: null,
        retry_count: 0,
        created_at: c2.created_at
      });
    });
    
    // Remaining contacts are in pending state
    contacts.slice(22).forEach((contact, _idx) => {
      messages.push({
        id: currentId++,
        campaign_id: 2,
        contact_id: contact.id,
        whatsapp_message_id: null,
        delivery_status: 'pending',
        sent_at: null,
        error_message: null,
        retry_count: 0,
        created_at: c2.created_at
      });
    });
  }

  return messages;
};

export const INITIAL_WHATSAPP_SETTINGS: WhatsAppSettings = {
  phone_number_id: '109283748293021',
  business_account_id: '928374920193847',
  token: 'EAAG3k0WZCTesBOzW2oZC94ZB7yL351ZBZA2ZCDyX1vR5gZC8jQYZCp8HZA9P1i66Qe2ZCRyZC6Y4ZAy578ZBwKjQ2ZBZA4Q3wU104zVb8ZA76nQvfZCYzK7QyXqgZBYZA9b24bWZCy381VwX059B2b330335ZAxZA003l86xX1F',
  status: 'connected'
};

export const INITIAL_ODOO_SETTINGS: OdooSettings = {
  url: 'https://flexmindinnovations.odoo.com',
  db: 'flexmind_db',
  username: 'mohammad.imran@flexmind.in',
  last_sync: new Date(Date.now() - 3 * 3600000).toISOString()
};

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  batch_size: 50,
  retry_count: 3,
  message_delay: 1
};

export const INITIAL_ACTIVITIES: RecentActivity[] = [
  {
    id: 'act-1',
    type: 'campaign_completed',
    campaign_name: 'Outstanding Invoice Reminder - Q1',
    details: 'Campaign completed successfully. 50 messages sent.',
    timestamp: new Date(Date.now() - 47 * 3600000).toISOString()
  },
  {
    id: 'act-2',
    type: 'contacts_synced',
    details: 'Synced 50 contacts from Odoo ERP database.',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'act-3',
    type: 'failed_delivery',
    campaign_name: 'Outstanding Invoice Reminder - Q1',
    contact_name: 'Emma Watson',
    details: 'Undelivered to +441179460991 due to invalid WhatsApp profile.',
    timestamp: new Date(Date.now() - 47.8 * 3600000).toISOString()
  },
  {
    id: 'act-4',
    type: 'campaign_started',
    campaign_name: 'June Product Promotion Campaign',
    details: 'Campaign started by administrator. Delivering in batches of 50.',
    timestamp: new Date(Date.now() - 10 * 600000).toISOString()
  }
];
