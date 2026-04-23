import { cn } from "@/lib/utils";

interface AdminPageShellProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AdminPageShell({
  title,
  description,
  actions,
  children,
  className,
}: AdminPageShellProps) {
  return (
    <section className={cn("admin-page-shell", className)}>
      <header className="admin-page-header">
        <div className="space-y-1">
          <h1 className="admin-h1">{title}</h1>
          <p className="admin-body">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}

interface AdminSectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AdminSection({
  title,
  description,
  action,
  children,
  className,
}: AdminSectionProps) {
  return (
    <section className={cn("admin-surface", className)}>
      <div className="admin-section-header">
        <div className="space-y-1">
          <h2 className="admin-h2">{title}</h2>
          {description ? <p className="admin-caption">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

interface AdminEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function AdminEmptyState({
  title,
  description,
  icon,
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="admin-empty-state">
      {icon ? <div className="text-slate-300">{icon}</div> : null}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
