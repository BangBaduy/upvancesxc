import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      full_name, avatar_url, bio,
      phone_number, linkedin_url, portfolio_url,
      institution, major, semester,
    } = body

    if (full_name !== undefined && (typeof full_name !== 'string' || full_name.trim().length < 2)) {
      return NextResponse.json({ error: 'Nama minimal 2 karakter' }, { status: 400 })
    }

    if (avatar_url !== undefined && typeof avatar_url === 'string' && avatar_url.trim().startsWith('data:image/')) {
      return NextResponse.json({ error: 'URL foto profil tidak boleh menggunakan format base64 (data:image/...)' }, { status: 400 })
    }

    const updates: Record<string, string | number | boolean | null> = {
      updated_at: new Date().toISOString()
    }
    if (full_name !== undefined)      updates.full_name      = full_name?.trim() || null
    if (avatar_url !== undefined)     updates.avatar_url     = avatar_url || null
    if (bio !== undefined)            updates.bio            = bio?.trim() || null
    if (phone_number !== undefined)   updates.phone_number   = phone_number?.trim() || null
    if (linkedin_url !== undefined)   updates.linkedin_url   = linkedin_url?.trim() || null
    if (portfolio_url !== undefined)  updates.portfolio_url  = portfolio_url?.trim() || null
    if (institution !== undefined)    updates.institution    = institution?.trim() || null
    if (major !== undefined)          updates.major          = major?.trim() || null
    if (semester !== undefined)       updates.semester       = semester ? Number(semester) : null

    // ── FIX RLS 42501: Cek apakah baris profil sudah ada ──
    // Jika belum ada (user baru), INSERT dulu. Jika sudah ada, UPDATE.
    // Ini menghindari upsert yang melanggar RLS policy UPDATE-only.
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    let dbError: any = null

    if (!existing) {
      // User baru — INSERT baris profil pertama kali
      const { error } = await (supabase as any)
        .from('profiles')
        .insert({ id: user.id, role: 'user', ...updates })
      dbError = error
    } else {
      // User sudah ada — UPDATE saja
      const { error } = await supabase
        .from('profiles')
        .update(updates as never)
        .eq('id', user.id)
      dbError = error
    }

    if (dbError) throw dbError

    // Sync ke user metadata (agar Header avatar dan nama langsung terupdate)
    await supabase.auth.updateUser({
      data: {
        ...(full_name !== undefined && { full_name: full_name?.trim() }),
        ...(avatar_url !== undefined && { avatar_url }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/settings/profile]', err)
    return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 })
  }
}

