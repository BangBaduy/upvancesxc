import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// DELETE — hapus event berdasarkan ID
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabase.from('events').delete().eq('id', params.id).select()
    if (error) throw error
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Gagal menghapus event (Dicegah oleh aturan RLS)' }, { status: 403 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/events/[id]]', err)
    return NextResponse.json({ error: 'Gagal menghapus event' }, { status: 500 })
  }
}

// PATCH — toggle published / verify
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { data, error } = await supabase.from('events').update(body as never).eq('id', params.id).select()
    if (error) throw error
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Gagal memperbarui event (Dicegah oleh aturan RLS)' }, { status: 403 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/admin/events/[id]]', err)
    return NextResponse.json({ error: 'Gagal memperbarui event' }, { status: 500 })
  }
}
