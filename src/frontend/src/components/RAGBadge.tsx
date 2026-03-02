// Legacy component — kept for compatibility, superseded by StatusBadge
export function RAGBadge({
  rag,
  size = "md",
}: { rag: string; size?: "sm" | "md" }) {
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${padding} bg-secondary border border-border text-muted-foreground`}
    >
      {rag}
    </span>
  );
}
