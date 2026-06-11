import * as React from "react";
import { useStore } from "../../store/useStore";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Tv,
  Send,
  CheckCircle,
  MailOpen,
  AlertTriangle,
  Search,
  Clock,
  Terminal,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/Card";
import { Tooltip } from "../../components/ui/Tooltip";
import { getCampaignStatusBadge, getDeliveryStatusBadge } from "../../components/ui/Badge";
import { formatDate, formatNumber, formatPercent } from "../../components/ui/utils";

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const campaignId = id ? parseInt(id, 10) : null;
  
  const campaigns = useStore(state => state.campaigns);
  const contacts = useStore(state => state.contacts);
  const getCampaignAnalytics = useStore(state => state.getCampaignAnalytics);
  const getCampaignMessages = useStore(state => state.getCampaignMessages);

  const [activeSubTab, setActiveSubTab] = React.useState<"overview" | "analytics" | "recipients" | "logs">("overview");
  const [recipientQuery, setRecipientQuery] = React.useState("");
  const [recipientStatus, setRecipientStatus] = React.useState("all");

  const campaign = campaigns.find(c => c.id === campaignId);
  const fetchCampaignDetailsAndAnalytics = useStore(state => state.fetchCampaignDetailsAndAnalytics);
  const isApiConnected = useStore(state => state.isApiConnected);

  React.useEffect(() => {
    if (isApiConnected && campaign?.id) {
      fetchCampaignDetailsAndAnalytics(campaign.id);

      if (campaign.status === 'running') {
        const intervalId = setInterval(() => {
          fetchCampaignDetailsAndAnalytics(campaign.id);
        }, 3500);
        return () => clearInterval(intervalId);
      }
    }
    return undefined;
  }, [campaign?.id, campaign?.status, isApiConnected, fetchCampaignDetailsAndAnalytics]);
  
  if (!campaign) {
    return (
      <div className="p-8 text-center py-20">
        <p className="text-slate-400">Campaign not found.</p>
        <button onClick={() => navigate("/campaigns")} className="mt-4 text-emerald-500 font-bold underline">
          Go Back
        </button>
      </div>
    );
  }

  const analytics = getCampaignAnalytics(campaign.id)!;
  const campaignMessages = getCampaignMessages(campaign.id);

  // Filter recipients table
  const filteredRecipients = campaignMessages.filter(m => {
    const contact = contacts.find(c => c.id === m.contact_id);
    if (!contact) return false;
    
    const matchesSearch = contact.name.toLowerCase().includes(recipientQuery.toLowerCase()) ||
                          contact.phone.includes(recipientQuery) ||
                          (contact.email && contact.email.toLowerCase().includes(recipientQuery.toLowerCase()));
    
    const matchesStatus = recipientStatus === "all" || m.delivery_status === recipientStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate Funnel Width Percentages
  const sentPercent = analytics.total_contacts > 0 ? (analytics.sent / analytics.total_contacts) * 100 : 0;
  const deliveredPercent = analytics.sent > 0 ? (analytics.delivered / analytics.sent) * 100 : 0;
  const readPercent = analytics.delivered > 0 ? (analytics.read / analytics.delivered) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="p-6 space-y-6 grid-bg-dots font-sans"
    >
      {/* Header and Back Link */}
      <div className="space-y-4">
        <button
          onClick={() => navigate("/campaigns")}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Campaigns Directory
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                {campaign.name}
              </h1>
              {getCampaignStatusBadge(campaign.status)}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{campaign.topic}</p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 w-fit shrink-0">
            {(["overview", "analytics", "recipients", "logs"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                  activeSubTab === tab
                    ? "bg-white text-slate-950 shadow-xs dark:bg-slate-900 dark:text-slate-50"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* OVERVIEW SUB-PAGE */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* Main KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { title: "Target Audience", value: analytics.total_contacts, icon: Tv, color: "text-slate-500" },
              { title: "Dispatched", value: analytics.sent, icon: Send, color: "text-blue-500" },
              { title: "Delivered", value: analytics.delivered, icon: CheckCircle, color: "text-emerald-500" },
              { title: "Opened / Read", value: analytics.read, icon: MailOpen, color: "text-emerald-600" },
              { title: "Failed Dispatches", value: analytics.failed, icon: AlertTriangle, color: "text-rose-500" }
            ].map((k) => {
              const Icon = k.icon;
              return (
                <Card key={k.title}>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{k.title}</span>
                    <Icon size={20} className={`mt-2.5 ${k.color}`} />
                    <span className="text-xl font-black font-display text-slate-900 dark:text-white mt-2 leading-none">
                      {formatNumber(k.value)}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meta Template card */}
            <Card>
              <CardHeader>
                <CardTitle>Dispatched Template Profile</CardTitle>
                <CardDescription>WhatsApp approved marketing/utility message details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-slate-400">Template Identifier</span>
                    <p className="font-mono text-slate-900 dark:text-white mt-0.5">{campaign.template_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Selected Language</span>
                    <p className="text-slate-900 dark:text-white mt-0.5">English (en)</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Parameters Substitution</span>
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-3.5 dark:bg-slate-950/40 dark:border-slate-850 space-y-1.5">
                    {campaign.template_components?.[0]?.parameters.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 shrink-0">
                          {idx + 1}
                        </span>
                        <code className="text-[11px] font-mono text-slate-700 dark:text-slate-350 truncate">
                          {p.text}
                        </code>
                      </div>
                    )) || <span className="text-xs text-slate-400">No parameters mapped (Standard Hello World test).</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Timeline Context */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Execution Lifespan</CardTitle>
                <CardDescription>Background scheduler dates and latency metrics.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850/50 pb-2">
                  <span className="text-slate-400 flex items-center gap-2"><Clock size={14} /> Created Date</span>
                  <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">{formatDate(campaign.created_at)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850/50 pb-2">
                  <span className="text-slate-400 flex items-center gap-2"><Clock size={14} /> Fired / Started</span>
                  <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                    {campaign.status === 'draft' ? "Pending Start" : formatDate(campaign.updated_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850/50 pb-2">
                  <span className="text-slate-400 flex items-center gap-2"><Clock size={14} /> Schedule Target</span>
                  <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">{formatDate(campaign.scheduled_at) || "Send Now (Immediate)"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2"><Activity size={14} /> Batch Settings</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">50 Contacts per Batch / 1s Delay</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ANALYTICS & FUNNEL SUB-PAGE */}
      {activeSubTab === "analytics" && (
        <div className="space-y-6">
          {/* Conversion Funnel Card */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Conversion Funnel</CardTitle>
              <CardDescription>Visual chart demonstrating receipt retention rates across targeted lists.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-xl mx-auto py-4">
              {[
                { label: "Targeted Contacts", value: analytics.total_contacts, percentage: "100%", color: "bg-slate-400" },
                { label: "Sent / Dispatched", value: analytics.sent, percentage: `${sentPercent.toFixed(1)}%`, color: "bg-blue-500" },
                { label: "Delivered to Device", value: analytics.delivered, percentage: `${deliveredPercent.toFixed(1)}% of sent`, color: "bg-emerald-400" },
                { label: "Read / Opened", value: analytics.read, percentage: `${readPercent.toFixed(1)}% of delivered`, color: "bg-emerald-500" }
              ].map((step, idx) => (
                <div key={step.label} className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-slate-500 dark:text-slate-400">{step.label}</span>
                    <div className="flex gap-2">
                      <span className="font-mono font-bold text-slate-800 dark:text-white">{formatNumber(step.value)}</span>
                      <span className="text-slate-400 font-mono">({step.percentage})</span>
                    </div>
                  </div>
                  {/* Progress bar line */}
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden border border-slate-200/50 dark:border-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${idx === 0 ? 100 : idx === 1 ? sentPercent : idx === 2 ? sentPercent * (deliveredPercent / 100) : sentPercent * (deliveredPercent / 100) * (readPercent / 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full ${step.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Core Analytics Rates Gauges Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Message Delivery Rate", value: formatPercent(analytics.delivery_rate), desc: "Percentage of sent messages successfully received by destination handsets.", border: "border-t-blue-500" },
              { title: "Customer Read Rate", value: formatPercent(analytics.read_rate), desc: "Percentage of delivered messages opened and read by recipients.", border: "border-t-emerald-500" },
              { title: "Delivery Failure Rate", value: formatPercent(analytics.failure_rate), desc: "Percentage of dispatches which failed due to bad numbers or Graph API limits.", border: "border-t-rose-500" }
            ].map((g) => (
              <Card key={g.title} className={`border-t-4 ${g.border}`}>
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wide">{g.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-display leading-none mt-2">
                    {g.value}
                  </span>
                  <p className="mt-4 text-xs text-slate-400 leading-relaxed font-sans">{g.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* RECIPIENTS LOG TABLE SUB-PAGE */}
      {activeSubTab === "recipients" && (
        <Card>
          <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Table search query */}
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search recipient contacts..."
                  value={recipientQuery}
                  onChange={(e) => setRecipientQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Status filtering pills */}
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1.5 md:pb-0">
                {['all', 'pending', 'sent', 'delivered', 'read', 'failed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setRecipientStatus(st)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wide border cursor-pointer ${
                      recipientStatus === st
                        ? "bg-slate-900 text-slate-100 border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                        : "bg-white text-slate-400 border-slate-200 dark:bg-slate-900 dark:border-slate-850 dark:hover:bg-slate-800"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Recipient Name</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Delivery Status</th>
                  <th className="p-4">Meta Message ID</th>
                  <th className="p-4 text-center">Retries</th>
                  <th className="p-4 pr-6">Processed Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredRecipients.length > 0 ? (
                  filteredRecipients.map((m) => {
                    const contact = contacts.find(c => c.id === m.contact_id);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white">{contact?.name || "Unknown"}</td>
                        <td className="p-4 font-mono">+{contact?.phone}</td>
                        <td className="p-4">{getDeliveryStatusBadge(m.delivery_status)}</td>
                        <td className="p-4">
                          {m.whatsapp_message_id ? (
                            <Tooltip content={m.whatsapp_message_id} side="top">
                              <span className="font-mono text-[10px] text-slate-400 truncate block max-w-[180px] cursor-help">
                                {m.whatsapp_message_id}
                              </span>
                            </Tooltip>
                          ) : (
                            <span className="font-mono text-[10px] text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="p-4 text-center font-mono">{m.retry_count}</td>
                        <td className="p-4 pr-6 font-mono text-slate-400">{formatDate(m.sent_at)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No matching recipients logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* RAW BACKEND TERMINAL EXECUTION LOGS */}
      {activeSubTab === "logs" && (
        <Card className="border-slate-850">
          <CardHeader className="bg-slate-950 border-b border-slate-900 p-4">
            <div className="flex items-center gap-2">
              <Terminal size={15} className="text-emerald-500 animate-pulse" />
              <span className="font-mono text-xs font-bold text-slate-350">
                JSON Structured Terminal Logs — app/jobs/campaign_job.py
              </span>
            </div>
          </CardHeader>
          <CardContent className="bg-slate-950 p-4 font-mono text-[11px] text-slate-400 overflow-x-auto space-y-2 h-[450px] overflow-y-auto">
            <p className="text-slate-500">{"// [SYSTEM Lifespan Startup] Connecting PostgreSQL Database engine..."}</p>
            <p className="text-slate-500">{"// APScheduler MemoryJobStore initialized."}</p>
            
            {campaignMessages.slice(0, 30).map((m, idx) => {
              const contact = contacts.find(c => c.id === m.contact_id);
              const nowStamp = new Date(Date.parse(m.created_at) + idx * 2000).toISOString();
              
              return (
                <div key={idx} className="space-y-1">
                  <p className="text-slate-300">
                    <span className="text-blue-400">{`[${formatDate(nowStamp)}]`}</span>{" "}
                    <span className="text-emerald-500">INFO</span>: Creating message dispatch record for contact_id={m.contact_id} phone={contact?.phone}
                  </p>
                  
                  {m.delivery_status !== 'pending' && (
                    <p className="text-slate-400 pl-4">
                      <span className="text-slate-500">↪ Dispatching JSON:</span>{" "}
                      {`{"template": "${campaign.template_name}", "to": "+${contact?.phone}", "status": "sent"}`}
                    </p>
                  )}

                  {m.delivery_status === 'failed' && (
                    <p className="text-rose-400 pl-4 font-bold">
                      <span className="text-rose-500">✖ ERROR</span>: {m.error_message} (Attempt {m.retry_count} failed)
                    </p>
                  )}

                  {(m.delivery_status === 'delivered' || m.delivery_status === 'read') && (
                    <p className="text-emerald-400 pl-4">
                      <span className="text-emerald-500">✔ WEBHOOK</span>: Received Meta Cloud event update. Message ID {m.whatsapp_message_id?.substring(0, 15)}... marked as <strong className="uppercase">{m.delivery_status}</strong>.
                    </p>
                  )}
                </div>
              );
            })}
            
            {campaign.status === 'completed' && (
              <p className="text-emerald-400 font-bold border-t border-slate-900 pt-3">
                {`[SYSTEM] INFO: Campaign ID=${campaign.id} finished successfully. Total contacts processed=${analytics.total_contacts}, delivery_rate=${analytics.delivery_rate.toFixed(2)}`}
              </p>
            )}
          </CardContent>
        </Card>
      )}

    </motion.div>
  );
}
