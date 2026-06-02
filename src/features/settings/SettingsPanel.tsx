import * as React from "react";
import { useStore } from "../../store/useStore";
import { 
  Key, 
  Database, 
  Sliders, 
  Check, 
  Eye, 
  EyeOff
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { toast } from "../../components/ui/Toast";
import { cn, formatDate } from "../../components/ui/utils";

export function SettingsPanel() {
  const whatsappSettings = useStore(state => state.whatsappSettings);
  const odooSettings = useStore(state => state.odooSettings);
  const systemSettings = useStore(state => state.systemSettings);
  const updateWhatsAppSettings = useStore(state => state.updateWhatsAppSettings);
  const updateOdooSettings = useStore(state => state.updateOdooSettings);
  const updateSystemSettings = useStore(state => state.updateSystemSettings);
  const resetAllData = useStore(state => state.resetAllData);

  const [activeTab, setActiveTab] = React.useState<"whatsapp" | "odoo" | "system">("whatsapp");
  
  // WhatsApp States
  const [phoneId, setPhoneId] = React.useState(whatsappSettings.phone_number_id);
  const [bizId, setBizId] = React.useState(whatsappSettings.business_account_id);
  const [token, setToken] = React.useState(whatsappSettings.token);
  const [showToken, setShowToken] = React.useState(false);

  // Odoo States
  const [odooUrl, setOdooUrl] = React.useState(odooSettings.url);
  const [odooDb, setOdooDb] = React.useState(odooSettings.db);
  const [odooUser, setOdooUser] = React.useState(odooSettings.username);

  // System States
  const [batchSize, setBatchSize] = React.useState(systemSettings.batch_size);
  const [retries, setRetries] = React.useState(systemSettings.retry_count);
  const [delay, setDelay] = React.useState(systemSettings.message_delay);

  const handleWhatsAppSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWhatsAppSettings({
      phone_number_id: phoneId,
      business_account_id: bizId,
      token,
      status: "connected"
    });
    toast.success("WhatsApp Cloud API settings saved successfully.");
  };

  const handleOdooSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOdooSettings({
      url: odooUrl,
      db: odooDb,
      username: odooUser
    });
    toast.success("Odoo ERP parameters successfully configured.");
  };

  const handleSystemSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      batch_size: Number(batchSize),
      retry_count: Number(retries),
      message_delay: Number(delay)
    });
    toast.success("Internal dispatcher queues saved successfully.");
  };

  const handleFullWipe = () => {
    if (window.confirm("CAUTION: This will wipe out all custom campaigns, contacts synced, and settings back to initial seeded values. Proceed?")) {
      resetAllData();
      toast.error("Database fully wiped. Seed values reloaded.");
      
      // Reload states
      setPhoneId(whatsappSettings.phone_number_id);
      setBizId(whatsappSettings.business_account_id);
      setToken(whatsappSettings.token);
      setOdooUrl(odooSettings.url);
      setOdooDb(odooSettings.db);
      setOdooUser(odooSettings.username);
      setBatchSize(systemSettings.batch_size);
      setRetries(systemSettings.retry_count);
      setDelay(systemSettings.message_delay);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6 max-w-4xl mx-auto grid-bg-lines font-sans text-xs font-semibold text-slate-800 dark:text-slate-200"
    >
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white leading-tight">
            Settings Console
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Configure CRM databases, Meta account credentials, and system batch delays.
          </p>
        </div>

        {/* Wipe action */}
        <button
          onClick={handleFullWipe}
          className="px-3 py-1.5 font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-xs cursor-pointer dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400"
        >
          Wipe Workspace Data
        </button>
      </div>

      {/* Tab selectors card */}
      <Card>
        <CardContent className="p-2 flex gap-2">
          {[
            { id: "whatsapp", label: "WhatsApp Cloud API", icon: Key },
            { id: "odoo", label: "Odoo ERP Server", icon: Database },
            { id: "system", label: "Queue Parameters", icon: Sliders }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all cursor-pointer",
                activeTab === t.id
                  ? "bg-slate-900 text-slate-100 border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800/80"
              )}
            >
              <t.icon size={14} />
              <span>{t.label}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* WHATSAPP CONFIGS PANEL */}
      {activeTab === "whatsapp" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Meta Developer Console Credentials</CardTitle>
                <CardDescription>Authorize API integration to send approved templates.</CardDescription>
              </div>
              <Badge variant="success" className="font-mono">Bearer Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWhatsAppSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400">WhatsApp Phone Number ID</label>
                  <input
                    type="text"
                    required
                    value={phoneId}
                    onChange={(e) => setPhoneId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Business Account ID</label>
                  <input
                    type="text"
                    required
                    value={bizId}
                    onChange={(e) => setBizId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="text-slate-400">System Bearer Token (Permanent Page Token)</label>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 truncate"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-655 cursor-pointer"
                  >
                    {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-md transition-colors cursor-pointer mt-6"
              >
                <Check size={14} />
                Save API Credentials
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ODOO CONFIGS PANEL */}
      {activeTab === "odoo" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Odoo XML-RPC Integration</CardTitle>
                <CardDescription>Details used to synchronize Odoo partner databases.</CardDescription>
              </div>
              {odooSettings.last_sync && (
                <span className="text-[10px] text-slate-400 font-mono">
                  Last Sync: {formatDate(odooSettings.last_sync)}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOdooSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-400">Odoo URL Instance</label>
                <input
                  type="url"
                  required
                  placeholder="https://company.odoo.com"
                  value={odooUrl}
                  onChange={(e) => setOdooUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400">Odoo Database Name</label>
                  <input
                    type="text"
                    required
                    value={odooDb}
                    onChange={(e) => setOdooDb(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Username / Email</label>
                  <input
                    type="email"
                    required
                    value={odooUser}
                    onChange={(e) => setOdooUser(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-md transition-colors cursor-pointer mt-6"
              >
                <Check size={14} />
                Save ERP Connection
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* SYSTEM QUEUES CONFIG PANEL */}
      {activeTab === "system" && (
        <Card>
          <CardHeader>
            <CardTitle>Internal Dispatch Queues Tuning</CardTitle>
            <CardDescription>Optimize background batch speeds to bypass Meta Graph limits.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSystemSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-slate-400">Campaign Batch Size</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    required
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                  <p className="text-[10px] text-slate-400 font-sans">Number of messages sent in a single batch block (standard default is 50).</p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Max Retry Attempts</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    required
                    value={retries}
                    onChange={(e) => setRetries(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                  <p className="text-[10px] text-slate-400 font-sans">Number of retry dispatches before marking message status as FAILED.</p>
                </div>
              </div>

              {/* Slider for delay */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-baseline">
                  <label className="text-slate-400">Inter-Message Batch Delay (seconds)</label>
                  <span className="font-mono text-emerald-500 font-extrabold text-sm">{delay} seconds</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={delay}
                  onChange={(e) => setDelay(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-slate-100 dark:bg-slate-850 accent-emerald-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 font-sans">Throttle latency between individual messages in a batch. Prevents Meta Graph abuse flags.</p>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-md transition-colors cursor-pointer mt-6"
              >
                <Check size={14} />
                Save Dispatch Parameters
              </button>
            </form>
          </CardContent>
        </Card>
      )}

    </motion.div>
  );
}
