import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — ambil semua event (published + unpublished), untuk admin
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, category, location, is_online, is_free, price, start_date, deadline, event_url, description, image_url, organizer_name, organizer_logo_url } = body

    if (!title?.trim() || !category) {
      return NextResponse.json({ error: 'Judul dan kategori wajib diisi' }, { status: 400 })
    }

    let organizer_id = null;
    if (organizer_name?.trim()) {
      const { data: orgData, error: orgError } = await supabase.from('organizers').insert({
        profile_id: user.id,
        org_name: organizer_name.trim(),
        org_logo_url: organizer_logo_url?.trim() || null,
        is_verified: true,
        tier: 'free'
      }).select('id').single()

      if (orgData) {
        organizer_id = orgData.id;
      } else if (orgError) {
        console.error('Failed to create organizer:', orgError)
      }
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
      organizer_id: organizer_id,
    } as never).select('id').single()

    if (error) throw error
    return NextResponse.json({ data, success: true })
  } catch (err) {
    console.error('[POST /api/admin/events]', err)
    return NextResponse.json({ error: 'Gagal menambah event' }, { status: 500 })
  }
}

