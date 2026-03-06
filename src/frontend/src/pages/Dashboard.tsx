import { StatusGroupBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats, useEntries } from "@/hooks/useQueries";
import { formatCurrency, formatDate } from "@/utils/format";
import {
  Activity,
  AlertCircle,
  Briefcase,
  CalendarRange,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  TrendingUp,
  Users,
} from "lucide-react";
import { type Variants, motion } from "motion/react";
import { useState } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  colorClass,
  bgClass,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 card-hover cursor-default"
    >
      <div className={`p-2.5 rounded-lg ${bgClass} flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-2xl font-display font-bold text-foreground leading-none">
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {["s1", "s2", "s3", "s4", "s5"].map((k) => (
          <Skeleton key={k} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["r1", "r2", "r3"].map((k) => (
          <Skeleton key={k} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["l1", "l2", "l3", "l4"].map((k) => (
          <Skeleton key={k} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

export default function Dashboard() {
  const {
    data: stats,
    isLoading,
    isError,
    isFetching: isStatsFetching,
    refetch,
    failureCount,
  } = useDashboardStats();
  const { data: entries } = useEntries();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Show skeleton while loading or while retrying (up to 3 attempts give user skeleton feedback)
  if (isLoading || (isStatsFetching && !stats)) return <LoadingSkeleton />;

  // After retries exhausted and still no data, show actionable error
  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-muted-foreground opacity-40" />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground mb-1">
            Unable to load dashboard
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            {failureCount > 0
              ? `Tried ${failureCount} time${failureCount > 1 ? "s" : ""}. The data will reload automatically.`
              : "The data will reload automatically."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
            data-ocid="dashboard.retry_button"
          >
            Retry now
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-secondary text-secondary-foreground text-sm rounded-lg hover:bg-secondary/80 transition-colors"
            data-ocid="dashboard.reload_button"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }

  // Filter entries by date range (received date) for pipeline metrics
  const filteredEntries = (entries ?? []).filter((e) => {
    if (!fromDate && !toDate) return true;
    const received = e.receivedDate; // YYYY-MM-DD string
    if (fromDate && received < fromDate) return false;
    if (toDate && received > toDate) return false;
    return true;
  });

  const hasDateFilter = fromDate || toDate;

  // Compute upcoming closings entirely on the frontend to avoid backend date arithmetic bugs
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const upcomingClosings = (entries ?? [])
    .filter((e) => {
      if (!e.closingDate || e.tcv <= 0) return false;
      const closing = new Date(e.closingDate);
      const qualifyingStatuses = [
        "Negotiation",
        "Proposal Sent",
        "Proposal Reviewed",
        "Awaiting Customer Response",
      ];
      return (
        closing >= today &&
        closing <= thirtyDaysFromNow &&
        qualifyingStatuses.includes(e.status)
      );
    })
    .sort(
      (a, b) =>
        new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime(),
    );

  // Compute metrics from filtered entries when date filter is active
  const computedTotalTCV = hasDateFilter
    ? filteredEntries.reduce((s, e) => s + e.tcv, 0)
    : stats.totalTCV;
  const computedTotalEntries = hasDateFilter
    ? filteredEntries.length
    : Number(stats.totalEntries);
  const computedNewCount = hasDateFilter
    ? filteredEntries.filter((e) => e.statusGroup === "New").length
    : Number(stats.countByStatusGroup.new);
  const computedInProgressCount = hasDateFilter
    ? filteredEntries.filter((e) => e.statusGroup === "In Progress").length
    : Number(stats.countByStatusGroup.inProgress);
  const computedClosedCount = hasDateFilter
    ? filteredEntries.filter((e) => e.statusGroup === "Closed").length
    : Number(stats.countByStatusGroup.closed);

  const computedNewTCV = hasDateFilter
    ? filteredEntries
        .filter((e) => e.statusGroup === "New")
        .reduce((s, e) => s + e.tcv, 0)
    : stats.tcvByStatusGroup.new;
  const computedInProgressTCV = hasDateFilter
    ? filteredEntries
        .filter((e) => e.statusGroup === "In Progress")
        .reduce((s, e) => s + e.tcv, 0)
    : stats.tcvByStatusGroup.inProgress;
  const computedClosedTCV = hasDateFilter
    ? filteredEntries
        .filter((e) => e.statusGroup === "Closed")
        .reduce((s, e) => s + e.tcv, 0)
    : stats.tcvByStatusGroup.closed;

  const closedWonTCV = filteredEntries
    .filter((e) => e.statusGroup === "Closed" && e.status === "Closed Won")
    .reduce((sum, e) => sum + e.tcv, 0);

  const closedOtherTCV = computedClosedTCV - closedWonTCV;

  // In Progress split — computed independently (an entry can appear in both)
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const threeMonthsAgoStr = threeMonthsAgo.toISOString().split("T")[0]; // YYYY-MM-DD

  const inProgressEntries = filteredEntries.filter(
    (e) => e.statusGroup === "In Progress",
  );

  // Part 1: TCV < $500,000
  const inProgressPart1TCV = inProgressEntries
    .filter((e) => e.tcv < 500000)
    .reduce((sum, e) => sum + e.tcv, 0);

  // Part 2: TCV >= $500,000 OR older than 3 months
  const inProgressPart2TCV = inProgressEntries
    .filter((e) => e.tcv >= 500000 || e.receivedDate < threeMonthsAgoStr)
    .reduce((sum, e) => sum + e.tcv, 0);

  // Lead source metrics
  const computedLeadSources = [
    {
      label: "Sales Lead",
      count: hasDateFilter
        ? filteredEntries.filter((e) => e.leadSource === "Sales Lead").length
        : Number(stats.countByLeadSource.salesLead),
      tcv: hasDateFilter
        ? filteredEntries
            .filter((e) => e.leadSource === "Sales Lead")
            .reduce((s, e) => s + e.tcv, 0)
        : stats.tcvByLeadSource.salesLead,
    },
    {
      label: "Marketing Lead",
      count: hasDateFilter
        ? filteredEntries.filter((e) => e.leadSource === "Marketing Lead")
            .length
        : Number(stats.countByLeadSource.marketingLead),
      tcv: hasDateFilter
        ? filteredEntries
            .filter((e) => e.leadSource === "Marketing Lead")
            .reduce((s, e) => s + e.tcv, 0)
        : stats.tcvByLeadSource.marketingLead,
    },
    {
      label: "Account Mining",
      count: hasDateFilter
        ? filteredEntries.filter((e) => e.leadSource === "Account Mining")
            .length
        : Number(stats.countByLeadSource.accountMining),
      tcv: hasDateFilter
        ? filteredEntries
            .filter((e) => e.leadSource === "Account Mining")
            .reduce((s, e) => s + e.tcv, 0)
        : stats.tcvByLeadSource.accountMining,
    },
    {
      label: "Referral",
      count: hasDateFilter
        ? filteredEntries.filter((e) => e.leadSource === "Referral").length
        : Number(stats.countByLeadSource.referral),
      tcv: hasDateFilter
        ? filteredEntries
            .filter((e) => e.leadSource === "Referral")
            .reduce((s, e) => s + e.tcv, 0)
        : stats.tcvByLeadSource.referral,
    },
  ];

  const totalTCVFormatted = formatCurrency(computedTotalTCV);
  const totalEntries = computedTotalEntries;
  const newCount = computedNewCount;
  const inProgressCount = computedInProgressCount;
  const closedCount = computedClosedCount;

  const statusGroups = [
    {
      label: "New",
      count: newCount,
      tcv: computedNewTCV,
      badgeCls: "status-new",
      barColor: "oklch(0.52 0.16 250)",
    },
    {
      label: "In Progress",
      count: inProgressCount,
      tcv: computedInProgressTCV,
      badgeCls: "status-inprogress",
      barColor: "oklch(0.64 0.16 68)",
    },
    {
      label: "Closed",
      count: closedCount,
      tcv: computedClosedTCV,
      badgeCls: "status-closed-won",
      barColor: "oklch(0.52 0.14 155)",
    },
  ];

  const leadSources = computedLeadSources;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-ring" />
          <span className="text-xs text-muted-foreground font-medium">
            Live — auto-refreshes every 8s
          </span>
        </div>
      </div>

      {/* Summary stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Entries"
          value={totalEntries}
          icon={Users}
          colorClass="text-primary"
          bgClass="bg-primary/10"
        />
        <StatCard
          label="Total Pipeline"
          value={totalTCVFormatted}
          sub="TCV"
          icon={TrendingUp}
          colorClass="text-primary"
          bgClass="bg-primary/10"
        />
        <StatCard
          label="New"
          value={newCount}
          sub="Leads"
          icon={Layers}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          sub="Active deals"
          icon={Activity}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
        <StatCard
          label="Closed"
          value={closedCount}
          sub="Decisions made"
          icon={CheckCircle2}
          colorClass="text-green-600"
          bgClass="bg-green-50"
        />
      </div>

      {/* Pipeline Overview heading with date range filter */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-primary" />
            Pipeline Overview
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">
              From
            </span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-xs border border-border rounded-md px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              data-ocid="dashboard.date_from_input"
            />
            <span className="text-xs text-muted-foreground font-medium">
              To
            </span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-xs border border-border rounded-md px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              data-ocid="dashboard.date_to_input"
            />
            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground underline"
                data-ocid="dashboard.date_clear_button"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Pipeline by Status Group */}
      <motion.div variants={itemVariants}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Pipeline by Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusGroups.map(({ label, count, tcv, badgeCls, barColor }) => {
            const pct =
              computedTotalTCV > 0 ? (tcv / computedTotalTCV) * 100 : 0;

            if (label === "In Progress") {
              const inProgressPart1Pct =
                computedTotalTCV > 0
                  ? (inProgressPart1TCV / computedTotalTCV) * 100
                  : 0;
              return (
                <div
                  key={label}
                  className={`rounded-xl p-5 border ${badgeCls} space-y-3`}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <StatusGroupBadge statusGroup="In Progress" size="sm" />
                    <span className="text-xs font-medium opacity-70">
                      {count} {count === 1 ? "entry" : "entries"}
                    </span>
                  </div>

                  {/* Primary value — Part 1 TCV */}
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-display font-bold text-foreground leading-tight">
                      {formatCurrency(inProgressPart1TCV)}
                    </p>
                  </div>

                  {/* Progress bar based on Part 1 % */}
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: barColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${inProgressPart1Pct}%` }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        delay: 0.3,
                      }}
                    />
                  </div>
                  <p className="text-xs opacity-60">
                    {inProgressPart1Pct.toFixed(1)}% of total pipeline
                  </p>

                  {/* Divider + Part 2 in red */}
                  <div className="border-t border-border/50 pt-2 mt-1">
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-base font-display font-semibold text-red-600">
                        {formatCurrency(
                          inProgressPart2TCV > 0 ? inProgressPart2TCV : 0,
                        )}
                      </p>
                      <p className="text-[11px] text-red-500 font-medium">
                        stale
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            if (label === "Closed") {
              const closedWonPct =
                computedTotalTCV > 0
                  ? (closedWonTCV / computedTotalTCV) * 100
                  : 0;
              return (
                <div
                  key={label}
                  className={`rounded-xl p-5 border ${badgeCls} space-y-3`}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <StatusGroupBadge statusGroup="Closed" size="sm" />
                    <span className="text-xs font-medium opacity-70">
                      {count} {count === 1 ? "entry" : "entries"}
                    </span>
                  </div>

                  {/* Primary value — Closed Won TCV */}
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-display font-bold text-foreground leading-tight">
                      {formatCurrency(closedWonTCV)}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Closed Won
                    </p>
                  </div>

                  {/* Progress bar based on Closed Won % */}
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: barColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${closedWonPct}%` }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        delay: 0.3,
                      }}
                    />
                  </div>
                  <p className="text-xs opacity-60">
                    {closedWonPct.toFixed(1)}% of total pipeline · Closed Won
                  </p>

                  {/* Divider + Other Closed in red */}
                  <div className="border-t border-border/50 pt-2 mt-1">
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-base font-display font-semibold text-red-600">
                        {formatCurrency(
                          closedOtherTCV > 0 ? closedOtherTCV : 0,
                        )}
                      </p>
                      <p className="text-[11px] text-red-500 font-medium">
                        other closed
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={label}
                className={`rounded-xl p-5 border ${badgeCls} space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <StatusGroupBadge statusGroup={label} size="sm" />
                  <span className="text-xs font-medium opacity-70">
                    {count} {count === 1 ? "entry" : "entries"}
                  </span>
                </div>
                <p className="text-2xl font-display font-bold">
                  {formatCurrency(tcv)}
                </p>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: barColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                  />
                </div>
                <p className="text-xs opacity-60">
                  {pct.toFixed(1)}% of total pipeline
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Pipeline by Lead Source */}
      <motion.div variants={itemVariants}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Pipeline by Lead Source
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {leadSources.map(({ label, count, tcv }) => {
            const pct =
              computedTotalTCV > 0 ? (tcv / computedTotalTCV) * 100 : 0;
            return (
              <div
                key={label}
                className="bg-card border border-border rounded-xl p-4 space-y-2 card-hover cursor-default"
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  {label}
                </p>
                <p className="text-xl font-display font-bold text-foreground">
                  {formatCurrency(tcv)}
                </p>
                <div className="h-1 rounded-full bg-border overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {count} {count === 1 ? "lead" : "leads"} · {pct.toFixed(1)}%
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Upcoming Closings */}
      <motion.div variants={itemVariants}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Upcoming Closings (next 30 days)
        </h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {upcomingClosings.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              No closings in the next 30 days
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Account
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Potential
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Sales Person
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Closing
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      TCV
                    </th>
                    <th className="px-4 py-3 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {upcomingClosings.map((entry) => (
                    <tr
                      key={String(entry.id)}
                      className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {entry.accountName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate text-xs">
                        {entry.potential}
                      </td>
                      <td className="px-4 py-3">
                        <StatusGroupBadge
                          statusGroup={entry.statusGroup}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {entry.salesPerson}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(entry.closingDate)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground whitespace-nowrap">
                        {formatCurrency(entry.tcv)}
                      </td>
                      <td className="px-4 py-3">
                        {entry.zcrmLink && (
                          <a
                            href={entry.zcrmLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Entries */}
      <motion.div variants={itemVariants}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Recent Entries
        </h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {stats.recentEntries.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              No entries yet
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {stats.recentEntries.map((entry) => (
                <li
                  key={String(entry.id)}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-accent/20 transition-colors gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {entry.accountName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.potential} · {entry.leadSource} ·{" "}
                      {entry.salesPerson}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(entry.tcv)}
                    </span>
                    <StatusGroupBadge
                      statusGroup={entry.statusGroup}
                      size="sm"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
