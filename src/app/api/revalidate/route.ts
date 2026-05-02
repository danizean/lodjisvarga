import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify a secret token to ensure only Supabase can call this
    const secret = request.headers.get('x-revalidate-secret');
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const payload = await request.json();
    
    // 2. Revalidate by tag (clears the unstable_cache)
    revalidateTag('villas', "max");
    
    // 3. Revalidate the specific path if you know the slug
    if (payload?.record?.slug) {
      revalidatePath(`/villas/${payload.record.slug}`);
    }
    
    // Revalidate the homepage where Featured Villas live
    revalidatePath('/');

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
