import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { optimizeCookies } from './lib/supabase/cookie-optimizer'

const AUTH_ROUTES = new Set([
  '/login', '/register', '/verify-otp', '/forgot-password', '/reset-password',
])
const PROTECTED_PREFIXES = ['/bookmarks']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuthRoute = AUTH_ROUTES.has(pathname)
  const isProtectedRoute = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))

  let supabaseResponse = NextResponse.next({
    request,
  })

  const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]
  const chunkPrefix = `sb-${projectId}-auth-token`

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          const optimized = optimizeCookies(cookiesToSet, chunkPrefix)
          
          // Update request cookies
          optimized.forEach(({ name, value }) => request.cookies.set(name, value))
          // Update response
          supabaseResponse = NextResponse.next({
            request,
          })
          // Apply cookies to response
          optimized.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )


  // 3. Ambil session (TIDAK get user untuk menghindari refresh berlebihan di setiap request publik)
  // Untuk rute yang butuh proteksi ketat (role check), gunakan getUser() di dalam route handler.
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  // 4. Access Control
  if (!user && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (user && isAuthRoute) {
    const rawNext = request.nextUrl.searchParams.get('next') ?? ''
    const safeDest =
      rawNext.startsWith('/') && !rawNext.startsWith('//') && !AUTH_ROUTES.has(rawNext)
        ? rawNext
        : '/dashboard'
    return NextResponse.redirect(new URL(safeDest, request.url))
  }

  // 5. Kembalikan response yang di-sync Supabase
  // Pastikan keamanan dasar:
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}