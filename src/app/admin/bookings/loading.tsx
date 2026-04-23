export default function BookingsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="admin-surface h-20 animate-pulse bg-slate-100" />
      <div className="admin-surface h-24 animate-pulse bg-slate-100" />
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="admin-surface h-[460px] animate-pulse bg-slate-100" />
        <div className="admin-surface h-[460px] animate-pulse bg-slate-100" />
      </div>
    </div>
  );
}
