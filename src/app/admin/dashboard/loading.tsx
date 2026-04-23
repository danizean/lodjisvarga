export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="admin-surface h-20 animate-pulse bg-slate-100" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="admin-surface h-28 animate-pulse bg-slate-100" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="admin-surface h-64 animate-pulse bg-slate-100" />
        <div className="admin-surface h-64 animate-pulse bg-slate-100" />
      </div>
    </div>
  );
}
