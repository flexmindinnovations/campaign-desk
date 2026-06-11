import * as React from "react";
import { useStore } from "../../store/useStore";
import { api } from "../../services/api";
import {
  Search,
  Plus,
  Receipt,
  Eye,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Bell
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatDate } from "../../components/ui/utils";
import { toast } from "../../components/ui/Toast";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { InvoiceCreateModal } from "./InvoiceCreateModal";
import { InvoiceDetailModal } from "./InvoiceDetailModal";
import type { Invoice } from "../../types/database";


export function InvoicesList() {
  const invoices = useStore(state => state.invoices);
  const fetchInvoices = useStore(state => state.fetchInvoices);
  const isApiConnected = useStore(state => state.isApiConnected);
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [stateFilter, setStateFilter] = React.useState<"all" | "draft" | "posted">("all");
  const [paymentFilter, setPaymentFilter] = React.useState<"all" | "paid" | "not_paid">("all");
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [sendingReminderFor, setSendingReminderFor] = React.useState<number | null>(null);

  const handleSendReminder = async (invoiceId: number) => {
    setSendingReminderFor(invoiceId);
    try {
      await api.sendPaymentReminder(invoiceId);
      toast.success("Payment reminder sent via WhatsApp.");
    } catch {
      toast.error("Failed to send payment reminder.");
    } finally {
      setSendingReminderFor(null);
    }
  };

  React.useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchInvoices();
      toast.success("Successfully synchronized invoices with Odoo ERP.");
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getPartnerName = (invoice: Invoice) => {
    if (invoice.partner_name) return invoice.partner_name;
    if (Array.isArray(invoice.partner_id)) {
      return invoice.partner_id[1];
    }
    return `Partner #${invoice.partner_id}`;
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const partnerName = getPartnerName(inv).toLowerCase();
    const nameMatch = inv.name.toLowerCase().includes(searchQuery.toLowerCase()) || partnerName.includes(searchQuery.toLowerCase());
    const stateMatch = stateFilter === "all" || inv.state === stateFilter;
    const paymentMatch = paymentFilter === "all" || inv.payment_state === paymentFilter;
    return nameMatch && stateMatch && paymentMatch;
  });

  // Analytics helper metrics
  const totalOutstanding = invoices
    .filter(inv => inv.payment_state !== "paid" && inv.state === "posted")
    .reduce((sum, inv) => sum + inv.amount_total, 0);

  const totalPaid = invoices
    .filter(inv => inv.payment_state === "paid" && inv.state === "posted")
    .reduce((sum, inv) => sum + inv.amount_total, 0);

  const draftCount = invoices.filter(inv => inv.state === "draft").length;

  return (
    <div className="p-6 space-y-6 grid-bg-dots">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white leading-tight flex items-center gap-2">
            <Receipt className="text-emerald-500" size={24} />
            Invoices Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Generate and manage customer invoices on Odoo CRM, and dispatch instant payment alerts over WhatsApp.
          </p>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing || !isApiConnected} title="Refresh from Odoo">
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          </Button>
          <Button type="button" onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus size={14} /> New Invoice
          </Button>
        </div>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Paid Invoices</span>
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mt-0.5">
                ₹ {totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 dark:bg-amber-950/10 border-amber-500/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Outstanding</span>
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mt-0.5">
                ₹ {totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50 dark:bg-slate-950/10 border-slate-200/50 dark:border-slate-800/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Draft Invoices</span>
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mt-0.5">
                {draftCount} <span className="text-xs text-slate-400 font-normal">awaiting validation</span>
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter panel */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full md:max-w-md">
              <Input
                placeholder="Search invoices by number or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={14} />}
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
              {/* Validation filter */}
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                {[
                  { id: "all", label: "All Status" },
                  { id: "draft", label: "Draft" },
                  { id: "posted", label: "Confirmed" }
                ].map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setStateFilter(s.id as any)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                      stateFilter === s.id
                        ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Payment filter */}
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                {[
                  { id: "all", label: "All Payments" },
                  { id: "paid", label: "Paid" },
                  { id: "not_paid", label: "Unpaid" }
                ].map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setPaymentFilter(s.id as any)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                      paymentFilter === s.id
                        ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead className="bg-slate-50/70 border-b border-slate-100 dark:bg-slate-900/50 dark:border-slate-800/50 font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <tr>
                <th className="p-4 pl-6">Invoice Number</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Invoice Date</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Validation State</th>
                <th className="p-4">Payment State</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => {
                  const partnerName = getPartnerName(invoice);
                  return (
                    <tr
                      key={invoice.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white font-display text-sm">
                        {invoice.name}
                      </td>
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{partnerName}</td>
                      <td className="p-4 font-mono text-slate-450 dark:text-slate-400">{formatDate(invoice.invoice_date)}</td>
                      <td className="p-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        ₹ {invoice.amount_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={invoice.state === "posted" ? "success" : "secondary"} 
                          className="text-[10px] uppercase font-bold tracking-wide"
                        >
                          {invoice.state === "posted" ? "Posted" : "Draft"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={invoice.payment_state === "paid" ? "success" : "warning"} 
                          className="text-[10px] uppercase font-bold tracking-wide"
                        >
                          {invoice.payment_state === "paid" ? "Paid" : "Not Paid"}
                        </Badge>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          {invoice.payment_state !== "paid" && invoice.state === "posted" && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={sendingReminderFor === invoice.id}
                              onClick={() => handleSendReminder(invoice.id)}
                              className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-950/20"
                            >
                              <Bell size={11} />
                              {sendingReminderFor === invoice.id ? "Sending…" : "Remind"}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInvoiceId(invoice.id)}
                            className="gap-1.5"
                          >
                            <Eye size={11} /> Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      <InvoiceCreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      
      {selectedInvoiceId !== null && (
        <InvoiceDetailModal 
          invoiceId={selectedInvoiceId} 
          onClose={() => setSelectedInvoiceId(null)} 
        />
      )}
    </div>
  );
}
