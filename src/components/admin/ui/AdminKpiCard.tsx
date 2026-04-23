import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminKpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  href: string;
  tone?: "primary" | "success" | "warning" | "info";
}

const toneMap: Record<NonNullable<AdminKpiCardProps["tone"]>, { icon: string; chip: string }> = {
  primary: {
    icon: "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]",
    chip: "text-[var(--admin-primary)]",
  },
  success: {
    icon: "bg-[var(--admin-success-soft)] text-[var(--admin-success)]",
    chip: "text-[var(--admin-success)]",
  },
  warning: {
    icon: "bg-[var(--admin-warning-soft)] text-[var(--admin-warning)]",
    chip: "text-[var(--admin-warning)]",
  },
  info: {
    icon: "bg-[var(--admin-info-soft)] text-[var(--admin-info)]",
    chip: "text-[var(--admin-info)]",
  },
};

export function AdminKpiCard({
  label,
  value,
  icon: Icon,
  href,
  tone = "primary",
}: AdminKpiCardProps) {
  const config = toneMap[tone];

  return (
    <Link href={href} className="admin-kpi-card group">
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", config.icon)}>
          <Icon className="h-4 w-4" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-500" />
      </div>
      <div className="space-y-1">
        <p className={cn("text-2xl font-semibold tabular-nums text-slate-900", config.chip)}>
          {value.toLocaleString("id-ID")}
        </p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </Link>
  );
}
