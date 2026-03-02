import type { DashboardStats, SalesEntry } from "../backend.d";

// Base timestamp: 2026-02-28T00:00:00Z in nanoseconds
const BASE_NS = BigInt("1772150400000000000");
const DAY_NS = BigInt(86_400_000_000_000);

export const mockEntries: SalesEntry[] = [
  {
    id: 1n,
    receivedDate: "2026-02-05",
    leadSource: "Sales Lead",
    accountName: "Apex Dynamics",
    potential: "Enterprise Platform License Q1",
    notes: "Strong interest from CTO. Follow-up call scheduled for next week.",
    statusGroup: "In Progress",
    status: "Proposal Sent",
    salesPerson: "Jordan Mitchell",
    zcrmLink: "https://crm.zoho.com/crm/org123/tab/Potentials/100001",
    tcv: 185000,
    closingDate: "2026-03-15",
    createdAt: BASE_NS - DAY_NS * 23n,
  },
  {
    id: 2n,
    receivedDate: "2026-02-08",
    leadSource: "Referral",
    accountName: "BlueStar Solutions",
    potential: "Cloud Migration & Managed Services 2026",
    notes:
      "Referred by Apex Dynamics. Budget approved internally. PO expected soon.",
    statusGroup: "In Progress",
    status: "Negotiation",
    salesPerson: "Priya Sharma",
    zcrmLink: "https://crm.zoho.com/crm/org123/tab/Potentials/100002",
    tcv: 248000,
    closingDate: "2026-03-20",
    createdAt: BASE_NS - DAY_NS * 20n,
  },
  {
    id: 3n,
    receivedDate: "2026-02-10",
    leadSource: "Marketing Lead",
    accountName: "Vertex Systems",
    potential: "SaaS Platform Rollout — 500 seats",
    notes:
      "Initial demo well received. Awaiting internal sign-off from finance.",
    statusGroup: "In Progress",
    status: "Demo Completed",
    salesPerson: "Chris Lawson",
    zcrmLink: "",
    tcv: 92000,
    closingDate: "2026-04-10",
    createdAt: BASE_NS - DAY_NS * 18n,
  },
  {
    id: 4n,
    receivedDate: "2026-02-12",
    leadSource: "Marketing Lead",
    accountName: "Pinnacle Corp",
    potential: "Data Analytics Suite — Enterprise",
    notes:
      "Inbound lead from webinar. Procurement team engaged but process slow.",
    statusGroup: "New",
    status: "Assigned",
    salesPerson: "Jordan Mitchell",
    zcrmLink: "https://crm.zoho.com/crm/org123/tab/Potentials/100004",
    tcv: 67500,
    closingDate: "2026-04-30",
    createdAt: BASE_NS - DAY_NS * 16n,
  },
  {
    id: 5n,
    receivedDate: "2026-02-14",
    leadSource: "Account Mining",
    accountName: "Helix Financial",
    potential: "Security Compliance & Audit Package",
    notes:
      "Expanded from existing account. Legal review stalling final approval.",
    statusGroup: "In Progress",
    status: "Proposal Reviewed",
    salesPerson: "Samantha Reid",
    zcrmLink: "",
    tcv: 45000,
    closingDate: "2026-03-28",
    createdAt: BASE_NS - DAY_NS * 14n,
  },
  {
    id: 6n,
    receivedDate: "2026-02-17",
    leadSource: "Sales Lead",
    accountName: "Orion Industries",
    potential: "Infrastructure Modernisation Phase 1",
    notes:
      "Original champion left the company. Re-engaging with new IT Director.",
    statusGroup: "New",
    status: "Attempted Contact",
    salesPerson: "Marcus Chen",
    zcrmLink: "",
    tcv: 130000,
    closingDate: "2026-05-15",
    createdAt: BASE_NS - DAY_NS * 11n,
  },
  {
    id: 7n,
    receivedDate: "2026-02-20",
    leadSource: "Referral",
    accountName: "Cascade Finance Group",
    potential: "Regulatory Reporting Automation Tool",
    notes:
      "Verbal agreement in place. Contract under legal review, close imminent.",
    statusGroup: "Closed",
    status: "Closed Won",
    salesPerson: "Priya Sharma",
    zcrmLink: "https://crm.zoho.com/crm/org123/tab/Potentials/100007",
    tcv: 210000,
    closingDate: "2026-03-07",
    createdAt: BASE_NS - DAY_NS * 8n,
  },
  {
    id: 8n,
    receivedDate: "2026-02-22",
    leadSource: "Account Mining",
    accountName: "Summit Technologies",
    potential: "DevOps Automation Bundle — 3yr",
    notes:
      "Proof of concept requested. Technical evaluation in progress with their team.",
    statusGroup: "In Progress",
    status: "Qualified",
    salesPerson: "Chris Lawson",
    zcrmLink: "",
    tcv: 58000,
    closingDate: "2026-04-05",
    createdAt: BASE_NS - DAY_NS * 6n,
  },
  {
    id: 9n,
    receivedDate: "2026-02-24",
    leadSource: "Sales Lead",
    accountName: "NovaTech Manufacturing",
    potential: "ERP Integration Services",
    notes:
      "Competitive evaluation. We are shortlisted alongside two other vendors.",
    statusGroup: "In Progress",
    status: "Demo Scheduled",
    salesPerson: "Samantha Reid",
    zcrmLink: "https://crm.zoho.com/crm/org123/tab/Potentials/100009",
    tcv: 320000,
    closingDate: "2026-05-01",
    createdAt: BASE_NS - DAY_NS * 4n,
  },
  {
    id: 10n,
    receivedDate: "2026-02-26",
    leadSource: "Marketing Lead",
    accountName: "Quantum Retail Group",
    potential: "Omnichannel Commerce Platform",
    notes: "Post-demo follow-up done. Budget constraints may push to Q3.",
    statusGroup: "Closed",
    status: "Nurture / Revisit",
    salesPerson: "Marcus Chen",
    zcrmLink: "",
    tcv: 95000,
    closingDate: "2026-09-30",
    createdAt: BASE_NS - DAY_NS * 2n,
  },
];

export function computeMockDashboardStats(): DashboardStats {
  const today = new Date("2026-02-28");
  const thirtyDaysOut = new Date(today);
  thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);

  let totalTCV = 0;
  let newCount = 0n;
  let inProgressCount = 0n;
  let closedCount = 0n;
  let newTCV = 0;
  let inProgressTCV = 0;
  let closedTCV = 0;

  let salesLeadCount = 0n;
  let marketingLeadCount = 0n;
  let accountMiningCount = 0n;
  let referralCount = 0n;
  let salesLeadTCV = 0;
  let marketingLeadTCV = 0;
  let accountMiningTCV = 0;
  let referralTCV = 0;

  for (const e of mockEntries) {
    totalTCV += e.tcv;
    const sg = e.statusGroup;
    if (sg === "New") {
      newCount++;
      newTCV += e.tcv;
    } else if (sg === "In Progress") {
      inProgressCount++;
      inProgressTCV += e.tcv;
    } else {
      closedCount++;
      closedTCV += e.tcv;
    }

    const ls = e.leadSource;
    if (ls === "Sales Lead") {
      salesLeadCount++;
      salesLeadTCV += e.tcv;
    } else if (ls === "Marketing Lead") {
      marketingLeadCount++;
      marketingLeadTCV += e.tcv;
    } else if (ls === "Account Mining") {
      accountMiningCount++;
      accountMiningTCV += e.tcv;
    } else {
      referralCount++;
      referralTCV += e.tcv;
    }
  }

  const recentEntries = [...mockEntries]
    .sort((a, b) => Number(b.createdAt - a.createdAt))
    .slice(0, 5);

  const upcomingClosings = mockEntries.filter((e) => {
    const closeMs = new Date(`${e.closingDate}T00:00:00`).getTime();
    return closeMs >= today.getTime() && closeMs <= thirtyDaysOut.getTime();
  });

  return {
    totalEntries: BigInt(mockEntries.length),
    totalTCV,
    countByStatusGroup: {
      new: newCount,
      inProgress: inProgressCount,
      closed: closedCount,
    },
    tcvByStatusGroup: {
      new: newTCV,
      inProgress: inProgressTCV,
      closed: closedTCV,
    },
    countByLeadSource: {
      salesLead: salesLeadCount,
      marketingLead: marketingLeadCount,
      accountMining: accountMiningCount,
      referral: referralCount,
    },
    tcvByLeadSource: {
      salesLead: salesLeadTCV,
      marketingLead: marketingLeadTCV,
      accountMining: accountMiningTCV,
      referral: referralTCV,
    },
    recentEntries,
    upcomingClosings,
  };
}
