"use server";

import { createClient } from "@/lib/supabase/server";
import { generateWhatsAppLink } from "@/lib/services/whatsapp";

interface LeadData {
  villaId: string | null;
  customerName: string;
  customerPhone: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
}

export async function saveLead(data: LeadData) {
  const supabase = await createClient();

  const { error } = await supabase.from("leads").insert({
    villa_id: data.villaId,
    customer_name: data.customerName,
    customer_phone: data.customerPhone,
    check_in: data.checkIn.toISOString().split("T")[0],
    check_out: data.checkOut.toISOString().split("T")[0],
    total_price: data.totalPrice,
    status: "New",
  });

  if (error) console.error("Failed to save lead:", error.message);

  // Generate WhatsApp notification link for admin
  const waMessage =
    `New booking lead!\n` +
    `Guest: ${data.customerName}\n` +
    `Phone: ${data.customerPhone}\n` +
    `Check-in: ${data.checkIn.toDateString()}\n` +
    `Check-out: ${data.checkOut.toDateString()}\n` +
    `Total: Rp ${data.totalPrice.toLocaleString("id-ID")}`;

  const waLink = generateWhatsAppLink(waMessage);
  return { waLink };
}
