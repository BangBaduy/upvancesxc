"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthSidebar from "@/components/organism/AuthSidebar";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const AUTH_ROUTE_SET = new Set(['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'])
  const rawNext = searchParams.get("next") || ""
  const nextPath = (rawNext.startsWith('/') && !rawNext.startsWith('//') && !AUTH_ROUTE_SET.has(rawNext))
    ? rawNext
    : "/dashboard"

  const sessionReset = searchParams.get("reason") === "session_reset"
  const oauthError = searchParams.get("error");

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!form.email.trim()) { setError("Email wajib diisi"); setIsLoading(false); return; }
    if (!form.password) { setError("Password wajib diisi"); setIsLoading(false); return; }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || "Email atau password salah");
        setIsLoading(false);
        return;
      }
      router.replace(nextPath);
    } catch {
      setError("Gagal terhubung ke server.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => { window.location.href = "/api/auth/google"; };

  const inputClass =
    "w-full h-[46px] px-[20px] bg-white rounded-[12px] border border-gray-200 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10 outline-none text-[14px] text-gray-900 placeholder:text-gray-400 transition-all";

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-x-hidden font-['Inter',sans-serif]">
      <div className="flex-1 lg:flex-none w-full lg:max-w-full flex min-h-screen relative overflow-hidden">
        <AuthSidebar />

        <div className="flex-1 relative flex flex-col items-center justify-center p-4 md:p-12 overflow-y-auto bg-white min-h-screen">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image src="/background-auth.png" alt="Background" fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 60vw" />
          </div>

          {/* Decorative Shapes */}
          <div className="absolute top-[5%] right-[2%] w-[15vw] max-w-[200px] aspect-square bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-2xl pointer-events-none z-0" />
          <div className="absolute bottom-[5%] right-[2%] w-[18vw] max-w-[250px] aspect-square bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
          <div className="absolute top-[8%] left-[10%] w-[18vw] max-w-[300px] aspect-square bg-gradient-to-bl from-green-400/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

          {/* Login Card */}
          <div className="w-full max-w-[450px] bg-white/95 backdrop-blur-2xl border border-white/50 rounded-[24px] p-6 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative z-10 flex flex-col items-center">
            <h2 className="text-[22px] md:text-[26px] font-bold text-center text-gray-900 mb-6 md:mb-8">
              Masuk ke Akun Anda
            </h2>

            {sessionReset && (
              <div className="w-full sm:max-w-[320px] md:max-w-[360px] bg-amber-50 border border-amber-200 rounded-[10px] px-3 py-2 mb-3">
                <p className="text-[11px] text-amber-700 text-center">Sesi kamu di-reset. Silakan login kembali.</p>
              </div>
            )}

            {(oauthError || error) && (
              <div className="w-full sm:max-w-[320px] md:max-w-[360px] bg-red-50 border border-red-200 rounded-[10px] px-3 py-2 mb-3">
                <p className="text-[11px] text-red-600 text-center">{oauthError ? "Gagal login dengan Google." : error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full sm:max-w-[320px] md:max-w-[360px] flex flex-col gap-[15px]" noValidate>
              <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required disabled={isLoading} className={inputClass} />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Kata Sandi" value={form.password} onChange={handleChange} required disabled={isLoading} className={`${inputClass} pr-10`} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-end -mt-2">
                <Link href="/forgot-password" className="text-[12px] text-black/70 font-normal hover:underline">Lupa Kata Sandi?</Link>
              </div>

              <div className="flex flex-col gap-[13px] mt-2">
                <button type="submit" disabled={isLoading} className="w-full h-[46px] bg-[#2563eb] text-white font-bold text-[14px] rounded-[12px] hover:bg-blue-700 transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] flex items-center justify-center gap-2">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Masuk...</span></> : "Masuk"}
                </button>
                <div className="flex items-center gap-[17px]"><div className="h-[1px] flex-1 bg-black/10" /><span className="text-[12px] text-black font-normal">Atau</span><div className="h-[1px] flex-1 bg-black/10" /></div>
                <Link href="/register" className="block w-full">
                  <button type="button" className="w-full h-[46px] bg-white text-gray-700 border border-gray-200 font-bold text-[13px] md:text-[14px] rounded-[12px] hover:bg-gray-50 transition-all">Belum punya akun? Daftar</button>
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  {/* Google login disabled for public submission */}
                  <button type="button" disabled title="Fitur login Google sedang dalam pemeliharaan" className="h-[46px] flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-[12px] opacity-50 cursor-not-allowed">
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.91c1.71-1.57 2.68-3.88 2.68-6.57z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.24c-.8.54-1.84.87-3.05.87-2.33 0-4.3-1.58-5-3.71H.95v2.3C2.43 15.89 5.5 18 9 18z" fill="#34A853"/>
                      <path d="M4 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.96H.95A8.977 8.977 0 0 0 0 9c0 1.45.32 2.82.88 4.04l3.12-2.3z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15.1 2.27C13.47.75 11.43 0 9 0 5.5 0 2.43 2.11.95 5.11l3.05 2.34C4.7 5.27 6.67 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    <span className="text-[13px] font-semibold text-gray-700">Google</span>
                  </button>
                  <button type="button" disabled className="h-[46px] flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-[12px] opacity-50 cursor-not-allowed">
                    <svg width="17" height="20" viewBox="0 0 17 20" fill="currentColor" className="text-black">
                      <path d="M14.072 10.612c.01 2.277 1.86 3.037 1.884 3.048-.016.056-.296.966-.944 1.905-.561.815-1.143 1.625-2.054 1.644-1.155.016-1.55-.668-2.887-.668-1.336 0-1.77.649-2.846.685-1.036.037-1.745-.888-2.311-1.701-1.156-1.666-2.04-4.707-.852-6.757.589-1.018 1.704-1.66 2.915-1.678 1.154-.017 2.148.775 2.766.775.617 0 1.767-.938 3.125-.805.568.056 2.164.258 3.188 1.593-.082.048-1.904 1.096-1.884 3.254zM11.554 3.14c.613-.743 1.026-1.773.913-2.803-.884.035-1.957.588-2.59 1.332-.568.653-1.066 1.713-.934 2.716.985.076 1.998-.502 2.611-1.245z"/>
                    </svg>
                    <span className="text-[13px] font-semibold text-gray-700">Apple</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginContent /></Suspense>;
}
