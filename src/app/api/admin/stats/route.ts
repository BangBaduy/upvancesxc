import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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

    // Ambil data untuk Chart Demografi (Profiles)
    const { data: profiles } = await supabase.from('profiles').select('institution, semester, interests')
    
    const kampusCount: Record<string, number> = {}
    const semesterCount: Record<string, number> = {}
    const minatCount: Record<string, number> = {}

    if (profiles) {
      profiles.forEach(p => {
        if (p.institution) kampusCount[p.institution] = (kampusCount[p.institution] || 0) + 1
        if (p.semester) semesterCount[p.semester] = (semesterCount[p.semester] || 0) + 1
        if (p.interests && Array.isArray(p.interests)) {
          p.interests.forEach((m: string) => {
            minatCount[m] = (minatCount[m] || 0) + 1
          })
        }
      })
    }

    // Sort demografi
    const topKampus = Object.entries(kampusCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5)
    const topSemester = Object.entries(semesterCount).map(([name, value]) => ({ name: `Semester ${name}`, value })).sort((a,b) => b.value - a.value).slice(0, 5)
    const topMinat = Object.entries(minatCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5)

    // Ambil data Pendaftaran (Event Registrations)
    // Asumsikan event_registrations punya event_id dan kita butuh detail event (category, organizer_id)
    const { data: registrations } = await supabase
      .from('event_registrations')
      .select(`
        created_at,
        events (
          category,
          organizers ( org_name )
        )
      `)

    const regKategori: Record<string, number> = {}
    const regOrganizer: Record<string, number> = {}
    const trendHarian: Record<string, number> = {}

    // Init 7 hari terakhir
    for(let i=6; i>=0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })
      trendHarian[dateStr] = 0
    }

    if (registrations) {
      registrations.forEach(r => {
        const ev = Array.isArray(r.events) ? r.events[0] : r.events
        if (ev) {
          if (ev.category) regKategori[ev.category] = (regKategori[ev.category] || 0) + 1
          
          const org = Array.isArray(ev.organizers) ? ev.organizers[0] : ev.organizers
          if (org && org.org_name) {
             regOrganizer[org.org_name] = (regOrganizer[org.org_name] || 0) + 1
          }
        }
        
        const d = new Date(r.created_at)
        const dateStr = d.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })
        if (trendHarian[dateStr] !== undefined) {
          trendHarian[dateStr]++
        }
      })
    }

    const chartKategori = Object.entries(regKategori).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value)
    const chartOrganizer = Object.entries(regOrganizer).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5)
    const chartTrend = Object.entries(trendHarian).map(([name, views]) => ({ name, views }))

    return NextResponse.json({
      stats: {
        totalEvents: eventsRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
        pendingEvents: pendingRes.count ?? 0,
        totalBookmarks: bookmarksRes.count ?? 0,
      },
      recentEvents: recentEvents ?? [],
      charts: {
        kampus: topKampus,
        semester: topSemester,
        minat: topMinat,
        kategori: chartKategori,
        organizer: chartOrganizer,
        trend: chartTrend
      }
    })
  } catch (err) {
    console.error('[GET /api/admin/stats]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
