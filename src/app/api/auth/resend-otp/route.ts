import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email diperlukan' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://upvance.site'}/auth/callback`,
      },
    })

    if (error) {
      console.error('[RESEND OTP ERROR]:', error.message)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'OTP berhasil dikirim ulang' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[RESEND OTP EXCEPTION]:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
