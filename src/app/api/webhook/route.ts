import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // TODO: Handle payment/external webhooks
  // Verify signature, update booking status in Supabase
  const body = await req.json();
  console.log("Webhook received:", body);
  return NextResponse.json({ received: true });
}
