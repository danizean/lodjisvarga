export default function DashboardOverviewPage() {
  return (
    <div className="p-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Dashboard Overview</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards to show that routing works */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-[#3A4A1F]">Rp 45.2M</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active Bookings</h3>
          <p className="mt-2 text-3xl font-bold text-[#3A4A1F]">12</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Available Villas</h3>
          <p className="mt-2 text-3xl font-bold text-[#3A4A1F]">5</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Occupancy Rate</h3>
          <p className="mt-2 text-3xl font-bold text-[#3A4A1F]">86%</p>
        </div>
      </div>
    </div>
  );
}
