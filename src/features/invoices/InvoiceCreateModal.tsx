import * as React from "react";
import { Plus, Trash2, Receipt } from "lucide-react";
import { useStore } from "../../store/useStore";
import { toast } from "../../components/ui/Toast";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
  DialogClose,
} from "../../components/ui/Dialog";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { DatePicker } from "../../components/ui/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";
import { cn } from "../../components/ui/utils";

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
  const contacts = useStore((s) => s.contacts);
  const createInvoice = useStore((s) => s.createInvoice);

  const [partnerId, setPartnerId] = React.useState<string>("");
  const [invoiceDate, setInvoiceDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [lines, setLines] = React.useState<ItemLineInput[]>([
    { name: "", quantity: 1, price_unit: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Auto-select first Odoo contact
  React.useEffect(() => {
    if (contacts.length > 0 && !partnerId) {
      const odoo = contacts.find((c) => c.source === "odoo");
      setPartnerId(String((odoo ?? contacts[0]).id));
    }
  }, [contacts, partnerId]);

  const grandTotal = lines.reduce(
    (sum, l) => sum + l.quantity * l.price_unit,
    0
  );

  const handleAddLine = () =>
    setLines((prev) => [...prev, { name: "", quantity: 1, price_unit: 0 }]);

  const handleRemoveLine = (idx: number) => {
    if (lines.length === 1) {
      toast.warning("Invoice must have at least one line item.");
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleLineChange = (
    idx: number,
    field: keyof ItemLineInput,
    value: string | number
  ) => {
    setLines((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId) {
      toast.warning("Please select a customer.");
      return;
    }
    if (lines.some((l) => !l.name.trim() || l.price_unit <= 0)) {
      toast.warning("Please fill in all item descriptions and prices.");
      return;
    }

    setIsSubmitting(true);
    try {
      const contact = contacts.find((c) => String(c.id) === partnerId);
      if (!contact) {
        toast.error("Contact not found.");
        return;
      }
      await createInvoice({ partner_id: contact.id, invoice_date: invoiceDate, lines });
      setLines([{ name: "", quantity: 1, price_unit: 0 }]);
      onClose();
    } catch {
      // toast handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <div>
            <DialogTitle>
              <Receipt size={16} className="text-emerald-500" />
              Generate Draft Invoice
            </DialogTitle>
            <DialogDescription>
              Create a new draft invoice in Odoo ERP
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button type="button" variant="ghost" size="icon" aria-label="Close">
              ✕
            </Button>
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <DialogBody className="space-y-6">
            {/* Customer & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="customer-select">Customer (From Odoo CRM)</Label>
                <Select value={partnerId} onValueChange={setPartnerId}>
                  <SelectTrigger id="customer-select" className="h-9 text-sm">
                    <SelectValue placeholder="Select a customer…" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}{" "}
                        <span className="text-slate-400 font-normal">
                          ({c.source === "odoo" ? "Odoo ERP" : "Manual"})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invoice-date">Invoice Date</Label>
                <DatePicker
                  id="invoice-date"
                  value={invoiceDate}
                  onChange={setInvoiceDate}
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Invoice Line Items
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddLine}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 gap-1"
                >
                  <Plus size={13} />
                  Add Row
                </Button>
              </div>

              {/* Column headers */}
              <div className="hidden sm:grid grid-cols-[1fr_80px_110px_36px] gap-3 px-1">
                <Label className="uppercase tracking-wide text-[10px]">Item Description / Label</Label>
                <Label className="uppercase tracking-wide text-[10px] text-center">QTY</Label>
                <Label className="uppercase tracking-wide text-[10px]">Unit Price (₹)</Label>
                <span />
              </div>

              <div className="space-y-2">
                {lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "grid grid-cols-1 sm:grid-cols-[1fr_80px_110px_36px] gap-3 items-center",
                      "p-3 rounded-lg border border-slate-100 bg-slate-50/50",
                      "dark:border-slate-800 dark:bg-slate-950/20"
                    )}
                  >
                    <Input
                      required
                      placeholder="e.g. Monthly Retainer Services"
                      value={line.name}
                      onChange={(e) => handleLineChange(idx, "name", e.target.value)}
                    />
                    <Input
                      type="number"
                      required
                      min={1}
                      value={line.quantity}
                      onChange={(e) => handleLineChange(idx, "quantity", Number(e.target.value))}
                      className="text-center"
                    />
                    <Input
                      type="number"
                      required
                      min={0.01}
                      step="0.01"
                      placeholder="0.00"
                      value={line.price_unit || ""}
                      onChange={(e) => handleLineChange(idx, "price_unit", Number(e.target.value))}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveLine(idx)}
                      className="border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-900 dark:hover:bg-rose-950/30 shrink-0"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-end p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="text-right space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Estimated Grand Total
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white font-display">
                  ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Generating…" : "Generate Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
