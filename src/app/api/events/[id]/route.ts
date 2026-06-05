import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizers (
          id,
          org_name,
          org_logo_url,
          is_verified,
          tier
        )
      `)
      .eq('id', id)
      .eq('is_published', true)
      .single()

    if (error) throw error
    if (!data) {
      return NextResponse.json(
        { data: null, error: 'Event tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, error: null }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })

  } catch (err) {
    console.error('[GET /api/events/[id]]', err)
    return NextResponse.json(
      { data: null, error: 'Gagal mengambil detail event' },
      { status: 500 }
    )
  }
}