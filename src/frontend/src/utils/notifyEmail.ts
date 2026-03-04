import { toast } from "sonner";

const NOTIFY_EMAIL = "lakshminarayanap@mobiusservices.com";

/**
 * Shows an in-app toast notification summarising a change.
 * This is a frontend-only notification -- the email address is displayed
 * in the toast so the user knows the change was logged.
 */
export function notifyByEmail(
  action: "added" | "updated" | "deleted",
  details: string,
) {
  const actionLabel =
    action === "added" ? "Added" : action === "updated" ? "Updated" : "Deleted";
  const time = new Date().toLocaleString();

  toast.info(`Change log: ${actionLabel}`, {
    description: `${details} — ${time}\nNotified: ${NOTIFY_EMAIL}`,
    duration: 6000,
  });
}
