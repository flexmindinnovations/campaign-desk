import * as React from "react";
import { useStore } from "../../store/useStore";
import { X, Plus, Trash, Receipt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "../../components/ui/Toast";

interface InvoiceCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ItemLineInput {
  name: string;
  quantity: number;
  price_unit: number;
}

export function InvoiceCreateModal({ isOpen, onClose }: InvoiceCreateModalProps) {
  const contacts = useStore(state => state.contacts);
  const createInvoice = useStore(state => state.createInvoice);
  
  const [partnerId, setPartnerId] = React.useState<number>(0);
  const [invoiceDate, setInvoiceDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [lines, setLines] = React.useState<ItemLineInput[]>([
    { name: "", quantity: 1, price_unit: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Auto-select first contact
  React.useEffect(() => {
    if (contacts.length > 0 && partnerId === 0) {
      // Find Odoo contact preferably or just first one
      const odooContact = contacts.find(c => c.source === 'odoo');
      setPartnerId(odooContact ? odooContact.id : contacts[0].id);
    }
  }, [contacts, partnerId]);

  if (!isOpen) return null;

  const handleAddLine = () => {
    setLines([...lines, { name: "", quantity: 1, price_unit: 0 }]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length === 1) {
      toast.warning("Invoice must have at least one line item.");
      return;
    }
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: keyof ItemLineInput, value: string | number) => {
    const nextLines = [...lines];
    nextLines[idx] = {
      ...nextLines[idx],
      [field]: value
    };
    setLines(nextLines);
  };

  const grandTotal = lines.reduce((sum, line) => sum + (line.quantity * line.price_unit), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (partnerId === 0) {
      toast.warning("Please select a customer.");
      return;
    }

    const emptyLines = lines.some(line => !line.name.trim() || line.price_unit <= 0);
    if (emptyLines) {
      toast.warning("Please configure item names and valid prices for all lines.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Find active contact matching store ID to retrieve Odoo Partner ID
      const contactObj = contacts.find(c => c.id === partnerId);
      if (!contactObj) {
        toast.error("Contact details not found.");
        return;
      }

      await createInvoice({
        partner_id: contactObj.id,
        invoice_date: invoiceDate,
        lines
      });

      // Reset
      setLines([{ name: "", quantity: 1, price_unit: 0 }]);
      onClose();
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-10 w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display flex gap-2 items-center">
              <Receipt size={18} className="text-emerald-500" />
              Generate Draft Invoice
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-xs font-semibold">
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Customer and Date Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400">Select Customer (From Odoo CRM)</label>
                  <select
                    value={partnerId}
                    onChange={(e) => setPartnerId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.source === 'odoo' ? 'Odoo ERP' : 'Manual'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-display">Invoice Line Items</h4>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-500 cursor-pointer"
                  >
                    <Plus size={12} />
                    Add Row
                  </button>
                </div>

                <div className="space-y-3">
                  {lines.map((line, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-end p-3 rounded-lg border border-slate-150 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-950/20">
                      
                      {/* Product Name */}
                      <div className="flex-1 w-full space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase">Item Description / Label</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Monthly Retainer Services"
                          value={line.name}
                          onChange={(e) => handleLineChange(idx, "name", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="w-full sm:w-20 space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase">Qty</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={line.quantity}
                          onChange={(e) => handleLineChange(idx, "quantity", Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>

                      {/* Price */}
                      <div className="w-full sm:w-28 space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase">Unit Price (₹)</label>
                        <input
                          type="number"
                          required
                          min={0.01}
                          step="0.01"
                          placeholder="0.00"
                          value={line.price_unit || ""}
                          onChange={(e) => handleLineChange(idx, "price_unit", Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="p-2 border border-rose-200 hover:bg-rose-50 text-rose-500 rounded-lg cursor-pointer dark:border-rose-950 dark:hover:bg-rose-955/20 shrink-0"
                      >
                        <Trash size={14} />
                      </button>

                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex justify-end p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="text-right space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Estimated Grand Total</span>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                    ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h3>
                </div>
              </div>

            </div>

            {/* Sticky Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-slate-55 border border-slate-200 text-slate-700 rounded-lg shadow-xs transition-colors cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/80"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-40"
              >
                {isSubmitting ? "Generating..." : "Generate Invoice"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
