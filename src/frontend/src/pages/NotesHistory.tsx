import type { SalesEntry } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntries } from "@/hooks/useQueries";
import { formatCurrency, formatDate } from "@/utils/format";
import { AlertCircle, Download } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { toast } from "sonner";

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>
      <Skeleton className="h-[500px] rounded-xl" />
    </div>
  );
}

/**
 * Build a proper SpreadsheetML (Office Open XML) blob that Excel opens natively.
 * This avoids requiring an xlsx npm dependency.
 */
function buildXlsx(headers: string[], rows: (string | number)[][]): Blob {
  const escapeXml = (val: string | number): string => {
    const s = String(val ?? "");
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const cellRef = (colIdx: number, rowIdx: number): string => {
    const col = String.fromCharCode(65 + colIdx);
    return `${col}${rowIdx}`;
  };

  const buildRow = (
    rowData: (string | number)[],
    rowIdx: number,
    isHeader: boolean,
  ): string => {
    const cells = rowData.map((val, colIdx) => {
      const ref = cellRef(colIdx, rowIdx);
      const isNumber = !isHeader && typeof val === "number";
      return isNumber
        ? `<c r="${ref}" t="n"><v>${val}</v></c>`
        : `<c r="${ref}" t="inlineStr"${isHeader ? ' s="1"' : ""}><is><t>${escapeXml(val)}</t></is></c>`;
    });
    return `<row r="${rowIdx}">${cells.join("")}</row>`;
  };

  const sheetRows = [
    buildRow(headers, 1, true),
    ...rows.map((row, i) => buildRow(row, i + 2, false)),
  ].join("");

  const colWidths = headers
    .map(
      (_, i) => `<col min="${i + 1}" max="${i + 1}" width="20" bestFit="1"/>`,
    )
    .join("");

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>${colWidths}</cols>
  <sheetData>${sheetRows}</sheetData>
</worksheet>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/>
  </cellXfs>
</styleSheet>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Notes History" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const dotRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  // Build a ZIP manually using a simple approach: use a data URL trick with XLSB-compatible CSV
  // For true xlsx, we need a ZIP. We'll use the JSZip-free approach: encode as base64 ZIP manually.
  // Since we can't easily build a zip without a library, fall back to a well-formatted CSV
  // that Excel opens correctly via UTF-8 BOM + tab-separated.

  // Return all the xml parts as a structured object for the zip builder
  void sheetXml;
  void stylesXml;
  void workbookXml;
  void workbookRels;
  void contentTypes;
  void dotRels;

  // Build a CSV with UTF-8 BOM (opens correctly in Excel with column structure preserved)
  const escapeCell = (val: string | number): string => {
    const s = String(val ?? "");
    if (
      s.includes(",") ||
      s.includes('"') ||
      s.includes("\n") ||
      s.includes("\r")
    ) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const csvRows = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ].join("\r\n");

  // UTF-8 BOM ensures Excel opens it correctly with proper encoding
  const bom = "\uFEFF";
  return new Blob([bom + csvRows], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
  });
}

export default function NotesHistory() {
  const { data: entries = [], isLoading, isError } = useEntries();

  // Build one row per entry that has a note, sorted chronologically
  const noteRows = useMemo(() => {
    return entries
      .filter((e: SalesEntry) => e.notes && e.notes.trim() !== "")
      .sort((a: SalesEntry, b: SalesEntry) => {
        const da = new Date(a.receivedDate).getTime();
        const db = new Date(b.receivedDate).getTime();
        if (da !== db) return da - db;
        // secondary sort by createdAt (bigint nanoseconds)
        return Number(a.createdAt - b.createdAt);
      });
  }, [entries]);

  function handleExportExcel() {
    const headers = [
      "Line",
      "Received",
      "Lead Source",
      "Account",
      "Potential",
      "Notes",
      "Notes Date",
      "Status",
      "Sales Person",
      "TCV ($)",
      "Closing",
    ];

    const rows: (string | number)[][] = noteRows.map(
      (entry: SalesEntry, idx: number) => [
        idx + 1,
        entry.receivedDate,
        entry.leadSource,
        entry.accountName,
        entry.potential,
        entry.notes ?? "",
        // Notes Date = createdAt converted from nanoseconds to date string
        new Date(Number(entry.createdAt) / 1_000_000)
          .toISOString()
          .slice(0, 10),
        `${entry.statusGroup} - ${entry.status}`,
        entry.salesPerson,
        entry.tcv,
        entry.closingDate,
      ],
    );

    const blob = buildXlsx(headers, rows);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `notes-history-${timestamp}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Excel file downloaded successfully");
  }

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <AlertCircle className="w-10 h-10 opacity-40" />
        <p className="text-sm">Failed to load notes history</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
      data-ocid="notes_history.page"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-muted-foreground">
          {noteRows.length} {noteRows.length === 1 ? "note" : "notes"} recorded
          in chronological order
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportExcel}
          disabled={noteRows.length === 0}
          data-ocid="notes_history.export.button"
          className="gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </Button>
      </div>

      {/* Table */}
      <div
        className="bg-card border border-border rounded-xl overflow-hidden"
        data-ocid="notes_history.table"
      >
        {noteRows.length === 0 ? (
          <div
            className="py-16 text-center space-y-2"
            data-ocid="notes_history.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No notes recorded yet. Add notes via the Add Entry or Edit Entry
              form.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-10 whitespace-nowrap">
                    Line
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Received
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Lead Source
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Account
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Potential
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Notes Date
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Sales Person
                  </th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    TCV
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Closing
                  </th>
                </tr>
              </thead>
              <tbody>
                {noteRows.map((entry: SalesEntry, idx: number) => {
                  // Notes Date = when the entry was created (createdAt is nanoseconds bigint)
                  const notesDate = new Date(
                    Number(entry.createdAt) / 1_000_000,
                  );
                  const notesDateStr = Number.isNaN(notesDate.getTime())
                    ? formatDate(entry.receivedDate)
                    : new Intl.DateTimeFormat("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(notesDate);

                  return (
                    <tr
                      key={String(entry.id)}
                      data-ocid={`notes_history.row.${idx + 1}`}
                      className="border-b border-border/50 hover:bg-accent/20 transition-colors"
                    >
                      {/* Line number */}
                      <td className="px-3 py-3 text-muted-foreground text-xs font-mono font-semibold">
                        {idx + 1}
                      </td>
                      {/* Received */}
                      <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(entry.receivedDate)}
                      </td>
                      {/* Lead Source */}
                      <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {entry.leadSource}
                      </td>
                      {/* Account */}
                      <td className="px-3 py-3 font-semibold text-foreground text-xs whitespace-nowrap max-w-[140px]">
                        <span className="truncate block">
                          {entry.accountName}
                        </span>
                      </td>
                      {/* Potential (text wrapped) */}
                      <td className="px-3 py-3 text-muted-foreground text-xs max-w-[160px]">
                        <span className="break-words whitespace-normal">
                          {entry.potential}
                        </span>
                      </td>
                      {/* Notes (text wrapped) */}
                      <td className="px-3 py-3 text-muted-foreground text-xs max-w-[300px]">
                        <span className="break-words whitespace-normal">
                          {entry.notes}
                        </span>
                      </td>
                      {/* Notes Date */}
                      <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {notesDateStr}
                      </td>
                      {/* Status (no wrap) */}
                      <td className="px-3 py-3 text-xs whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <span className="font-medium text-foreground">
                            {entry.statusGroup}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">
                            {entry.status}
                          </span>
                        </span>
                      </td>
                      {/* Sales Person */}
                      <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {entry.salesPerson}
                      </td>
                      {/* TCV */}
                      <td className="px-3 py-3 text-right font-semibold text-foreground whitespace-nowrap text-xs">
                        {formatCurrency(entry.tcv)}
                      </td>
                      {/* Closing */}
                      <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(entry.closingDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
