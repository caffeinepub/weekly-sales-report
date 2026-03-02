import type { SalesEntry } from "@/backend.d";
import {
  EntryForm,
  type EntryFormData,
  LEAD_SOURCES,
  STATUS_GROUPS,
} from "@/components/EntryForm";
import { StatusBadge } from "@/components/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeleteEntry, useEntries, useUpdateEntry } from "@/hooks/useQueries";
import { formatCurrency, formatDate } from "@/utils/format";
import { mockEntries } from "@/utils/mockData";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  ExternalLink,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
      <Skeleton className="h-[500px] rounded-xl" />
    </div>
  );
}

interface EntriesProps {
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function Entries({
  canEdit = true,
  canDelete = true,
}: EntriesProps) {
  const { data: entries = [], isLoading, isError } = useEntries();
  const deleteMutation = useDeleteEntry();
  const updateMutation = useUpdateEntry();

  const [search, setSearch] = useState("");
  const [statusGroupFilter, setStatusGroupFilter] = useState("All");
  const [leadSourceFilter, setLeadSourceFilter] = useState("All");
  const [editEntry, setEditEntry] = useState<SalesEntry | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function toggleSort() {
    setSortDir((d) => (d === "desc" ? "asc" : "desc"));
  }

  const isMock =
    entries.length > 0 &&
    mockEntries.some((m) => String(m.id) === String(entries[0]?.id));

  const filtered = useMemo(() => {
    let result = entries;

    if (statusGroupFilter !== "All") {
      result = result.filter((e) => e.statusGroup === statusGroupFilter);
    }

    if (leadSourceFilter !== "All") {
      result = result.filter((e) => e.leadSource === leadSourceFilter);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.accountName.toLowerCase().includes(s) ||
          e.potential.toLowerCase().includes(s) ||
          e.salesPerson.toLowerCase().includes(s) ||
          e.leadSource.toLowerCase().includes(s),
      );
    }

    result = [...result].sort((a, b) => {
      const da = new Date(a.receivedDate).getTime();
      const db = new Date(b.receivedDate).getTime();
      return sortDir === "desc" ? db - da : da - db;
    });

    return result;
  }, [entries, statusGroupFilter, leadSourceFilter, search, sortDir]);

  function handleExportCSV() {
    const headers = [
      "Sl No.",
      "Received Date",
      "Lead Source",
      "Account Name",
      "Potential",
      "Notes",
      "Status Group",
      "Status",
      "Sales Person",
      "ZCRM Link",
      "TCV ($)",
      "Closing Date",
    ];

    const rows = filtered.map((entry, idx) => [
      idx + 1,
      entry.receivedDate,
      entry.leadSource,
      entry.accountName,
      entry.potential,
      entry.notes ?? "",
      entry.statusGroup,
      entry.status,
      entry.salesPerson,
      entry.zcrmLink ?? "",
      entry.tcv,
      entry.closingDate,
    ]);

    const escapeCell = (val: string | number) => {
      const s = String(val);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `sales-report-${timestamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded successfully");
  }

  async function handleUpdate(data: EntryFormData) {
    if (!editEntry) return;
    try {
      await updateMutation.mutateAsync({
        id: editEntry.id,
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
      toast.success("Entry updated successfully");
      setEditEntry(null);
    } catch {
      toast.error("Failed to update entry");
    }
  }

  async function handleDelete() {
    if (deleteId === null) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Entry deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete entry");
    }
  }

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <AlertCircle className="w-10 h-10 opacity-40" />
        <p className="text-sm">Failed to load entries</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by account, potential, sales person…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-input border-border"
            />
          </div>

          {/* Status Group filter */}
          <Select
            value={statusGroupFilter}
            onValueChange={setStatusGroupFilter}
          >
            <SelectTrigger className="w-[160px] bg-input border-border text-sm">
              <SelectValue placeholder="Status Group" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="All">All Statuses</SelectItem>
              {STATUS_GROUPS.map((sg) => (
                <SelectItem key={sg} value={sg}>
                  {sg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Lead Source filter */}
          <Select value={leadSourceFilter} onValueChange={setLeadSourceFilter}>
            <SelectTrigger className="w-[160px] bg-input border-border text-sm">
              <SelectValue placeholder="Lead Source" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="All">All Sources</SelectItem>
              {LEAD_SOURCES.map((ls) => (
                <SelectItem key={ls} value={ls}>
                  {ls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Results meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
              {entries.length !== filtered.length &&
                ` of ${entries.length} total`}
            </p>
            {isMock && (
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                Sample data
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-ring" />
            <span className="text-xs text-muted-foreground">Auto-refresh</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-muted-foreground text-sm">
                No entries match your filters
              </p>
              {(search ||
                statusGroupFilter !== "All" ||
                leadSourceFilter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusGroupFilter("All");
                    setLeadSourceFilter("All");
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-10">
                      #
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      <button
                        type="button"
                        onClick={toggleSort}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                        title={
                          sortDir === "desc"
                            ? "Newest first — click to sort oldest first"
                            : "Oldest first — click to sort newest first"
                        }
                      >
                        Received
                        {sortDir === "desc" ? (
                          <ArrowDown className="w-3 h-3" />
                        ) : sortDir === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </button>
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Lead Source
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Account
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Potential
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Sales Person
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      ZCRM
                    </th>
                    <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      TCV
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Closing
                    </th>
                    {(canEdit || canDelete) && (
                      <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry, idx) => (
                    <tr
                      key={String(entry.id)}
                      className="border-b border-border/50 hover:bg-accent/20 transition-colors"
                    >
                      {/* Sl No. */}
                      <td className="px-3 py-3 text-muted-foreground text-xs font-mono">
                        {idx + 1}
                      </td>
                      {/* Received Date */}
                      <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(entry.receivedDate)}
                      </td>
                      {/* Lead Source */}
                      <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {entry.leadSource}
                      </td>
                      {/* Account Name */}
                      <td className="px-3 py-3 font-semibold text-foreground max-w-[140px]">
                        <span className="truncate block">
                          {entry.accountName}
                        </span>
                      </td>
                      {/* Potential */}
                      <td className="px-3 py-3 text-muted-foreground text-xs max-w-[140px]">
                        <span className="truncate block">
                          {entry.potential}
                        </span>
                      </td>
                      {/* Notes (truncated with tooltip) */}
                      <td className="px-3 py-3 text-muted-foreground text-xs max-w-[160px]">
                        {entry.notes ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate block cursor-help max-w-[160px]">
                                {entry.notes.length > 40
                                  ? `${entry.notes.slice(0, 40)}…`
                                  : entry.notes}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-xs text-xs bg-popover text-popover-foreground border-border"
                            >
                              {entry.notes}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="opacity-40">—</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-3 py-3">
                        <StatusBadge
                          statusGroup={entry.statusGroup}
                          status={entry.status}
                          size="sm"
                        />
                      </td>
                      {/* Sales Person */}
                      <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {entry.salesPerson}
                      </td>
                      {/* ZCRM Link */}
                      <td className="px-3 py-3 text-center">
                        {entry.zcrmLink ? (
                          <a
                            href={entry.zcrmLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center text-primary hover:text-primary/80 transition-colors"
                            title="Open in ZCRM"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground opacity-30 text-xs">
                            —
                          </span>
                        )}
                      </td>
                      {/* TCV */}
                      <td className="px-3 py-3 text-right font-semibold text-foreground whitespace-nowrap text-xs">
                        {formatCurrency(entry.tcv)}
                      </td>
                      {/* Closing Date */}
                      <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(entry.closingDate)}
                      </td>
                      {/* Actions */}
                      {(canEdit || canDelete) && (
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {canEdit && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditEntry(entry)}
                                className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                                title="Edit entry"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteId(entry.id)}
                                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                                title="Delete entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit sheet */}
        <Sheet
          open={!!editEntry}
          onOpenChange={(open) => !open && setEditEntry(null)}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-xl bg-card border-border overflow-y-auto"
          >
            <SheetHeader className="mb-6">
              <SheetTitle className="font-display text-lg">
                Edit Entry
              </SheetTitle>
              <SheetDescription className="text-muted-foreground text-sm">
                Update the sales entry details below.
              </SheetDescription>
            </SheetHeader>
            {editEntry && (
              <EntryForm
                initialData={editEntry}
                onSubmit={handleUpdate}
                submitLabel="Save Changes"
                isPending={updateMutation.isPending}
              />
            )}
          </SheetContent>
        </Sheet>

        {/* Delete confirm dialog */}
        <AlertDialog
          open={deleteId !== null}
          onOpenChange={(open) => !open && setDeleteId(null)}
        >
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Entry</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This action cannot be undone. The entry will be permanently
                removed from the sales pipeline.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-secondary border-border hover:bg-accent">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </TooltipProvider>
  );
}
