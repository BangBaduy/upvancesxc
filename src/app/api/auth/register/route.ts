import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkPasswordStrength } from '@/lib/passwordUtils'

// checkPasswordStrength diimport dari lib/passwordUtils (shared dengan sisi klien)

// ============================================
// VALIDASI INPUT
// ============================================
function validateRegisterInput(data: {
  full_name?: string
  email?: string
  password?: string
  confirm_password?: string
}): string | null {
  const { full_name, email, password, confirm_password } = data

  if (!full_name?.trim())          return 'Nama lengkap wajib diisi'
  if (full_name.trim().length < 2) return 'Nama minimal 2 karakter'

  if (!email?.trim())              return 'Email wajib diisi'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email))     return 'Format email tidak valid'

  if (!password)                   return 'Password wajib diisi'
  const strengthInfo = checkPasswordStrength(password)
  if (strengthInfo.strength === 'weak')
    return 'Password terlalu lemah. ' + strengthInfo.feedback.join(', ')

  if (!confirm_password)           return 'Konfirmasi password wajib diisi'
  if (password !== confirm_password)
    return 'Password dan konfirmasi password tidak cocok'

  return null
}

// ============================================
// NOTE: Password strength check sudah dipindahkan ke sisi klien.
// Jangan pernah menerima password melalui GET/query param (tersimpan di log & history).
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, email, password } = body

    const validationError = validateRegisterInput(body)
    if (validationError) {
      return NextResponse.json(
        { data: null, error: validationError },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: { full_name: full_name.trim() }
      }
    })

    if (error) {
      console.error('Supabase signup error:', error)
      if (error.message.includes('already registered') || error.status === 422) {
        return NextResponse.json({
          data: null,
          error: null,
          message: 'Proses registrasi diterima. Silakan cek email kamu untuk langkah verifikasi akun.',
        }, { status: 200 })
      }
      return NextResponse.json(
        { data: null, error: error.message || 'Gagal melakukan registrasi' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: {
        user: data.user ? { id: data.user.id, email: data.user.email } : null,
      },
      error: null,
      message: 'Registrasi berhasil! Cek email kamu untuk verifikasi.',
    })

  } catch (err: unknown) {
    console.error('[CRITICAL - POST /api/auth/register]:', err)
    return NextResponse.json(
      { data: null, error: 'Terjadi kesalahan pada server internal' },
      { status: 500 }
    )
  }
}