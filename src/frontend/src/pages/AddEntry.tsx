import {
  EMPTY_FORM,
  EntryForm,
  type EntryFormData,
} from "@/components/EntryForm";
import { useAddEntry } from "@/hooks/useQueries";
import { CheckCircle2, PlusCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function AddEntry() {
  const addMutation = useAddEntry();
  const [successKey, setSuccessKey] = useState(0);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(data: EntryFormData) {
    try {
      await addMutation.mutateAsync({
        receivedDate: data.receivedDate,
        leadSource: data.leadSource,
        accountName: data.accountName,
        potential: data.potential,
        notes: data.notes,
        statusGroup: data.statusGroup,
        status: data.status,
        salesPerson: data.salesPerson,
        zcrmLink: data.zcrmLink,
        tcv: Number(data.tcv),
        closingDate: data.closingDate,
      });
      toast.success("Entry added to pipeline");
      setSuccessKey((k) => k + 1);
      setFormKey((k) => k + 1);
    } catch {
      toast.error("Failed to add entry. Please try again.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0 mt-0.5">
          <PlusCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground leading-none">
            New Sales Entry
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add a new lead to the weekly sales pipeline
          </p>
        </div>
      </div>

      {/* Success flash */}
      <AnimatePresence mode="wait">
        {successKey > 0 && (
          <motion.div
            key={successKey}
            initial={{ opacity: 0, scale: 0.97, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 flex items-center gap-2.5 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Entry successfully added to the pipeline.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <EntryForm
          key={formKey}
          initialData={undefined}
          onSubmit={handleSubmit}
          submitLabel="Add Entry"
          isPending={addMutation.isPending}
        />
      </div>

      {/* Required fields note */}
      <p className="text-xs text-muted-foreground text-center">
        Fields marked with{" "}
        <span className="text-destructive font-semibold">*</span> are required.
        Notes and ZCRM Link are optional.
      </p>
    </motion.div>
  );
}
