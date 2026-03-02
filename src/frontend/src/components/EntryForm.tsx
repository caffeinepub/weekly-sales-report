import type { SalesEntry } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export const STATUS_MAP: Record<string, string[]> = {
  New: ["Unassigned", "Assigned", "Attempted Contact"],
  "In Progress": [
    "Contacted",
    "Qualified",
    "Demo Scheduled",
    "Demo Completed",
    "Proposal Sent",
    "Proposal Reviewed",
    "Negotiation",
    "Feasibility Check",
    "Samples Shared",
    "Awaiting Customer Feedback",
  ],
  Closed: [
    "Closed Won",
    "Closed Lost",
    "Closed – No Decision",
    "Nurture / Revisit",
    "Awaiting Customer Response",
  ],
};

export const STATUS_GROUPS = Object.keys(STATUS_MAP);

export const LEAD_SOURCES = [
  "Sales Lead",
  "Marketing Lead",
  "Account Mining",
  "Referral",
];

export interface EntryFormData {
  receivedDate: string;
  leadSource: string;
  accountName: string;
  potential: string;
  notes: string;
  statusGroup: string;
  status: string;
  salesPerson: string;
  zcrmLink: string;
  tcv: string;
  closingDate: string;
}

export const EMPTY_FORM: EntryFormData = {
  receivedDate: "",
  leadSource: "",
  accountName: "",
  potential: "",
  notes: "",
  statusGroup: "",
  status: "",
  salesPerson: "",
  zcrmLink: "",
  tcv: "",
  closingDate: "",
};

function entryToForm(entry: SalesEntry): EntryFormData {
  return {
    receivedDate: entry.receivedDate,
    leadSource: entry.leadSource,
    accountName: entry.accountName,
    potential: entry.potential,
    notes: entry.notes,
    statusGroup: entry.statusGroup,
    status: entry.status,
    salesPerson: entry.salesPerson,
    zcrmLink: entry.zcrmLink,
    tcv: String(entry.tcv),
    closingDate: entry.closingDate,
  };
}

const STATUS_GROUP_STYLES: Record<string, string> = {
  New: "status-new ring-[oklch(0.52_0.16_250_/_0.4)]",
  "In Progress": "status-inprogress ring-[oklch(0.64_0.16_68_/_0.4)]",
  Closed: "status-closed-won ring-[oklch(0.52_0.14_155_/_0.4)]",
};

interface EntryFormProps {
  initialData?: SalesEntry;
  onSubmit: (data: EntryFormData) => Promise<void>;
  submitLabel?: string;
  isPending?: boolean;
}

export function EntryForm({
  initialData,
  onSubmit,
  submitLabel = "Add Entry",
  isPending = false,
}: EntryFormProps) {
  const [form, setForm] = useState<EntryFormData>(
    initialData ? entryToForm(initialData) : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof EntryFormData, string>>
  >({});

  function update(field: keyof EntryFormData, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // When status group changes, reset sub-status if current is not valid
      if (field === "statusGroup") {
        const validSubStatuses = STATUS_MAP[value] ?? [];
        if (!validSubStatuses.includes(prev.status)) {
          next.status = "";
        }
      }
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field === "statusGroup" && errors.status) {
      setErrors((prev) => ({ ...prev, status: undefined }));
    }
  }

  function validate(): boolean {
    const required: (keyof EntryFormData)[] = [
      "receivedDate",
      "leadSource",
      "accountName",
      "potential",
      "statusGroup",
      "status",
      "salesPerson",
      "tcv",
      "closingDate",
    ];
    const newErrors: Partial<Record<keyof EntryFormData, string>> = {};
    for (const field of required) {
      if (!form[field].trim()) {
        newErrors[field] = "This field is required";
      }
    }
    if (form.tcv && Number.isNaN(Number(form.tcv))) {
      newErrors.tcv = "Must be a valid number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  }

  const availableSubStatuses = form.statusGroup
    ? (STATUS_MAP[form.statusGroup] ?? [])
    : [];

  const fieldLabel =
    "text-foreground/80 text-xs font-semibold uppercase tracking-wider";
  const reqMark = <span className="text-destructive ml-0.5">*</span>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Received Date */}
        <div className="space-y-1.5">
          <Label htmlFor="receivedDate" className={fieldLabel}>
            Received Date {reqMark}
          </Label>
          <Input
            id="receivedDate"
            type="date"
            value={form.receivedDate}
            onChange={(e) => update("receivedDate", e.target.value)}
            className="bg-input border-border text-foreground"
            aria-invalid={!!errors.receivedDate}
          />
          {errors.receivedDate && (
            <p className="text-xs text-destructive">{errors.receivedDate}</p>
          )}
        </div>

        {/* 2. Lead Source */}
        <div className="space-y-1.5">
          <Label htmlFor="leadSource-trigger" className={fieldLabel}>
            Lead Source {reqMark}
          </Label>
          <Select
            value={form.leadSource}
            onValueChange={(v) => update("leadSource", v)}
          >
            <SelectTrigger
              id="leadSource-trigger"
              className="bg-input border-border text-foreground"
              aria-invalid={!!errors.leadSource}
            >
              <SelectValue placeholder="Select lead source…" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {LEAD_SOURCES.map((ls) => (
                <SelectItem key={ls} value={ls}>
                  {ls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.leadSource && (
            <p className="text-xs text-destructive">{errors.leadSource}</p>
          )}
        </div>

        {/* 3. Account Name */}
        <div className="space-y-1.5">
          <Label htmlFor="accountName" className={fieldLabel}>
            Account Name {reqMark}
          </Label>
          <Input
            id="accountName"
            type="text"
            placeholder="Company name"
            value={form.accountName}
            onChange={(e) => update("accountName", e.target.value)}
            className="bg-input border-border text-foreground"
            aria-invalid={!!errors.accountName}
          />
          {errors.accountName && (
            <p className="text-xs text-destructive">{errors.accountName}</p>
          )}
        </div>

        {/* 4. Potential */}
        <div className="space-y-1.5">
          <Label htmlFor="potential" className={fieldLabel}>
            Potential {reqMark}
          </Label>
          <Input
            id="potential"
            type="text"
            placeholder="Opportunity name"
            value={form.potential}
            onChange={(e) => update("potential", e.target.value)}
            className="bg-input border-border text-foreground"
            aria-invalid={!!errors.potential}
          />
          {errors.potential && (
            <p className="text-xs text-destructive">{errors.potential}</p>
          )}
        </div>

        {/* 6. Status Group */}
        <div className="space-y-1.5">
          <Label className={fieldLabel}>Status Group {reqMark}</Label>
          <div className="flex gap-2">
            {STATUS_GROUPS.map((sg) => {
              const isActive = form.statusGroup === sg;
              const activeStyle = isActive ? STATUS_GROUP_STYLES[sg] : "";
              return (
                <button
                  key={sg}
                  type="button"
                  onClick={() => update("statusGroup", sg)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? `${activeStyle} ring-2 ring-offset-1 ring-offset-card`
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {sg}
                </button>
              );
            })}
          </div>
          {errors.statusGroup && (
            <p className="text-xs text-destructive">{errors.statusGroup}</p>
          )}
        </div>

        {/* 7. Sub-Status */}
        <div className="space-y-1.5">
          <Label htmlFor="status-trigger" className={fieldLabel}>
            Sub-Status {reqMark}
          </Label>
          <Select
            value={form.status}
            onValueChange={(v) => update("status", v)}
            disabled={availableSubStatuses.length === 0}
          >
            <SelectTrigger
              id="status-trigger"
              className="bg-input border-border text-foreground disabled:opacity-50"
              aria-invalid={!!errors.status}
            >
              <SelectValue
                placeholder={
                  form.statusGroup
                    ? "Select sub-status…"
                    : "Select status group first"
                }
              />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {availableSubStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-xs text-destructive">{errors.status}</p>
          )}
        </div>

        {/* 8. Sales Person */}
        <div className="space-y-1.5">
          <Label htmlFor="salesPerson" className={fieldLabel}>
            Sales Person {reqMark}
          </Label>
          <Input
            id="salesPerson"
            type="text"
            placeholder="Full name"
            value={form.salesPerson}
            onChange={(e) => update("salesPerson", e.target.value)}
            className="bg-input border-border text-foreground"
            aria-invalid={!!errors.salesPerson}
          />
          {errors.salesPerson && (
            <p className="text-xs text-destructive">{errors.salesPerson}</p>
          )}
        </div>

        {/* 10. TCV */}
        <div className="space-y-1.5">
          <Label htmlFor="tcv" className={fieldLabel}>
            Total Contract Value ($) {reqMark}
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold select-none">
              $
            </span>
            <Input
              id="tcv"
              type="number"
              min="0"
              step="1000"
              placeholder="0"
              value={form.tcv}
              onChange={(e) => update("tcv", e.target.value)}
              className="bg-input border-border text-foreground pl-7"
              aria-invalid={!!errors.tcv}
            />
          </div>
          {errors.tcv && (
            <p className="text-xs text-destructive">{errors.tcv}</p>
          )}
        </div>

        {/* 11. Closing Date */}
        <div className="space-y-1.5">
          <Label htmlFor="closingDate" className={fieldLabel}>
            Closing Date {reqMark}
          </Label>
          <Input
            id="closingDate"
            type="date"
            value={form.closingDate}
            onChange={(e) => update("closingDate", e.target.value)}
            className="bg-input border-border text-foreground"
            aria-invalid={!!errors.closingDate}
          />
          {errors.closingDate && (
            <p className="text-xs text-destructive">{errors.closingDate}</p>
          )}
        </div>
      </div>

      {/* 5. Notes (full width) */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className={fieldLabel}>
          Notes{" "}
          <span className="text-muted-foreground font-normal normal-case">
            (optional)
          </span>
        </Label>
        <Textarea
          id="notes"
          placeholder="Additional context, next steps, key contacts…"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          className="bg-input border-border text-foreground min-h-[90px] resize-none"
        />
      </div>

      {/* 9. ZCRM Link (full width) */}
      <div className="space-y-1.5">
        <Label htmlFor="zcrmLink" className={fieldLabel}>
          ZCRM Link{" "}
          <span className="text-muted-foreground font-normal normal-case">
            (optional)
          </span>
        </Label>
        <Input
          id="zcrmLink"
          type="url"
          placeholder="https://crm.zoho.com/…"
          value={form.zcrmLink}
          onChange={(e) => update("zcrmLink", e.target.value)}
          className="bg-input border-border text-foreground"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
