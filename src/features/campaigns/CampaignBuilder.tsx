import * as React from "react";
import { useStore } from "../../store/useStore";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Users, 
  Clock, 
  Sparkles,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../../components/ui/Badge";
import { toast } from "../../components/ui/Toast";
import { cn } from "../../components/ui/utils";

interface CampaignBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CampaignBuilder({ isOpen, onClose }: CampaignBuilderProps) {
  const templates = useStore(state => state.templates);
  const contacts = useStore(state => state.contacts);
  const addCampaign = useStore(state => state.addCampaign);
  const startCampaign = useStore(state => state.startCampaign);

  const [step, setStep] = React.useState(1);

  // Step 1 State
  const [name, setName] = React.useState("");
  const [topic, setTopic] = React.useState("");
  const [description, setDescription] = React.useState("");

  // Step 2 State
  const [selectedTemplateName, setSelectedTemplateName] = React.useState("payment_reminder");

  // Step 3 State
  const [audienceType, setAudienceType] = React.useState<"all" | "odoo" | "manual">("all");

  // Step 4 State
  const [sendOption, setSendOption] = React.useState<"now" | "later">("now");
  const [scheduleDate, setScheduleDate] = React.useState("");
  const [scheduleTime, setScheduleTime] = React.useState("");

  // Parameter Mapping Prefills (Step 5 Review)
  const template = templates.find(t => t.name === selectedTemplateName);

  React.useEffect(() => {
    if (isOpen) {
      // Reset wizard
      setStep(1);
      setName("");
      setTopic("");
      setDescription("");
      setSelectedTemplateName(templates[0]?.name || "payment_reminder");
      setAudienceType("all");
      setSendOption("now");
      setScheduleDate("");
      setScheduleTime("");
    }
  }, [isOpen, templates]);

  const handleNextStep = () => {
    if (step === 1 && (!name || !topic)) {
      toast.warning("Please specify both a Campaign Name and a Topic.");
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBackStep = () => {
    setStep(prev => prev - 1);
  };

  const handleLaunch = async () => {
    let scheduledAtStr: string | null = null;
    if (sendOption === "later") {
      if (!scheduleDate || !scheduleTime) {
        toast.warning("Please fill in both the Schedule Date and Time.");
        return;
      }
      scheduledAtStr = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    }

    // Prefill parameters dynamically
    // In our backend, template components map parameter fields
    const defaultParams = {
      payment_reminder: [
        { type: "text" as const, text: "{{contact_name}}" },
        { type: "text" as const, text: "5000" },
        { type: "text" as const, text: "INR" },
        { type: "text" as const, text: "Flexmind Innovations" }
      ],
      invoice: [
        { type: "text" as const, text: "{{contact_name}}" },
        { type: "text" as const, text: "INV/2026/089" },
        { type: "text" as const, text: "Flexmind ERP" },
        { type: "text" as const, text: "₹" },
        { type: "text" as const, text: "8500" },
        { type: "text" as const, text: "https://flexmind.odoo.com/invoices" }
      ],
      sale: [
        { type: "text" as const, text: "{{contact_name}}" },
        { type: "text" as const, text: "SO/2026/001" },
        { type: "text" as const, text: "Flexmind Innovations" },
        { type: "text" as const, text: "₹" },
        { type: "text" as const, text: "4500" },
        { type: "text" as const, text: "https://flexmind.odoo.com/tracking" }
      ],
      hello_world: []
    };

    const template_components = selectedTemplateName in defaultParams
      ? [{ type: "body" as const, parameters: defaultParams[selectedTemplateName as keyof typeof defaultParams] }]
      : [];

    try {
      const newCampaignId = await addCampaign({
        name,
        topic,
        template_name: selectedTemplateName,
        template_language: "en",
        template_components,
        scheduled_at: scheduledAtStr
      });

      if (sendOption === "now") {
        await startCampaign(newCampaignId);
        toast.success(`Campaign "${name}" initialized and launched successfully!`);
      } else {
        toast.success(`Campaign "${name}" scheduled successfully for ${scheduleDate} ${scheduleTime}.`);
      }
    } catch (e) {
      toast.error("Failed to execute campaign actions.");
    }

    onClose();
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Campaign Info";
      case 2: return "Choose Template";
      case 3: return "Define Audience";
      case 4: return "Scheduling Setup";
      case 5: return "Review & Launch";
      default: return "";
    }
  };

  const getAudienceCount = () => {
    if (audienceType === "all") return contacts.length;
    if (audienceType === "odoo") return contacts.filter(c => c.source === "odoo").length;
    return contacts.filter(c => c.source === "manual").length;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs dark:bg-slate-950/60"
          />

          {/* Wizard Outer Shell */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: "spring", duration: 0.35 }}
            className="relative z-10 w-full max-w-4xl h-[85vh] md:h-[80vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Header / Wizard Tracker */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-500 font-extrabold text-xs font-mono">
                  {step}/5
                </span>
                <div>
                  <h2 className="text-md font-bold text-slate-900 dark:text-white font-display">
                    {getStepTitle()}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">WhatsApp Campaigns Studio</p>
                </div>
              </div>
              
              {/* Step indicator pills */}
              <div className="hidden sm:flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      s === step 
                        ? "w-6 bg-emerald-500" 
                        : s < step 
                        ? "w-2.5 bg-emerald-500/40" 
                        : "w-2.5 bg-slate-200 dark:bg-slate-850"
                    )}
                  />
                ))}
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Step Content Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950/20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {/* STEP 1: Campaign Info */}
                  {step === 1 && (
                    <div className="space-y-6 max-w-xl mx-auto py-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                          Campaign Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Outstanding Invoice Reminder - June"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        />
                        <p className="text-[10px] text-slate-400">Provide a clear descriptive title for tracking logs and analytics.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                          Marketing Topic / Reason
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Collecting outstanding customer payments"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="w-full px-4 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                          Internal Notes
                        </label>
                        <textarea
                          placeholder="Provide any additional metadata context regarding this dispatch..."
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-4 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Choose Template */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="text-center max-w-md mx-auto mb-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Select one of your 9 approved Meta WhatsApp templates. Dynamic variables will prefill from contact database records automatically.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map((t) => {
                          const isSelected = selectedTemplateName === t.name;
                          return (
                            <div
                              key={t.name}
                              onClick={() => setSelectedTemplateName(t.name)}
                              className={cn(
                                "flex flex-col p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-slate-900",
                                isSelected
                                  ? "border-emerald-500 ring-2 ring-emerald-500/10 dark:border-emerald-500"
                                  : "border-slate-200 hover:border-slate-350 dark:border-slate-800 dark:hover:border-slate-700"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <code className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                                  {t.name}
                                </code>
                                <Badge variant="secondary" className="text-[9px] uppercase tracking-wide">
                                  {t.category}
                                </Badge>
                              </div>
                              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-normal line-clamp-3 bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded border border-slate-100 dark:border-slate-850 font-mono">
                                {t.body_text}
                              </p>
                              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-sans border-t border-slate-50 dark:border-slate-850/50 pt-2.5">
                                <span className="font-bold">{t.params_count} parameters required</span>
                                <span className="font-semibold capitalize">Lang: {t.language}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Define Audience */}
                  {step === 3 && (
                    <div className="space-y-6 max-w-xl mx-auto py-4">
                      <div className="text-center max-w-md mx-auto mb-6">
                        <Users className="mx-auto text-emerald-500 mb-2" size={28} />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Select which contact segments to target in this WhatsApp message dispatch queue.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {[
                          { id: "all", title: "Target All CRM Contacts", desc: "Dispatch to all customers synced from Odoo and manually input.", source: "All sources" },
                          { id: "odoo", title: "Odoo ERP Customers Only", desc: "Target only contacts synchronized from Odoo XML-RPC ERP database.", source: "Odoo sync" },
                          { id: "manual", title: "Custom Upload Segment", desc: "Target only manual phone numbers imported or created directly on CMS.", source: "Manual entries" }
                        ].map((opt) => {
                          const isSelected = audienceType === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => setAudienceType(opt.id as any)}
                              className={cn(
                                "flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-slate-900",
                                isSelected
                                  ? "border-emerald-500 ring-2 ring-emerald-500/10 dark:border-emerald-500"
                                  : "border-slate-200 hover:border-slate-350 dark:border-slate-800 dark:hover:border-slate-700"
                              )}
                            >
                              <div className="mt-1 flex items-center justify-center">
                                <div className={cn(
                                  "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                                  isSelected ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
                                )}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{opt.title}</h4>
                                  <span className="text-[10px] text-slate-400 font-mono font-semibold">{opt.source}</span>
                                </div>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Summary Banner */}
                      <div className="flex items-center gap-3 p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-400 dark:border-emerald-500/20 text-xs">
                        <Info size={16} />
                        <span className="font-semibold">
                          Total audience size based on selection: <strong className="font-bold underline">{getAudienceCount()} contacts</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Scheduling Setup */}
                  {step === 4 && (
                    <div className="space-y-6 max-w-xl mx-auto py-4">
                      <div className="text-center max-w-md mx-auto mb-6">
                        <Clock className="mx-auto text-emerald-500 mb-2" size={28} />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Set the date and time when this campaign background processor should begin dispatching templates.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: "now", title: "Immediate Send", desc: "Launch now, dispatch in batches in the background." },
                          { id: "later", title: "Schedule for Later", desc: "Configure future date & time parameters." }
                        ].map((opt) => {
                          const isSelected = sendOption === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => setSendOption(opt.id as any)}
                              className={cn(
                                "flex flex-col p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-slate-900 text-center items-center justify-center",
                                isSelected
                                  ? "border-emerald-500 ring-2 ring-emerald-500/10 dark:border-emerald-500"
                                  : "border-slate-200 hover:border-slate-350 dark:border-slate-800 dark:hover:border-slate-700"
                              )}
                            >
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{opt.title}</h4>
                              <p className="mt-1 text-[11px] text-slate-400 leading-normal">{opt.desc}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Date/Time pickers */}
                      <AnimatePresence>
                        {sendOption === "later" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850/50"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Schedule Date
                                </label>
                                <input
                                  type="date"
                                  required
                                  value={scheduleDate}
                                  onChange={(e) => setScheduleDate(e.target.value)}
                                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Schedule Time
                                </label>
                                <input
                                  type="time"
                                  required
                                  value={scheduleTime}
                                  onChange={(e) => setScheduleTime(e.target.value)}
                                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* STEP 5: Review & Launch */}
                  {step === 5 && (
                    <div className="space-y-6 max-w-xl mx-auto">
                      <div className="text-center max-w-md mx-auto mb-4">
                        <Sparkles className="mx-auto text-emerald-500 mb-1 animate-pulse" size={24} />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-display">Review Choices</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Confirm details below before launching campaign queue.
                        </p>
                      </div>

                      {/* Details Box */}
                      <div className="rounded-xl border border-slate-250 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 font-sans">Campaign Name</span>
                            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{name}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-sans">Topic Context</span>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{topic}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-50 dark:border-slate-850/50 pt-3">
                          <div>
                            <span className="text-slate-400 font-sans">Target Audience</span>
                            <p className="font-bold text-emerald-500 mt-0.5 capitalize">
                              {audienceType === 'all' ? 'All Contacts' : audienceType === 'odoo' ? 'Odoo ERP Sync' : 'Manual Uploads'} ({getAudienceCount()} targeted)
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-sans">Meta Template Fired</span>
                            <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedTemplateName}</p>
                          </div>
                        </div>

                        <div className="text-xs border-t border-slate-50 dark:border-slate-850/50 pt-3">
                          <span className="text-slate-400 font-sans">Dispatch Mode</span>
                          <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                            {sendOption === "now" 
                              ? "Instant Launch: deliverables fire immediately in batches." 
                              : `Scheduled Queue: begins at ${scheduleDate} ${scheduleTime}`}
                          </p>
                        </div>
                      </div>

                      {/* Mockup Preview Panel */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Dynamic WhatsApp Mock Bubble
                        </span>
                        <div className="rounded-xl border border-slate-100 bg-slate-100/60 dark:border-slate-850 dark:bg-slate-950/40 p-4 font-sans max-w-md mx-auto">
                          <div className="rounded-lg bg-white border border-slate-250 p-3 shadow-xs dark:bg-slate-900 dark:border-slate-800 text-[11px] leading-relaxed relative text-slate-800 dark:text-slate-200 max-w-xs ml-0">
                            {/* WhatsApp layout details */}
                            <p className="font-medium whitespace-pre-wrap">
                              {template?.body_text.replace("{{1}}", "Mohammad Imran").replace("{{2}}", "5000").replace("{{3}}", "INR").replace("{{4}}", "Flexmind Innovations")}
                            </p>
                            <span className="text-[8px] text-slate-400 absolute right-2 bottom-1">
                              12:30 PM ✓✓
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Control Panel */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
              <button
                disabled={step === 1}
                onClick={handleBackStep}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer",
                  step === 1 
                    ? "border-slate-100 text-slate-300 dark:border-slate-800 dark:text-slate-700 cursor-not-allowed" 
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                )}
              >
                <ArrowLeft size={14} />
                Back
              </button>

              {step < 5 ? (
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-850 rounded-lg shadow-sm transition-colors cursor-pointer dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  Continue
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleLaunch}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-lg shadow-emerald-500/25 transition-all cursor-pointer animate-pulse"
                >
                  <Check size={14} />
                  {sendOption === "now" ? "Launch Campaign" : "Schedule Campaign"}
                </button>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
