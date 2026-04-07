import Link from "next/link";
import { getAdminVillasWithRooms } from "@/lib/queries/villas";
import { formatIDR } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Edit2, LayoutDashboard, Building } from "lucide-react";
import { Container } from "@/components/shared/Container";

export const dynamic = "force-dynamic";

export default async function OTAVillaDashboard() {
  const villas = await getAdminVillasWithRooms();

  return (
    <Container className="py-8 space-y-8 bg-[#F7F6F2] min-h-screen">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-[#3A4A1F]/10 p-3 rounded-xl">
             <Building className="w-6 h-6 text-[#3A4A1F]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Property Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage OTA listings, accommodations, and room inventory.</p>
          </div>
        </div>
        <Link href="/admin/villas/new">
          <Button className="bg-[#3A4A1F] hover:bg-[#6E8F3B] text-white rounded-xl shadow-md transition-all">
            + New Property
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
                <th className="px-6 py-4">Property Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Accommodations (Room Types)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {villas.map((villa) => {
                const totalInventory = villa.room_types.reduce((acc: number, rt: any) => acc + 1, 0);
                
                return (
                  <tr key={villa.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 align-top">
                      <div className="font-semibold text-gray-900 text-base">{villa.name}</div>
                      <div className="text-xs text-gray-500 font-light mt-1 flex flex-col gap-0.5">
                         <span>📍 {villa.address || "No address"}</span>
                         <span>📞 {villa.whatsapp_number || "-"}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 align-top">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        villa.status === 'Published' 
                          ? 'bg-[#A8BFA3]/20 text-[#3A4A1F]' 
                          : villa.status === 'Maintenance' ? 'bg-orange-100/50 text-orange-800' : 'bg-yellow-100/50 text-yellow-800'
                      }`}>
                        {villa.status || 'Draft'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 align-top">
                      {villa.room_types.length > 0 ? (
                        <div className="space-y-3">
                          <div className="text-xs text-gray-500 font-medium mb-1 border-b border-gray-100 pb-1 inline-block">
                            Room Configurations: {totalInventory} Types
                          </div>
                          {villa.room_types.map((rt: any) => (
                            <div key={rt.id} className="text-sm bg-white border border-gray-100 p-2 rounded-lg shadow-sm">
                              <div className="font-semibold text-[#1A1A1A] flex items-center justify-between">
                                 <span>{rt.name}</span>
                              </div>
                              <div className="text-xs text-[#3A4A1F] font-medium mt-1">{formatIDR(rt.base_price)} / night</div>
                              <div className="text-xs text-gray-500 mt-0.5">Adult Cap: {rt.capacity_adult} Pax</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs italic text-gray-400">No rooms configured</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-right align-top">
                      <Link href={`/admin/villas/${villa.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-9 px-4 text-[#3A4A1F] border-[#A8BFA3]/30 hover:bg-[#A8BFA3]/10 font-semibold rounded-xl">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Manage Rooms
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {villas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 bg-gray-50 rounded-b-2xl">
                    No properties found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
