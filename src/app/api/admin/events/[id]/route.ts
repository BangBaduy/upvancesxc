import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// DELETE — hapus event berdasarkan ID
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as { data: { role: string } | null }
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabase.from('events').delete().eq('id', id).select()
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

// PATCH — update event
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as { data: { role: string } | null }
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    
    // Pisahkan field organizer dan event
    const { 
      organizer_name, 
      organizer_logo_url,
      ...eventFields 
    } = body

    // Handle organizer update/link jika ada
    let organizer_id = eventFields.organizer_id;
    if (organizer_name?.trim()) {
      const { data: existingOrg } = await supabase
        .from('organizers')
        .select('id')
        .eq('profile_id', user.id)
        .eq('org_name', organizer_name.trim())
        .maybeSingle()

      if (existingOrg) {
        organizer_id = (existingOrg as any).id;
        if (organizer_logo_url) {
          await (supabase.from('organizers') as any).update({ org_logo_url: organizer_logo_url.trim() }).eq('id', (existingOrg as any).id)
        }
      } else {
        const { data: orgData } = await (supabase.from('organizers') as any).insert({
          profile_id: user.id,
          org_name: organizer_name.trim(),
          org_logo_url: organizer_logo_url?.trim() || null,
          is_verified: true,
          tier: 'free'
        }).select('id').single()

        if (orgData) {
          organizer_id = (orgData as any).id;
        }
      }
    }

    // Build update object only with valid event columns
    const updateData: any = {};
    const validFields = [
      'title', 'category', 'location', 'is_online', 'is_free', 'price', 
      'start_date', 'deadline', 'event_url', 'description', 'image_url', 
      'is_published', 'is_verified', 'is_featured'
    ];

    validFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    if (organizer_id) {
      updateData.organizer_id = organizer_id;
    }

    const { data, error } = await (supabase
      .from('events') as any)
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) throw error
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Gagal memperbarui event (Tidak ditemukan atau RLS)' }, { status: 403 })
    }
    return NextResponse.json({ success: true, data: data[0] })
  } catch (err) {
    console.error('[PATCH /api/admin/events/[id]]', err)
    return NextResponse.json({ error: 'Gagal memperbarui event' }, { status: 500 })
  }
}
