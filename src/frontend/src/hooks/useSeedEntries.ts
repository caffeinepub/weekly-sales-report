import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { seedEntries } from "../utils/seedData";
import { useActor } from "./useActor";

// Bump this version key when the seed data changes to force a re-seed.
const SEED_KEY = "salespulse_seeded_v3";

/**
 * Seeds the backend with real entries exactly once per version key.
 * On version bump, clears all existing entries and re-seeds with the new data.
 */
export function useSeedEntries() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const seedingRef = useRef(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    if (seedingRef.current) return;

    // Already seeded with this version on this device
    if (localStorage.getItem(SEED_KEY)) return;

    seedingRef.current = true;

    (async () => {
      try {
        // Clear all existing entries first, then seed fresh
        const existing = await actor.getEntries();
        for (const entry of existing) {
          await actor.deleteEntry(entry.id);
        }

        // Add all seed entries sequentially
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

        localStorage.setItem(SEED_KEY, "1");
        queryClient.invalidateQueries({ queryKey: ["entries"] });
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      } catch {
        seedingRef.current = false; // allow retry on next render
      }
    })();
  }, [actor, isFetching, queryClient]);
}
