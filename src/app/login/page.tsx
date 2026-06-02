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
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 z-20">
            <Link href="/">
              <div className="w-[120px] h-[48px] relative">
                <Image src="/Logo.png" alt="Upvance Logo" fill className="object-contain" />
              </div>
            </Link>
          </div>

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
              <div className="w-full max-w-[301px] bg-amber-50 border border-amber-200 rounded-[10px] px-3 py-2 mb-3">
                <p className="text-[11px] text-amber-700 text-center">Sesi kamu di-reset. Silakan login kembali.</p>
              </div>
            )}

            {(oauthError || error) && (
              <div className="w-full max-w-[301px] bg-red-50 border border-red-200 rounded-[10px] px-3 py-2 mb-3">
                <p className="text-[11px] text-red-600 text-center">{oauthError ? "Gagal login dengan Google." : error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full max-w-[301px] flex flex-col gap-[15px]" noValidate>
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
                  <button type="button" className="w-full h-[46px] bg-white text-gray-700 border border-gray-200 font-bold text-[14px] rounded-[12px] hover:bg-gray-50 transition-all">Belum punya akun? Daftar</button>
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={handleGoogleLogin} className="h-[46px] flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-[12px] hover:bg-gray-50 transition-all">
                    <div className="w-[18px] h-[18px] flex items-center justify-center bg-red-100 rounded-full"><span className="text-red-500 font-bold text-[11px]">G</span></div>
                    <span className="text-[13px] font-semibold text-gray-700">Google</span>
                  </button>
                  <button type="button" disabled className="h-[46px] flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-[12px] opacity-50 cursor-not-allowed">
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
