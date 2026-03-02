import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DashboardStats, SalesEntry } from "../backend.d";
import { computeMockDashboardStats, mockEntries } from "../utils/mockData";
import { useActor } from "./useActor";

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      const result = await actor.getDashboardStats();
      if (result.totalEntries === 0n) {
        return computeMockDashboardStats();
      }
      return result;
    },
    enabled: !!actor && !isFetching,
    placeholderData: computeMockDashboardStats(),
    refetchInterval: 8000,
  });
}

export function useEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<SalesEntry[]>({
    queryKey: ["entries"],
    queryFn: async () => {
      if (!actor) return mockEntries;
      const result = await actor.getEntries();
      if (result.length === 0) {
        return mockEntries;
      }
      return result;
    },
    enabled: !!actor && !isFetching,
    placeholderData: mockEntries,
    refetchInterval: 8000,
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
