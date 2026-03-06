# Weekly Sales Report

## Current State

The app has four screens: Dashboard, All Entries, Add Entry, and Settings (removed). Navigation is in App.tsx with a Tab type covering "dashboard" | "entries" | "add". Each SalesEntry has one `notes` field and one `createdAt` timestamp. The backend provides `getEntries()` returning all SalesEntry records. Entries.tsx has CSV export logic. There is no Notes History screen.

## Requested Changes (Diff)

### Add
- A new "Notes History" screen placed next to "Add Entry" in the nav
- The screen displays one row per entry that has a non-empty notes field, sorted chronologically (oldest first) by receivedDate, then by createdAt
- Each row shows: Received (no wrap), Lead Source (no wrap), Account (no wrap), Potential (text wrap), Notes (text wrap), Notes Date (no wrap -- uses createdAt formatted as date), Status (no wrap), Sales Person, TCV, Closing (no wrap)
- "Export to Excel" button that downloads all rows as an .xlsx file (using SheetJS/xlsx library or a CSV with .xlsx-compatible tab-separated values -- use xlsx npm package if available, otherwise CSV)
- The screen title is "Notes History"

### Modify
- App.tsx: add "notes" tab to the Tab type, navItems array, pageTitles, and renderContent()

### Remove
- Nothing removed

## Implementation Plan

1. Write spec.md (this file)
2. Create `src/pages/NotesHistory.tsx`:
   - Import useEntries hook
   - Filter entries to those with non-empty notes
   - Sort by receivedDate ascending, then createdAt ascending
   - Render table with 10 columns as specified
   - Each row is sequentially numbered (Line 1, Line 2, ...)
   - Export to Excel button: use SheetJS xlsx library (check if available; if not, generate CSV with .xlsx extension workaround using a proper mime type, or install xlsx)
   - Loading and error states
3. Update App.tsx:
   - Add "notes" to Tab type
   - Add FileText icon from lucide-react for the nav item
   - Add nav item { id: "notes", label: "Notes History", shortLabel: "Notes", icon: FileText }
   - Add to pageTitles: notes: "Notes History"
   - Add to renderContent: if activeTab === "notes" return <NotesHistory />
