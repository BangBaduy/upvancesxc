import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { event_id } = await request.json();

    if (!event_id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from('event_registrations')
      .insert({
        profile_id: user.id,
        event_id: event_id
      } as any);

    if (error) {
      // Ignore unique constraint errors if they click multiple times
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: "Already registered" });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
