import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const search     = searchParams.get('search') ?? ''
    // Support single ?category=Lomba dan multi ?categories=Lomba,Seminar
    const category   = searchParams.get('category') ?? ''
    const categories = searchParams.get('categories') ?? ''  // comma-separated
    const is_free    = searchParams.get('is_free')
    const featured   = searchParams.get('featured')
    const limit      = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)
    const page       = Math.max(parseInt(searchParams.get('page') ?? '1'), 1)
    const offset     = (page - 1) * limit

    let query = supabase
      .from('events')
      .select(
        'id, title, slug, category, image_url, location, is_online, is_free, price, start_date, end_date, deadline, is_verified, is_featured, organizer_id, organizers(org_name, org_logo_url)',
        { count: 'exact' }
      )
      .eq('is_published', true)

    if (search) query = query.ilike('title', `%${search}%`)

    // Multi-category: ?categories=Lomba,Seminar → .in('category', ['Lomba','Seminar'])
    if (categories) {
      const cats = categories.split(',').map(c => c.trim()).filter(Boolean)
      if (cats.length === 1) {
        query = query.eq('category', cats[0])
      } else if (cats.length > 1) {
        query = query.in('category', cats)
      }
    } else if (category) {
      // backward compat — single ?category=Lomba
      query = query.eq('category', category)
    }

    if (is_free  !== null && is_free  !== '') query = query.eq('is_free',    is_free  === 'true')
    if (featured !== null && featured !== '') query = query.eq('is_featured', featured === 'true')

    const { data, error, count } = await query
      .order('is_featured', { ascending: false })
      .order('created_at',  { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      data,
      meta: {
        total: count ?? 0,
        page,
        limit,
        total_pages: Math.ceil((count ?? 0) / limit),
      },
      error: null,
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })

  } catch (err) {
    console.error('[GET /api/events]', err)
    return NextResponse.json(
      { data: null, meta: null, error: 'Gagal mengambil data events' },
      { status: 500 }
    )
  }
}