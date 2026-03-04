const NOTIFY_EMAIL = "lakshminarayanap@mobiusservices.com";

export function notifyByEmail(
  action: "added" | "updated" | "deleted",
  details: string,
) {
  const subject = encodeURIComponent(
    `[SalesPulse] Entry ${action}: ${details}`,
  );
  const body = encodeURIComponent(
    `Hello,\n\nA sales entry has been ${action} in SalesPulse.\n\nDetails: ${details}\n\nTime: ${new Date().toLocaleString()}\n\nPlease review the changes at your convenience.`,
  );
  window.open(
    `mailto:${NOTIFY_EMAIL}?subject=${subject}&body=${body}`,
    "_blank",
  );
}
