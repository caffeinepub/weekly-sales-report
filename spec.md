# Weekly Sales Report

## Current State
Full sales pipeline app with login, RBAC, dashboard, entries table, add/edit/delete, CSV export, and seed data. The backend computes `upcomingClosings` in `getDashboardStats`. The `addDaysToDate` function in the backend is broken -- it ignores its `date` argument and recalculates from the epoch, returning a wrong cutoff date, so the 30-day upcoming closings window never works correctly. Additionally, the save/update of entries works at the frontend/hook level but the broken date logic means edits to status (e.g. Cipla changed to Closed / Awaiting Customer Response) don't show up in Upcoming Closings even when the save succeeds.

## Requested Changes (Diff)

### Add
- Nothing new to add.

### Modify
- Fix `addDaysToDate` in the backend so it correctly adds N days to a given YYYY-MM-DD date string and returns a valid YYYY-MM-DD string. The function must parse the input date, convert to a day count, add the days, then convert back -- not recalculate from 1970.

### Remove
- Nothing to remove.

## Implementation Plan
1. Regenerate backend Motoko with a correct `addDaysToDate` implementation that parses the input date string, converts to a total day count, adds N days, and formats the result back as YYYY-MM-DD.
2. Keep all other backend logic (addEntry, updateEntry, deleteEntry, getDashboardStats, RBAC) identical.
3. No frontend changes needed -- the fix is purely in the backend date arithmetic.
