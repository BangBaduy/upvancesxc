import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/events/ratings?event_id=xxx
 * Mengambil statistik rating event menggunakan RPC aggregate di server Supabase.
 * Sangat ringan — hanya mengembalikan 1 baris, bukan menarik semua data rating.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const event_id = searchParams.get("event_id");

    if (!event_id) {
      return NextResponse.json({ error: "event_id wajib diisi" }, { status: 400 });
    }

    const supabase = await createClient();

    // Gunakan RPC untuk aggregasi di server (tidak tarik semua baris)
    const { data, error } = await (supabase as any).rpc("get_event_rating_stats", {
      p_event_id: event_id,
    });

    if (error) {
      // Fallback jika RPC belum dibuat: hitung manual dengan select
      const { data: rows, error: fallbackError } = await supabase
        .from("event_ratings" as any)
        .select("rating_value")
        .eq("event_id", event_id);

      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 500 });
      }

      const totalRatings = (rows as any[])?.length ?? 0;
      const average = totalRatings > 0
        ? (rows as any[]).reduce((sum: number, r: any) => sum + r.rating_value, 0) / totalRatings
        : 0;

      const starCounts: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
      (rows as any[]).forEach((r: any) => {
        const key = String(r.rating_value);
        if (key in starCounts) starCounts[key]++;
      });

      return NextResponse.json({
        average_rating: Math.round(average * 10) / 10,
        total_ratings: totalRatings,
        star_counts: starCounts,
      });
    }

    const stats = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({
      average_rating: stats?.average_rating ?? 0,
      total_ratings: stats?.total_ratings ?? 0,
      star_counts: stats?.star_counts ?? { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/events/ratings
 * Body: { event_id: string, rating_value: number (1-5) }
 * Upsert rating: jika user sudah pernah rating event ini → UPDATE, jika belum → INSERT.
 * Constraint UNIQUE(event_id, user_id) di database menjamin integritas.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { event_id, rating_value } = body;

    if (!event_id) {
      return NextResponse.json({ error: "event_id wajib diisi" }, { status: 400 });
    }

    if (!rating_value || rating_value < 1 || rating_value > 5) {
      return NextResponse.json(
        { error: "rating_value harus antara 1 sampai 5" },
        { status: 400 }
      );
    }

    // Upsert: INSERT jika belum ada, UPDATE jika sudah ada (berdasarkan UNIQUE constraint)
    const { error } = await (supabase as any)
      .from("event_ratings")
      .upsert(
        {
          event_id,
          user_id: user.id,
          rating_value: Number(rating_value),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "event_id,user_id", // match UNIQUE constraint di DB
          ignoreDuplicates: false,        // pastikan UPDATE (bukan skip)
        }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Rating berhasil disimpan" });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * GET /api/events/ratings/my?event_id=xxx
 * Cek apakah user sudah memberi rating di event ini
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const event_id = searchParams.get("event_id");

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !event_id) {
      return NextResponse.json({ my_rating: null });
    }

    const { data } = await (supabase as any)
      .from("event_ratings")
      .select("rating_value")
      .eq("event_id", event_id)
      .eq("user_id", user.id)
      .maybeSingle();

    return NextResponse.json({ my_rating: data?.rating_value ?? null });
  } catch {
    return NextResponse.json({ my_rating: null });
  }
}
