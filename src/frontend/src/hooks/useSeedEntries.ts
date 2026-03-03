import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { seedEntries } from "../utils/seedData";
import { useActor } from "./useActor";

/**
 * Seeds the backend with real entries if the backend is currently empty.
 *
 * Strategy: always query the backend entry count first.
 * If the backend has 0 entries, seed it. This handles the case where:
 *   - A new deployment wiped the backend
 *   - The draft expired and was redeployed
 *   - localStorage was stale from a previous session
 *
 * localStorage is used only to prevent duplicate seeding within the same
 * backend session (keyed by the current backend entry count fingerprint).
 */
export function useSeedEntries() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const seedingRef = useRef(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    if (seedingRef.current) return;

    seedingRef.current = true;

    (async () => {
      try {
        // Always check the actual backend state first
        const existing = await actor.getEntries();

        // Only seed if the backend is empty
        if (existing.length > 0) {
          seedingRef.current = false;
          return;
        }

        // Backend is empty -- seed all entries
        for (const entry of seedEntries) {
          await actor.addEntry(
            entry.receivedDate,
            entry.leadSource,
            entry.accountName,
            entry.potential,
            entry.notes,
            entry.statusGroup,
            entry.status,
            entry.salesPerson,
            entry.zcrmLink,
            entry.tcv,
            entry.closingDate,
          );
        }

        queryClient.invalidateQueries({ queryKey: ["entries"] });
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      } catch {
        seedingRef.current = false; // allow retry on next render
      }
    })();
  }, [actor, isFetching, queryClient]);
}
