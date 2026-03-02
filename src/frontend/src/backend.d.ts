import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SalesEntry {
    id: bigint;
    tcv: number;
    status: string;
    statusGroup: string;
    createdAt: bigint;
    salesPerson: string;
    receivedDate: string;
    accountName: string;
    notes: string;
    closingDate: string;
    leadSource: string;
    zcrmLink: string;
    potential: string;
}
export interface StatusGroupTCV {
    new: number;
    closed: number;
    inProgress: number;
}
export interface LeadSourceTCV {
    marketingLead: number;
    referral: number;
    accountMining: number;
    salesLead: number;
}
export interface StatusGroupCounts {
    new: bigint;
    closed: bigint;
    inProgress: bigint;
}
export interface DashboardStats {
    totalEntries: bigint;
    countByStatusGroup: StatusGroupCounts;
    tcvByLeadSource: LeadSourceTCV;
    totalTCV: number;
    upcomingClosings: Array<SalesEntry>;
    recentEntries: Array<SalesEntry>;
    tcvByStatusGroup: StatusGroupTCV;
    countByLeadSource: LeadSourceCounts;
}
export interface UserProfile {
    name: string;
    email: string;
    department: string;
}
export interface LeadSourceCounts {
    marketingLead: bigint;
    referral: bigint;
    accountMining: bigint;
    salesLead: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEntry(receivedDate: string, leadSource: string, accountName: string, potential: string, notes: string, statusGroup: string, status: string, salesPerson: string, zcrmLink: string, tcv: number, closingDate: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteEntry(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getEntries(): Promise<Array<SalesEntry>>;
    getEntriesByLeadSource(leadSource: string): Promise<Array<SalesEntry>>;
    getEntriesByStatusGroup(statusGroup: string): Promise<Array<SalesEntry>>;
    getEntry(id: bigint): Promise<SalesEntry>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    updateEntry(id: bigint, receivedDate: string, leadSource: string, accountName: string, potential: string, notes: string, statusGroup: string, status: string, salesPerson: string, zcrmLink: string, tcv: number, closingDate: string): Promise<void>;
}
