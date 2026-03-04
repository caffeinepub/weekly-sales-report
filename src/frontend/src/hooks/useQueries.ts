import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DashboardStats, SalesEntry } from "../backend.d";
import { useActor } from "./useActor";

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 8000,
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });
}

export function useEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<SalesEntry[]>({
    queryKey: ["entries"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getEntries();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 8000,
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });
}

export interface AddEntryData {
  receivedDate: string;
  leadSource: string;
  accountName: string;
  potential: string;
  notes: string;
  statusGroup: string;
  status: string;
  salesPerson: string;
  zcrmLink: string;
  tcv: number;
  closingDate: string;
}

export function useAddEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddEntryData) => {
      if (!actor) throw new Error("No actor");
      return actor.addEntry(
        data.receivedDate,
        data.leadSource,
        data.accountName,
        data.potential,
        data.notes,
        data.statusGroup,
        data.status,
        data.salesPerson,
        data.zcrmLink,
        data.tcv,
        data.closingDate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export interface UpdateEntryData extends AddEntryData {
  id: bigint;
}

export function useUpdateEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateEntryData) => {
      if (!actor) throw new Error("No actor");
      return actor.updateEntry(
        data.id,
        data.receivedDate,
        data.leadSource,
        data.accountName,
        data.potential,
        data.notes,
        data.statusGroup,
        data.status,
        data.salesPerson,
        data.zcrmLink,
        data.tcv,
        data.closingDate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}
