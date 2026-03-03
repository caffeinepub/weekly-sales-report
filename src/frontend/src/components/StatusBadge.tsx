interface StatusBadgeProps {
  statusGroup: string;
  status?: string;
  size?: "sm" | "md";
  showGroup?: boolean;
}

function getStatusClasses(
  statusGroup: string,
  status?: string,
): { badge: string; dot: string } {
  if (statusGroup === "New") {
    return { badge: "status-new", dot: "status-dot-new" };
  }
  if (statusGroup === "In Progress") {
    return { badge: "status-inprogress", dot: "status-dot-inprogress" };
  }
  // Closed sub-statuses
  if (status === "Closed Won") {
    return { badge: "status-closed-won", dot: "status-dot-closed-won" };
  }
  if (status === "Closed Lost") {
    return { badge: "status-closed-lost", dot: "status-dot-closed-lost" };
  }
  return { badge: "status-closed-other", dot: "status-dot-closed-other" };
}

export function StatusBadge({
  statusGroup,
  status,
  size = "md",
  showGroup = false,
}: StatusBadgeProps) {
  const { badge, dot } = getStatusClasses(statusGroup, status);
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <div className="flex flex-col gap-0.5 items-start">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${padding} ${badge}`}
      >
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`}
        />
        {statusGroup}
      </span>
      {status && (
        <span className="text-xs text-muted-foreground pl-1 leading-tight whitespace-nowrap">
          {status}
        </span>
      )}
      {showGroup && !status && (
        <span className="text-xs text-muted-foreground pl-1 leading-tight">
          {statusGroup}
        </span>
      )}
    </div>
  );
}

export function StatusGroupBadge({
  statusGroup,
  size = "md",
}: { statusGroup: string; size?: "sm" | "md" }) {
  const { badge, dot } = getStatusClasses(statusGroup);
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${padding} ${badge}`}
    >
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`}
      />
      {statusGroup}
    </span>
  );
}
