import * as React from "react";
import { useStore } from "../../store/useStore";
import { X, Send, CheckCircle, AlertTriangle, FileText, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "../../components/ui/Toast";
import { Badge } from "../../components/ui/Badge";
import { formatDate } from "../../components/ui/utils";
import { api } from "../../services/api";
import type { Invoice, InvoiceLine } from "../../types/database";
import { APP_CONFIG } from "../../appConstant";


interface InvoiceDetailModalProps {
  invoiceId: number;
  onClose: () => void;
}

export function InvoiceDetailModal({ invoiceId, onClose }: InvoiceDetailModalProps) {
  const invoices = useStore(state => state.invoices);
  const postInvoice = useStore(state => state.postInvoice);
  const sendInvoiceWhatsApp = useStore(state => state.sendInvoiceWhatsApp);
  const isApiConnected = useStore(state => state.isApiConnected);
  
  const localInvoice = invoices.find(inv => inv.id === invoiceId) || null;
  const [apiInvoice, setApiInvoice] = React.useState<Invoice | null>(null);
  const [isValidating, setIsValidating] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);

  // Derived loading state to avoid calling setState synchronously in an effect
  const isLoading = isApiConnected && (!apiInvoice || apiInvoice.id !== invoiceId);

  // Derived state to avoid calling setState synchronously in an effect
  const invoice = isApiConnected ? (apiInvoice || localInvoice) : localInvoice;

  // WhatsApp Alert Form States
  const [companyName, setCompanyName] = React.useState(APP_CONFIG.DEFAULT_COMPANY_NAME);
  const [invoiceUrl, setInvoiceUrl] = React.useState<string | null>(null);

  // Derived state to avoid calling setState synchronously in an effect
  const currentInvoiceUrl = invoiceUrl !== null ? invoiceUrl : (invoice ? `${APP_CONFIG.DEFAULT_ODOO_URL}/my/invoices/${invoice.id}` : "");


  React.useEffect(() => {
    if (isApiConnected) {
      api.getInvoiceDetail(invoiceId)
        .then(data => {
          setApiInvoice(data);
        })
        .catch((error: unknown) => {
          console.error(error);
          toast.error("Failed to load invoice lines from Odoo.");
          setApiInvoice(localInvoice);
        });
    }
  }, [invoiceId, isApiConnected, localInvoice]);

  if (!invoice) return null;

  const handlePostInvoice = async () => {
    setIsValidating(true);
    try {
      await postInvoice(invoice.id);
      // Reload details
      if (isApiConnected) {
        const updated = await api.getInvoiceDetail(invoice.id);
        setApiInvoice(updated);
      }
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSendWhatsApp = async () => {
    setIsSending(true);
    try {
      await sendInvoiceWhatsApp(invoice.id, {
        template_name: "invoice",
        template_language: "en",
        company_name: companyName,
        invoice_url: currentInvoiceUrl || undefined
      });
      onClose();
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const getPartnerName = () => {
    if (invoice.partner_name) return invoice.partner_name;
    if (Array.isArray(invoice.partner_id)) {
      return invoice.partner_id[1];
    }
    return `Partner #${invoice.partner_id}`;
  };

  const lines = invoice.invoice_line_ids || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-955/40 backdrop-blur-xs dark:bg-slate-950/50"
        />

        {/* Modal content container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-10 w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 flex items-center justify-center font-bold text-sm shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-md text-slate-900 dark:text-white font-display">
                  {invoice.name}
                </h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                  Odoo Invoice Details
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-semibold">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500">Syncing with Odoo ERP...</p>
              </div>
            ) : (
              <>
                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Customer</span>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{getPartnerName()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Invoice Date</span>
                      <p className="font-mono text-slate-700 dark:text-slate-300 mt-0.5">{formatDate(invoice.invoice_date)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Validation State</span>
                      <div className="mt-0.5">
                        <Badge variant={invoice.state === "posted" ? "success" : "secondary"}>
                          {invoice.state === "posted" ? "Posted / Confirmed" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Payment State</span>
                      <div className="mt-0.5">
                        <Badge variant={invoice.payment_state === "paid" ? "success" : "warning"}>
                          {invoice.payment_state === "paid" ? "Fully Paid" : "Unpaid"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Validation Banner if Draft */}
                {invoice.state === "draft" && (
                  <div className="p-3.5 rounded-lg border border-amber-500/10 bg-amber-500/5 text-amber-600 dark:text-amber-400 flex items-start gap-3">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-1">
                      <p className="font-bold">Draft Invoice Alert</p>
                      <p className="text-[10px] leading-normal font-medium text-slate-500 dark:text-slate-400">
                        This invoice is currently in a draft status. Draft invoices do not represent official sales ledger bookings in Odoo.
                      </p>
                      <button
                        type="button"
                        onClick={handlePostInvoice}
                        disabled={isValidating}
                        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-md transition-all cursor-pointer shadow-xs"
                      >
                        <CheckCircle size={12} />
                        {isValidating ? "Validating..." : "Confirm & Validate (Post)"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Invoice Lines Table */}
                <div className="space-y-2">
                  <h4 className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Line Items Summary</h4>
                  <div className="rounded-lg border border-slate-150 dark:border-slate-800/80 overflow-hidden">
                    <table className="w-full border-collapse text-left text-[11px]">
                      <thead className="bg-slate-55 dark:bg-slate-950/40 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-150 dark:border-slate-800/80">
                        <tr>
                          <th className="p-3 pl-4">Description</th>
                          <th className="p-3 text-right">Quantity</th>
                          <th className="p-3 text-right">Unit Price</th>
                          <th className="p-3 pr-4 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 dark:divide-slate-800/60 text-slate-700 dark:text-slate-350 bg-slate-50/20">
                        {lines.map((line: InvoiceLine, idx: number) => (
                          <tr key={idx}>
                            <td className="p-3 pl-4 font-bold text-slate-900 dark:text-white">{line.name}</td>
                            <td className="p-3 text-right font-mono font-medium">{line.quantity}</td>
                            <td className="p-3 text-right font-mono font-medium">₹ {line.price_unit.toFixed(2)}</td>
                            <td className="p-3 pr-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                              ₹ {(line.price_subtotal || (line.quantity * line.price_unit)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-end p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                  <div className="text-right space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Grand Total</span>
                    <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                      ₹ {invoice.amount_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                </div>

                {/* Send WhatsApp notification panel */}
                {invoice.state === "posted" && (
                  <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 dark:bg-emerald-950/10 space-y-3">
                    <h4 className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                      <Send size={12} />
                      Send WhatsApp Notification (Meta Template)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Company Name Parameter</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Globe size={10} />
                          Invoice Link Parameter
                        </label>
                        <input
                          type="url"
                          value={currentInvoiceUrl}
                          onChange={(e) => setInvoiceUrl(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendWhatsApp}
                      disabled={isSending}
                      className="w-full flex items-center justify-center gap-2 py-2 text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-40 font-bold"
                    >
                      <Send size={12} />
                      {isSending ? "Sending Notification..." : "Dispatch Invoice via WhatsApp"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-55 border border-slate-200 text-slate-700 rounded-lg shadow-xs transition-colors cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/80"
            >
              Close
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
