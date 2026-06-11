import * as React from "react";
import { useStore } from "../../store/useStore";
import { 
  Search, 
  Download, 
  UserPlus, 
  Mail, 
  Phone, 
  Database, 
  User, 
  History,
  FileText,
  X,
  Plus,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge, getDeliveryStatusBadge } from "../../components/ui/Badge";
import { formatDate } from "../../components/ui/utils";
import { toast } from "../../components/ui/Toast";
import { cn } from "../../components/ui/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";

export function ContactsList() {
  const contacts = useStore(state => state.contacts);
  const addManualContact = useStore(state => state.addManualContact);
  const messages = useStore(state => state.messages);
  const campaigns = useStore(state => state.campaigns);
  const templates = useStore(state => state.templates);
  const sendChatMessage = useStore(state => state.sendChatMessage);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [sourceFilter, setSourceFilter] = React.useState<"all" | "odoo" | "manual">("all");
  
  // Drawer selection state
  const [drawerContactId, setDrawerContactId] = React.useState<number | null>(null);
  const [drawerSubTab, setDrawerSubTab] = React.useState<"profile" | "campaigns" | "chat" | "send_message">("profile");

  // Add Contact Form State
  const [isAddFormOpen, setIsAddFormOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");

  // Send Message Tab State
  const [messageType, setMessageType] = React.useState<"template" | "custom">("template");
  const [customText, setCustomText] = React.useState("");
  const [selectedCampaignId, setSelectedCampaignId] = React.useState<number | null>(null);
  const [selectedTemplateName, setSelectedTemplateName] = React.useState("payment_reminder");
  const [paramValues, setParamValues] = React.useState<string[]>([]);

  const selectedContact = contacts.find(c => c.id === drawerContactId);

  const selectedTemplate = templates.find(t => t.name === selectedTemplateName) || templates[0];

  const getInterpolatedPreviewText = () => {
    if (messageType === "custom") {
      return customText || "Type a message to see preview...";
    }
    if (!selectedTemplate) return "";
    let formattedText = selectedTemplate.body_text;
    paramValues.forEach((val, idx) => {
      const replacement = val.trim() ? val : `{{${idx + 1}}}`;
      formattedText = formattedText.replace(`{{${idx + 1}}}`, replacement);
    });
    return formattedText;
  };

  React.useEffect(() => {
    if (selectedTemplate && selectedContact) {
      const initial = Array(selectedTemplate.params_count).fill("");
      if (selectedTemplate.params_count > 0) {
        initial[0] = selectedContact.name;
      }
      
      // Prefills for demo data
      if (selectedTemplate.name === "payment_reminder") {
        if (selectedTemplate.params_count > 1) initial[1] = "5000";
        if (selectedTemplate.params_count > 2) initial[2] = "INR";
        if (selectedTemplate.params_count > 3) initial[3] = "Flexmind Innovations";
      } else if (selectedTemplate.name === "invoice") {
        if (selectedTemplate.params_count > 1) initial[1] = "INV/2026/089";
        if (selectedTemplate.params_count > 2) initial[2] = "Flexmind ERP";
        if (selectedTemplate.params_count > 3) initial[3] = "₹";
        if (selectedTemplate.params_count > 4) initial[4] = "25000";
      } else if (selectedTemplate.name === "sale") {
        if (selectedTemplate.params_count > 1) initial[1] = "SO-4992";
        if (selectedTemplate.params_count > 2) initial[2] = "9900";
        if (selectedTemplate.params_count > 3) initial[3] = "USD";
      }
      
      setParamValues(initial);
    }
  }, [selectedTemplateName, selectedContact, selectedTemplate]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;

    if (messageType === "custom") {
      if (!customText.trim()) {
        toast.warning("Please type a message before sending.");
        return;
      }
      sendChatMessage(selectedContact.id, customText);
      toast.success(`Custom message sent to +${selectedContact.phone}!`);
      setCustomText("");
      setDrawerSubTab("chat"); // redirect to log tab
    } else {
      if (!selectedTemplate) return;
      
      // Validate all template parameters are filled
      const unfilledIdx = paramValues.findIndex(val => !val.trim());
      if (unfilledIdx !== -1) {
        toast.warning(`Please fill in Parameter {{${unfilledIdx + 1}}}.`);
        return;
      }

      // Interpolate parameters into template body text
      let formattedText = selectedTemplate.body_text;
      paramValues.forEach((val, idx) => {
        formattedText = formattedText.replace(`{{${idx + 1}}}`, val);
      });

      // Format variables for Meta API payload
      const components = [
        {
          type: "body" as const,
          parameters: paramValues.map(val => ({
            type: "text" as const,
            text: val
          }))
        }
      ];

      sendChatMessage(
        selectedContact.id, 
        formattedText, 
        false, 
        selectedCampaignId, 
        {
          templateName: selectedTemplateName,
          components
        }
      );
      toast.success(`Template "${selectedTemplateName}" sent to +${selectedContact.phone}!`);
      
      // Reset form & redirect
      setSelectedCampaignId(null);
      setSelectedTemplateName(templates[0]?.name || "payment_reminder");
      setDrawerSubTab("chat"); // redirect to log tab
    }
  };

  // Filter Contacts
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.phone.includes(searchQuery) ||
                          (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSource = sourceFilter === "all" || c.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  // Export filtered contacts to CSV
  const handleExportCSV = () => {
    if (filteredContacts.length === 0) {
      toast.warning("No contacts available to export.");
      return;
    }

    const headers = ["ID", "Name", "Phone", "Email", "Source", "Synced At"];
    const rows = filteredContacts.map(c => [
      c.id,
      c.name,
      c.phone,
      c.email || "",
      c.source,
      c.synced_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `whatsapp_contacts_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Successfully exported ${filteredContacts.length} contacts to CSV file.`);
  };

  // Add contact handler (Odoo ERP & local PostgreSQL)
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) {
      toast.warning("Name and Phone Number are required.");
      return;
    }
    
    // Check if phone already exists
    if (contacts.some(c => c.phone === newPhone)) {
      toast.error("Contact with this phone number already exists.");
      return;
    }

    try {
      await addManualContact({
        name: newName,
        phone: newPhone,
        email: newEmail
      });

      setIsAddFormOpen(false);
      setNewName("");
      setNewPhone("");
      setNewEmail("");
    } catch (err) {
      // Error is handled and displayed by store action toast, keep form open for edits
      console.error(err);
    }
  };

  const handleRowClick = (id: number) => {
    setDrawerContactId(id);
    setDrawerSubTab("profile");
  };

  // Contact history loaders
  const getContactCampaigns = (contactId: number) => {
    const contactMessages = messages.filter(m => m.contact_id === contactId && m.campaign_id !== 9999);
    return contactMessages.map(m => {
      const camp = campaigns.find(c => c.id === m.campaign_id);
      return {
        campaign_name: camp?.name || "Deleted Campaign",
        status: m.delivery_status,
        sent_at: m.sent_at,
        error_message: m.error_message
      };
    });
  };

  const getContactChatHistory = (contactId: number) => {
    // Renders special direct chat logs (campaign_id = 9999) or normal logs
    return messages.filter(m => m.contact_id === contactId);
  };

  return (
    <div className="p-6 space-y-6 grid-bg-dots">
      {/* Header and Sync widget */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white leading-tight">
            Contacts Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Inspect, search, and manage Odoo ERP synced accounts and custom numbers.
          </p>
        </div>

        <div className="flex gap-2">
          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/80"
          >
            <Download size={14} />
            Export CSV
          </button>
          
          {/* Add Manual Contact */}
          <button
            onClick={() => setIsAddFormOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <UserPlus size={14} />
            Add Contact
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search inputs */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search contacts by name, email, or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Source Segment filter */}
            <div className="flex gap-2 w-full md:w-auto">
              {[
                { id: "all", label: "All Contacts" },
                { id: "odoo", label: "Odoo ERP" },
                { id: "manual", label: "Manual Entries" }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSourceFilter(s.id as any)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer border ${
                    sourceFilter === s.id
                      ? "bg-slate-900 text-slate-100 border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800/80"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Grid Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead className="bg-slate-50/70 border-b border-slate-100 dark:bg-slate-900/50 dark:border-slate-800/50 font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <tr>
                <th className="p-4 pl-6">Contact Name</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Sync Source</th>
                <th className="p-4 pr-6">Last Contacted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => {
                  const contactMsg = messages.filter(m => m.contact_id === contact.id && m.sent_at);
                  const lastContacted = contactMsg.length > 0
                    ? new Date(Math.max(...contactMsg.map(m => Date.parse(m.sent_at!)))).toISOString()
                    : null;
                    
                  return (
                    <tr
                      key={contact.id}
                      onClick={() => handleRowClick(contact.id)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors cursor-pointer"
                    >
                      <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white font-display text-sm">
                        {contact.name}
                      </td>
                      <td className="p-4 font-mono font-semibold">+{contact.phone}</td>
                      <td className="p-4 text-slate-450 dark:text-slate-400 font-mono">{contact.email || "—"}</td>
                      <td className="p-4">
                        <Badge variant={contact.source === "odoo" ? "success" : "secondary"} className="text-[10px] uppercase font-bold tracking-wide">
                          {contact.source === "odoo" ? "Odoo ERP" : "Manual"}
                        </Badge>
                      </td>
                      <td className="p-4 pr-6 text-slate-400 font-mono">{lastContacted ? formatDate(lastContacted) : "Never contacted"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No contacts found matching your parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DETAILED PROFILE DRAWER DIALOG (SLIDE OUT FROM RIGHT) */}
      <AnimatePresence>
        {drawerContactId && selectedContact && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerContactId(null)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs dark:bg-slate-950/50"
            />

            {/* Slide Out Panel Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="relative z-10 w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm">
                    {selectedContact.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-md text-slate-900 dark:text-white font-display">
                      {selectedContact.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Contact Details</span>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerContactId(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Sub-Navigation tabs */}
              <div className="flex p-1 mx-6 mt-4 rounded-lg bg-slate-100 dark:bg-slate-800/80 shrink-0 text-xs">
                {[
                  { id: "profile", label: "Profile", icon: User },
                  { id: "campaigns", label: "Campaigns", icon: History },
                  { id: "chat", label: "Message Logs", icon: FileText },
                  { id: "send_message", label: "Send Message", icon: Send }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDrawerSubTab(t.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-bold transition-all cursor-pointer",
                      drawerSubTab === t.id 
                        ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-50" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    )}
                  >
                    <t.icon size={13} />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Drawer scrollable content */}
              {/* Drawer scrollable content or form wrapper */}
              {drawerSubTab === "send_message" ? (
                <form onSubmit={handleSendMessage} className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Message Type Toggle segment switches */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outbound Mode</label>
                      <div className="flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800 w-full">
                        <button
                          type="button"
                          onClick={() => setMessageType("template")}
                          className={cn(
                            "flex-1 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer",
                            messageType === "template"
                              ? "bg-white text-slate-955 shadow-xs dark:bg-slate-900 dark:text-slate-50"
                              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                          )}
                        >
                          WhatsApp Template
                        </button>
                        <button
                          type="button"
                          onClick={() => setMessageType("custom")}
                          className={cn(
                            "flex-1 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer",
                            messageType === "custom"
                              ? "bg-white text-slate-955 shadow-xs dark:bg-slate-900 dark:text-slate-50"
                              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                          )}
                        >
                          Custom Text
                        </button>
                      </div>
                    </div>

                    {messageType === "custom" ? (
                      /* CUSTOM TEXT MODE */
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message Content</label>
                          <textarea
                            placeholder="Type a custom WhatsApp message body here..."
                            rows={5}
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal font-medium">
                          Note: Free-form custom messages require a customer interaction within the last 24 hours under Meta's Cloud API policies.
                        </p>
                      </div>
                    ) : (
                      /* WHATSAPP TEMPLATE MODE */
                      <div className="space-y-4">
                        {/* Select Campaign */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Associate with Campaign (Optional)</label>
                          <Select
                            value={selectedCampaignId ? String(selectedCampaignId) : "direct"}
                            onValueChange={(val) => {
                              const cId = val === "direct" ? null : parseInt(val, 10);
                              setSelectedCampaignId(cId);
                              if (cId) {
                                const camp = campaigns.find(c => c.id === cId);
                                if (camp) {
                                  setSelectedTemplateName(camp.template_name);
                                }
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Direct Message (No Campaign)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="direct">Direct Message (No Campaign)</SelectItem>
                              {campaigns.map(c => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Select Template */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select WhatsApp Template</label>
                          <Select
                            value={selectedTemplateName}
                            onValueChange={(val) => setSelectedTemplateName(val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Template" />
                            </SelectTrigger>
                            <SelectContent>
                              {templates.map(t => (
                                <SelectItem key={t.name} value={t.name}>{t.name} ({t.category.toUpperCase()})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Dynamic Parameters Inputs */}
                        {selectedTemplate && selectedTemplate.params_count > 0 && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Template Variables Configuration</label>
                            <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20">
                              {Array.from({ length: selectedTemplate.params_count }).map((_, idx) => (
                                <div key={idx} className="space-y-1">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Variable {idx + 1} ({"{{"}{idx + 1}{"}}"})</span>
                                  <input
                                    type="text"
                                    required
                                    value={paramValues[idx] || ""}
                                    onChange={(e) => {
                                      const newVals = [...paramValues];
                                      newVals[idx] = e.target.value;
                                      setParamValues(newVals);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                                    placeholder={`Enter value for variable {{${idx + 1}}}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* WhatsApp Live Preview Bubble */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                        <span>Live WhatsApp Preview</span>
                        <span className="text-[9px] text-slate-400 font-mono tracking-normal capitalize">{messageType} message</span>
                      </label>
                      
                      <div 
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-end space-y-1 relative overflow-hidden min-h-[110px] bg-[#efeae2] dark:bg-[#0b141a]"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%239C92AC' fill-opacity='0.04'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40-8c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM30 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z'/%3E%3C/g%3E%3C/svg%3E")`
                        }}
                      >
                        <div className="relative p-2.5 rounded-lg max-w-[88%] self-end shadow-sm bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] border border-[#c1e8bb] dark:border-[#004d3e] flex flex-col space-y-1">
                          <p className="text-[11px] leading-normal font-sans whitespace-pre-wrap pr-10 pb-1.5">
                            {getInterpolatedPreviewText()}
                          </p>
                          <div className="self-end flex items-center gap-1 text-[8.5px] text-[#667781] dark:text-[#8696a0] mt-0.5 select-none shrink-0 ml-auto absolute bottom-1 right-1.5">
                            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-[#53bdeb] font-bold">✓✓</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                  
                  {/* Sticky Footer */}
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-md transition-colors cursor-pointer"
                    >
                      <Send size={14} />
                      Send to WhatsApp
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* PROFILE TAB */}
                  {drawerSubTab === "profile" && (
                    <div className="space-y-6 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-950/40 dark:border-slate-850">
                          <Phone size={15} className="text-slate-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-slate-400">WhatsApp Phone</span>
                            <p className="font-mono mt-0.5 truncate font-bold">+{selectedContact.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-950/40 dark:border-slate-850">
                          <Mail size={15} className="text-slate-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-slate-400">Email Address</span>
                            <p className="font-mono mt-0.5 truncate font-bold">{selectedContact.email || "No Email Provided"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-950/40 dark:border-slate-850">
                          <Database size={15} className="text-slate-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-slate-400">CRM Sync Source</span>
                            <p className="mt-0.5 capitalize font-bold">{selectedContact.source === 'odoo' ? 'Odoo ERP Server sync' : 'Manual Dashboard creation'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Contact Sync Date</span>
                          <span className="font-mono text-slate-500">{formatDate(selectedContact.synced_at)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Database Entry ID</span>
                          <span className="font-mono text-slate-500">#{selectedContact.id}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CAMPAIGNS HISTORIES TAB */}
                  {drawerSubTab === "campaigns" && (
                    <div className="space-y-4">
                      {getContactCampaigns(selectedContact.id).length > 0 ? (
                        getContactCampaigns(selectedContact.id).map((c, idx) => (
                          <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-slate-50/50 dark:bg-slate-950/20">
                            <div className="flex items-center justify-between font-bold">
                              <span className="truncate max-w-[200px] text-slate-800 dark:text-slate-200">{c.campaign_name}</span>
                              {getDeliveryStatusBadge(c.status)}
                            </div>
                            <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <span>Dispatched time</span>
                              <span>{formatDate(c.sent_at)}</span>
                            </div>
                            {c.error_message && (
                              <p className="mt-2 p-2 rounded text-[10px] bg-rose-500/10 text-rose-500 border border-rose-500/10 leading-normal font-medium">
                                {c.error_message}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-6">
                          This contact has not participated in any campaigns yet.
                        </p>
                      )}
                    </div>
                  )}

                  {/* MESSAGE LOG DETAILS TAB */}
                  {drawerSubTab === "chat" && (
                    <div className="space-y-4">
                      {getContactChatHistory(selectedContact.id).length > 0 ? (
                        getContactChatHistory(selectedContact.id).map((m, idx) => {
                          const chatBody = localStorage.getItem(`chat_body_${m.whatsapp_message_id}`);
                          const campName = m.campaign_id === 9999 ? "Direct Chat Support" : "Marketing Campaign Dispatch";
                          
                          return (
                            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 text-xs space-y-2">
                              <div className="flex items-center justify-between font-bold text-slate-400">
                                <span className="text-[10px]">{campName}</span>
                                {getDeliveryStatusBadge(m.delivery_status)}
                              </div>
                              
                              {chatBody ? (
                                <p className="p-2.5 rounded-lg bg-white border border-slate-100 text-slate-800 dark:bg-slate-900 dark:border-slate-850/80 leading-normal font-sans">
                                  {chatBody}
                                </p>
                              ) : (
                                <p className="text-[11px] text-slate-400 font-mono italic">
                                  Fired WhatsApp Template Component (Ref {m.whatsapp_message_id?.substring(0, 12)}...)
                                </p>
                              )}

                              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                                <span>Log ID: #{m.id}</span>
                                <span>{formatDate(m.sent_at || m.created_at)}</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-6">
                          No direct template messages or chat logs found.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD MANUAL CONTACT DRAWER (SLIDE IN FORM) */}
      <AnimatePresence>
        {isAddFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddFormOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs dark:bg-slate-950/50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-855 pb-4 mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display flex gap-2 items-center">
                  <UserPlus size={18} className="text-emerald-500" />
                  Add Manual Contact
                </h3>
                <button
                  onClick={() => setIsAddFormOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddContact} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-400">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Johnathan Doe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">WhatsApp Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 918446998579 (include country code, omit +)"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. john.doe@corp.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-md transition-colors cursor-pointer mt-6"
                >
                  <Plus size={14} />
                  Add Contact to CRM
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
