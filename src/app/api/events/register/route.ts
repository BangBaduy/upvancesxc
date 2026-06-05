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

    // ── Tugas 3: Validasi One-Time Registration ──
    // Cek apakah kombinasi (event_id, user_id) sudah ada SEBELUM insert.
    // Jika sudah terdaftar, tolak dengan pesan yang jelas — jangan diam-diam return success.
    const { data: existing, error: checkError } = await (supabase as any)
      .from("event_registrations")
      .select("id")
      .eq("event_id", event_id)
      .eq("profile_id", user.id)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json(
        { error: "Anda sudah terdaftar di acara ini" },
        { status: 400 }
      );
    }

    // Belum terdaftar → lakukan insert
    const { error } = await supabase
      .from("event_registrations")
      .insert({
        profile_id: user.id,
        event_id: event_id,
      } as any);

    if (error) {
      // Tangani race condition (insert duplikat bersamaan)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Anda sudah terdaftar di acara ini" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
