import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — ambil semua event (published + unpublished), untuk admin
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('events')
      .select('id, title, category, is_published, is_verified, is_free, price, start_date, deadline, created_at, location')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/admin/events]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST — tambah event baru
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const body = await request.json()
    const { title, category, location, is_online, is_free, price, start_date, deadline, event_url, description, image_url } = body

    if (!title?.trim() || !category) {
      return NextResponse.json({ error: 'Judul dan kategori wajib diisi' }, { status: 400 })
    }

    const slug = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()

    const { data, error } = await supabase.from('events').insert({
      title: title.trim(),
      slug,
      category,
      location: location?.trim() || null,
      is_online: is_online ?? false,
      is_free: is_free ?? true,
      price: price ?? 0,
      start_date: start_date || null,
      deadline: deadline || null,
      event_url: event_url?.trim() || null,
      description: description?.trim() || null,
      image_url: image_url?.trim() || null,
      is_published: true,
      is_verified: true,
      is_featured: false,
      organizer_id: null,
    } as never).select('id').single()

    if (error) throw error
    return NextResponse.json({ data, success: true })
  } catch (err) {
    console.error('[POST /api/admin/events]', err)
    return NextResponse.json({ error: 'Gagal menambah event' }, { status: 500 })
  }
}
