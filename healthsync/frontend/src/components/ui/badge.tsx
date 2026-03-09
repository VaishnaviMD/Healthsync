import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
  warning: "bg-amber-500/10 text-amber-600",
  outline: "border border-border text-muted-foreground",
};

export function Badge({ children, variant = "default", className }: { children: React.ReactNode; variant?: string; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant], className)}>{children}</span>;
}
