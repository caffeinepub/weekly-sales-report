import { StatusGroupBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/useQueries";
import { formatCurrency, formatDate } from "@/utils/format";
import {
  Activity,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  TrendingUp,
  Users,
} from "lucide-react";
import { type Variants, motion } from "motion/react";

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
  const { data: stats, isLoading, isError } = useDashboardStats();

  if (isLoading) return <LoadingSkeleton />;

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <AlertCircle className="w-10 h-10 opacity-40" />
        <p className="text-sm">Failed to load dashboard. Retrying…</p>
      </div>
    );
  }

  const totalTCVFormatted = formatCurrency(stats.totalTCV);
  const totalEntries = Number(stats.totalEntries);
  const newCount = Number(stats.countByStatusGroup.new);
  const inProgressCount = Number(stats.countByStatusGroup.inProgress);
  const closedCount = Number(stats.countByStatusGroup.closed);

  const statusGroups = [
    {
      label: "New",
      count: newCount,
      tcv: stats.tcvByStatusGroup.new,
      badgeCls: "status-new",
      barColor: "oklch(0.52 0.16 250)",
    },
    {
      label: "In Progress",
      count: inProgressCount,
      tcv: stats.tcvByStatusGroup.inProgress,
      badgeCls: "status-inprogress",
      barColor: "oklch(0.64 0.16 68)",
    },
    {
      label: "Closed",
      count: closedCount,
      tcv: stats.tcvByStatusGroup.closed,
      badgeCls: "status-closed-won",
      barColor: "oklch(0.52 0.14 155)",
    },
  ];

  const leadSources = [
    {
      label: "Sales Lead",
      count: Number(stats.countByLeadSource.salesLead),
      tcv: stats.tcvByLeadSource.salesLead,
    },
    {
      label: "Marketing Lead",
      count: Number(stats.countByLeadSource.marketingLead),
      tcv: stats.tcvByLeadSource.marketingLead,
    },
    {
      label: "Account Mining",
      count: Number(stats.countByLeadSource.accountMining),
      tcv: stats.tcvByLeadSource.accountMining,
    },
    {
      label: "Referral",
      count: Number(stats.countByLeadSource.referral),
      tcv: stats.tcvByLeadSource.referral,
    },
  ];

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

      {/* Pipeline by Status Group */}
      <motion.div variants={itemVariants}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Pipeline by Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusGroups.map(({ label, count, tcv, badgeCls, barColor }) => {
            const pct = stats.totalTCV > 0 ? (tcv / stats.totalTCV) * 100 : 0;
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
            const pct = stats.totalTCV > 0 ? (tcv / stats.totalTCV) * 100 : 0;
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
          {stats.upcomingClosings.length === 0 ? (
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
                  {stats.upcomingClosings.map((entry) => (
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
