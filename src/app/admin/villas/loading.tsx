export default function VillasLoading() {
  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="admin-surface h-20 animate-pulse bg-slate-100" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="admin-surface h-24 animate-pulse bg-slate-100" />
        ))}
      </div>
      <div className="admin-surface h-[560px] animate-pulse bg-slate-100" />
    </div>
  );
}
