import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Hitung stats platform
    const [eventsRes, usersRes, pendingRes, bookmarksRes] = await Promise.all([
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('is_published', false),
      supabase.from('bookmarks').select('id', { count: 'exact', head: true }),
    ])

    // Ambil 5 event terbaru
    const { data: recentEvents } = await supabase
      .from('events')
      .select('id, title, category, is_published, is_verified, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      stats: {
        totalEvents: eventsRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
        pendingEvents: pendingRes.count ?? 0,
        totalBookmarks: bookmarksRes.count ?? 0,
      },
      recentEvents: recentEvents ?? [],
    })
  } catch (err) {
    console.error('[GET /api/admin/stats]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
