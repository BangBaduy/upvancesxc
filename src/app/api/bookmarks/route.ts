import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET: 
//  - Tanpa event_id → kembalikan semua bookmark user (untuk halaman /bookmarks)
//  - Dengan event_id → cek apakah event sudah di-bookmark
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ bookmarked: false, data: [], error: null })
    }

    const eventId = request.nextUrl.searchParams.get('event_id')

    // Mode: cek satu event
    if (eventId) {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('profile_id', user.id)
        .eq('event_id', eventId)
        .maybeSingle()
      return NextResponse.json({ bookmarked: !!data, error: null })
    }

    // Mode: ambil semua bookmark dengan detail event
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        id,
        created_at,
        event:events (
          id, title, slug, category, location, is_online, is_free, price,
          start_date, deadline, image_url, event_url, is_published,
          organizers(org_name, org_logo_url)
        )
      `)
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Filter hanya event yang masih published (is_published === true)
    const validBookmarks = (data ?? []).filter(b => {
      const ev = (b as any).event
      return ev && ev.is_published === true
    })

    return NextResponse.json({ data: validBookmarks, error: null }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  } catch (err) {
    console.error('[GET /api/bookmarks]', err)
    return NextResponse.json({ data: [], error: 'Server error' }, { status: 500 })
  }
}

// POST: Toggle bookmark (add/remove)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Login diperlukan untuk bookmark' }, { status: 401 })
    }

    const { event_id } = await request.json()
    if (!event_id) {
      return NextResponse.json({ error: 'event_id required' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('profile_id', user.id)
      .eq('event_id', event_id)
      .maybeSingle()

    if (existing) {
      await supabase.from('bookmarks').delete().eq('id', (existing as any).id)
      return NextResponse.json({ bookmarked: false, message: 'Bookmark dihapus' })
    } else {
      const { error } = await supabase.from('bookmarks').insert({
        profile_id: user.id,
        event_id,
      } as any)
      if (error) throw error
      return NextResponse.json({ bookmarked: true, message: 'Event di-bookmark' })
    }
  } catch {
    return NextResponse.json({ error: 'Gagal mengubah bookmark' }, { status: 500 })
  }
}
