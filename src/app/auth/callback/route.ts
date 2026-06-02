import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { optimizeCookies } from '@/lib/supabase/cookie-optimizer'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  const rawNext = searchParams.get('next') ?? '/dashboard'
  const safeNext = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const cookiesToApply: any[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookiesToApply.push({ name, value, options })
          },
          remove(name: string, options: any) {
            cookiesToApply.push({ name, value: '', options: { ...options, maxAge: 0 } })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      let redirectTo = safeNext

      // Onboarding check
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!profile) {
        const fullName = (data.user.user_metadata?.full_name as string) || data.user.email?.split('@')[0] || null
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName,
          avatar_url: (data.user.user_metadata?.avatar_url as string) || null,
          role: 'user',
          has_completed_onboarding: false,
        } as any)
        redirectTo = '/onboarding'
      } else if (!profile.has_completed_onboarding) {
        redirectTo = '/onboarding'
      }

      const response = NextResponse.redirect(new URL(redirectTo, origin).toString())

      // Apply all cookies and optimize
      const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL!.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || ''
      const optimizedCookies = optimizeCookies(cookiesToApply, `sb-${projectId}-auth-token`)
      
      for (const c of optimizedCookies) {
        response.cookies.set({ name: c.name, value: c.value, ...c.options })
      }

      return response
    }
    console.error('[CALLBACK EXCHANGE ERROR]:', error)
  }

  return NextResponse.redirect(`${origin}/login?error=callback_failed`)
}