import * as React from "react";
import { useStore } from "../../store/useStore";
import { 
  Search, 
  RefreshCw, 
  Smartphone,
  CheckCircle,
  ExternalLink,
  ChevronLeft,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { toast } from "../../components/ui/Toast";
import { cn } from "../../components/ui/utils";

export function TemplatesGallery() {
  const templates = useStore(state => state.templates);
  const syncTemplates = useStore(state => state.syncTemplates);
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [selectedTemplateName, setSelectedTemplateName] = React.useState<string | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const selectedTemplate = templates.find(t => t.name === selectedTemplateName);

  // Filter templates
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.body_text.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleSyncClick = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    toast.info("Connecting to Meta Graph API to sync template versions...");
    
    try {
      await syncTemplates();
      toast.success("Meta WhatsApp templates successfully synchronized! 9 approved templates updated.");
    } catch (e) {
      toast.error("Template Sync failed: API connection timeout.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Dynamically Prefill parameters for the mobile WhatsApp mockup
  const getMockPrefilledBodyText = (body: string, name: string) => {
    switch (name) {
      case 'payment_reminder':
        return body
          .replace('{{1}}', 'Mohammad Imran')
          .replace('{{2}}', '5000')
          .replace('{{3}}', 'INR')
          .replace('{{4}}', 'Flexmind Innovations');
      case 'invoice':
        return body
          .replace('{{1}}', 'Alice Vance')
          .replace('{{2}}', 'INV/2026/0049')
          .replace('{{3}}', 'Flexmind Store')
          .replace('{{4}}', '₹')
          .replace('{{5}}', '4200')
          .replace('{{6}}', 'https://flexmind.odoo.com/invoices');
      case 'sale':
        return body
          .replace('{{1}}', 'John Doe')
          .replace('{{2}}', 'SO/2026/0129')
          .replace('{{3}}', 'Flexmind ERP')
          .replace('{{4}}', '₹')
          .replace('{{5}}', '12500')
          .replace('{{6}}', 'https://flexmind.odoo.com/orders/129');
      case 'pos_marketing':
        return body
          .replace('{{1}}', 'Sarah Jenkins')
          .replace('{{2}}', 'Flexmind Outlet')
          .replace('{{3}}', '20% OFF')
          .replace('{{4}}', 'FLEXCODE20')
          .replace('{{5}}', 'June 30, 2026');
      case 'pos_receipt':
        return body
          .replace('{{1}}', 'Rajesh Kumar')
          .replace('{{2}}', 'Flexmind POS')
          .replace('{{3}}', 'June 2, 2026')
          .replace('{{4}}', '₹')
          .replace('{{5}}', '350')
          .replace('{{6}}', 'https://receipts.flexmind.in/r/pos8932');
      case 'payment_receipt':
        return body
          .replace('{{1}}', 'David Miller')
          .replace('{{2}}', '₹')
          .replace('{{3}}', '5000')
          .replace('{{4}}', 'INV/2026/089')
          .replace('{{5}}', 'TXN984392091');
      case 'payment_link':
        return body
          .replace('{{1}}', 'Emma Watson')
          .replace('{{2}}', 'INV-832')
          .replace('{{3}}', 'Flexmind Media')
          .replace('{{4}}', 'https://secure.pay.flexmind.in/pay/inv832')
          .replace('{{5}}', '150')
          .replace('{{6}}', 'USD');
      case 'point_sale_marketing':
        return body
          .replace('{{1}}', 'Michael Chang')
          .replace('{{2}}', '15% Discount')
          .replace('{{3}}', 'SALE15')
          .replace('{{4}}', 'flexmind.in/shop');
      default:
        return body;
    }
  };

  return (
    <div className="p-6 space-y-6 grid-bg-dots">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white leading-tight">
            WhatsApp Template Library
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Inspect, preview, and sync your Meta-approved template catalogs instantly.
          </p>
        </div>

        <button
          onClick={handleSyncClick}
          disabled={isSyncing}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-850 rounded-lg shadow-md transition-colors cursor-pointer shrink-0 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white",
            isSyncing && "opacity-70 cursor-not-allowed"
          )}
        >
          <RefreshCw size={14} className={cn("text-emerald-500", isSyncing && "animate-spin")} />
          Sync from Meta
        </button>
      </div>

      {/* Filter panel */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search query */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search templates by name or keyword content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 w-full md:w-auto">
              {[
                { id: "all", label: "All Templates" },
                { id: "MARKETING", label: "Marketing" },
                { id: "UTILITY", label: "Utility" },
                { id: "AUTHENTICATION", label: "Authentication" }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer border ${
                    categoryFilter === c.id
                      ? "bg-slate-900 text-slate-100 border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800/80"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((t) => (
            <motion.div
              key={t.name}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card hoverGlow className="h-full flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/20">
                      APPROVED
                    </span>
                    <Badge variant="secondary" className="text-[9px] uppercase tracking-wide">
                      {t.category}
                    </Badge>
                  </div>
                  <CardTitle className="mt-3 text-sm truncate font-bold font-mono">
                    {t.name}
                  </CardTitle>
                  <CardDescription className="text-[10px] uppercase font-mono tracking-wider font-semibold">
                    Language: {t.language}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 py-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono leading-normal bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-lg border border-slate-100 dark:border-slate-850/50 line-clamp-4">
                    {t.body_text}
                  </p>
                </CardContent>
                <div className="px-6 py-4 mt-4 border-t border-slate-50 dark:border-slate-850/30 flex items-center justify-between shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold font-sans">
                    {t.params_count} parameters required
                  </span>
                  
                  <button
                    onClick={() => setSelectedTemplateName(t.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Smartphone size={12} />
                    Mobile Mockup
                  </button>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-400">
            No templates found matching your queries.
          </div>
        )}
      </div>

      {/* MOBILE PHONE MOCKUP DIALOG (OVERLAY PANEL) */}
      <AnimatePresence>
        {selectedTemplateName && selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTemplateName(null)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs dark:bg-slate-950/60"
            />

            {/* Content modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[85vh]"
            >
              {/* Left Panel: Details metadata */}
              <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-h-[40vh] md:max-h-none border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedTemplateName(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  Back to Template Library
                </button>

                <div>
                  <h3 className="text-lg font-black font-display text-slate-900 dark:text-white font-mono leading-none">
                    {selectedTemplate.name}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="uppercase text-[9px] tracking-wide font-mono font-bold">
                      {selectedTemplate.category}
                    </Badge>
                    <Badge variant="success" className="text-[9px] uppercase tracking-wide font-mono font-bold">
                      Meta Sync: APPROVED
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Template Usage</span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">{selectedTemplate.usage_description}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Raw Message Format</span>
                    <p className="bg-slate-50 border border-slate-100 p-3 rounded-lg font-mono leading-normal text-slate-500 dark:bg-slate-950/40 dark:border-slate-850">
                      {selectedTemplate.body_text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Panel: Stunning, Premium WhatsApp Device Mockup */}
              <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-6 md:p-8 flex items-center justify-center overflow-y-auto max-h-[45vh] md:max-h-none border-t md:border-t-0 border-slate-200 dark:border-slate-900">
                
                {/* Physical iOS Frame Mockup */}
                <div className="w-[260px] h-[480px] rounded-[36px] bg-slate-950 border-[6px] border-slate-900 shadow-2xl relative flex flex-col overflow-hidden shrink-0">
                  
                  {/* Dynamic Time & Notch Status Bar */}
                  <div className="h-6 w-full bg-slate-950 text-white flex items-center justify-between px-6 text-[8px] font-bold font-sans shrink-0">
                    <span>12:30 PM</span>
                    {/* Speaker Notch */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-3 rounded-b-md bg-slate-900 z-10" />
                    <div className="flex gap-1.5 items-center">
                      <span>LTE</span>
                      <div className="w-4 h-2 rounded-xs border border-white p-0.5 flex items-center">
                        <div className="h-full w-full bg-white rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Branded WhatsApp Chat Header */}
                  <div className="h-11 bg-slate-900 text-white flex items-center px-4 gap-2.5 shrink-0 select-none">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                      FI
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black font-display truncate">Flexmind Innovations</p>
                      <p className="text-[7px] text-emerald-400 font-semibold leading-none mt-0.5">Online Support</p>
                    </div>
                  </div>

                  {/* Messaging Bubble Canvas Area */}
                  <div className="flex-1 bg-slate-100 dark:bg-slate-950/20 p-3 font-sans space-y-3 overflow-y-auto relative grid-bg-lines">
                    
                    {/* Timestamp Center Node */}
                    <div className="flex justify-center select-none">
                      <span className="px-2 py-0.5 rounded-md bg-white/70 text-slate-400 font-bold text-[7px] border border-slate-200/50 uppercase tracking-wide">
                        Today
                      </span>
                    </div>

                    {/* WhatsApp Message Bubble Card */}
                    <div className="flex flex-col max-w-[210px] bg-white border border-slate-250 rounded-xl rounded-tl-none shadow-xs p-2.5 space-y-2 relative dark:bg-slate-900 dark:border-slate-800">
                      
                      {/* Message Content prefilled */}
                      <p className="text-[10px] text-slate-800 dark:text-slate-200 leading-normal font-sans">
                        {getMockPrefilledBodyText(selectedTemplate.body_text, selectedTemplate.name)}
                      </p>
                      
                      {/* Checkmarks & Time indicator */}
                      <div className="flex justify-end select-none">
                        <span className="text-[7px] text-slate-400 font-semibold font-mono flex items-center gap-0.5">
                          12:30 PM 
                          <span className="text-blue-500 font-bold">✓✓</span>
                        </span>
                      </div>

                      {/* Dynamic CTA buttons inside the message bubble */}
                      {selectedTemplate.name === 'payment_reminder' && (
                        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 flex items-center justify-center gap-1.5 text-blue-500 text-[8px] font-bold select-none cursor-pointer">
                          <CheckCircle size={10} />
                          <span>Pay Invoice</span>
                        </div>
                      )}

                      {selectedTemplate.name === 'invoice' && (
                        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 flex items-center justify-center gap-1.5 text-blue-500 text-[8px] font-bold select-none cursor-pointer">
                          <ExternalLink size={10} />
                          <span>View Invoice Link</span>
                        </div>
                      )}

                      {selectedTemplate.name === 'sale' && (
                        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 flex items-center justify-center gap-1.5 text-blue-500 text-[8px] font-bold select-none cursor-pointer">
                          <ExternalLink size={10} />
                          <span>Track Shipment</span>
                        </div>
                      )}

                      {selectedTemplate.name === 'payment_link' && (
                        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 flex items-center justify-center gap-1.5 text-blue-500 text-[8px] font-bold select-none cursor-pointer">
                          <ExternalLink size={10} />
                          <span>Pay Now</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Simulated Keyboard Entry Shell */}
                  <div className="h-10 bg-white border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800 px-3 flex items-center justify-between text-[9px] text-slate-400 select-none shrink-0 font-sans">
                    <span>Type a message...</span>
                    <Send size={11} className="text-slate-400" />
                  </div>

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
